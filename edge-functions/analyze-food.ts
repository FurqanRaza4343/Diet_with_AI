import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    accessToken: userToken,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { text, language } = body;

  if (!text) {
    return new Response(JSON.stringify({ error: 'Food text is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = `You are a professional nutrition analyst. Analyze the described food and return a JSON object with:
- "foodName": detected food name (string)
- "calories": total calories (number)
- "protein": protein in grams (number)
- "carbs": carbohydrates in grams (number)
- "fat": fat in grams (number)
- "fiber": fiber in grams (number)
- "sugar": sugar in grams (number)
- "healthScore": 0-100 score based on nutritional value (number)
- "ingredients": list of detected ingredients (array of strings)
- "warnings": any health warnings (array of strings, empty if none)
- "recommendations": healthy eating tips related to this food (array of strings)
- "voiceResponse": a short spoken summary in ${language || 'English'} (string)

Use realistic nutritional values. For a single food item, estimate per serving. For a meal, estimate the full meal. Be accurate and scientific.`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this food: ${text}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) {
      throw new Error(groqData.error?.message || 'Groq API error');
    }

    const content = groqData.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const analysis = JSON.parse(content);

    const { data: dbData, error: dbError } = await client.database
      .from('nutrition_analyses')
      .insert([{
        user_id: userData.user.id,
        input_text: text,
        result: analysis,
        language: language || 'en',
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, data: dbData }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Analysis failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
