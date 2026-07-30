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

  const { data: profile } = await client.database
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  const { message } = await req.json();
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const groqRes = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are VitaAI, a helpful nutrition and diet assistant. User profile: ${JSON.stringify(profile || {})}. Answer nutrition questions concisely in under 3 sentences. Be encouraging and accurate.`,
        },
        { role: 'user', content: message },
      ],
      temperature: 0.5,
      max_tokens: 200,
    }),
  });

  const data = await groqRes.json();
  if (!groqRes.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'AI service error' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const reply = data.choices?.[0]?.message?.content || 'I apologize, I couldn\'t process that.';
  return new Response(JSON.stringify({ reply }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
