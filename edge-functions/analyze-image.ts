import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function extractJson(text: string): any {
  let cleaned = stripThinkTags(text);
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.substring(start, end + 1)); } catch {}
  }
  throw new Error(`Could not extract JSON. Starts: ${cleaned.substring(0, 200)}`);
}

async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const blob = await resp.arrayBuffer();
  const sizeMB = blob.byteLength / (1024 * 1024);
  if (sizeMB > 3) throw new Error(`Image too large (${sizeMB.toFixed(1)}MB). Max 3MB.`);
  const ct = resp.headers.get('content-type') || 'image/jpeg';
  return `data:${ct};base64,${btoa(String.fromCharCode(...new Uint8Array(blob)))}`;
}

async function groqFetch(body: object, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) return data;
    const msg = data.error?.message || '';
    if (msg.includes('Rate limit') && i < retries - 1) {
      console.error(`Rate limited, retry ${i + 1}/${retries}: ${msg.substring(0, 100)}`);
      await new Promise(r => setTimeout(r, 3000 * (i + 1)));
      continue;
    }
    throw new Error(msg || `API error: ${res.status}`);
  }
  throw new Error('Max retries exceeded');
}

async function analyzeWithGroqVision(imageUrl: string, language: string): Promise<any> {
  const base64Url = await imageUrlToBase64(imageUrl);
  const data = await groqFetch({
    model: 'qwen/qwen3.6-27b',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: `Analyze this food image. Only output valid JSON: {"foodName":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"healthScore":0,"ingredients":[],"warnings":[],"recommendations":[],"voiceResponse":""}. Fill values in ${language || 'English'}.` },
        { type: 'image_url', image_url: { url: base64Url } },
      ],
    }],
    temperature: 0.1,
    max_tokens: 2000,
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq vision');
  return extractJson(content);
}

async function analyzeFoodText(foodName: string, language: string): Promise<any> {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: `Nutrition analyst. Respond in ${language || 'English'}. Return valid JSON.` },
      { role: 'user', content: `Nutrition info for "${foodName}": foodName, calories, protein, carbs, fat, fiber, sugar, healthScore (1-100), ingredients[], warnings[], recommendations[], voiceResponse (${language || 'English'})` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 500,
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');
  return JSON.parse(content);
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;
  if (!userToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!Deno.env.get('GROQ_API_KEY')) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    accessToken: userToken,
  });

  const { data: userData, error: authError } = await client.auth.getCurrentUser();
  if (authError) throw new Error(`Auth failed: ${authError.message}`);
  if (!userData?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { imageUrl, foodName, language } = body;

  try {
    const analysis = foodName
      ? await analyzeFoodText(foodName, language || 'en')
      : !imageUrl
        ? (() => { throw new Error('Image or food name required'); })()
        : await analyzeWithGroqVision(imageUrl, language || 'en');

    const { data: dbData, error: dbError } = await client.database
      .from('nutrition_analyses')
      .insert([{ user_id: userData.user.id, image_url: imageUrl || null, result: analysis, language: language || 'en' }])
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, data: dbData }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('analyze-image error:', err.message?.substring(0, 200));
    return new Response(JSON.stringify({
      error: err.message?.includes('JSON') ? 'Analysis failed' : (err.message || 'Analysis failed'),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
