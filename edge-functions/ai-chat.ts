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

  const body = await req.json();
  const { message, history } = body;

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = `You are VitaAI, a professional AI nutrition assistant. You help users with:
- Diet and nutrition advice
- Meal planning recommendations
- Calorie and macro guidance
- Healthy eating tips
- Food science and nutrition facts

Keep responses concise, factual, and helpful (2-4 paragraphs max). Never give medical advice. If asked about serious health conditions, recommend consulting a doctor.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text || m.content || '',
    })),
    { role: 'user', content: message },
  ];

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) {
      throw new Error(groqData.error?.message || 'Groq API error');
    }

    const response = groqData.choices?.[0]?.message?.content || 'I apologize, I could not process that request. Please try again.';

    return new Response(JSON.stringify({ response }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Chat failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
