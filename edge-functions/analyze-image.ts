import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function checkIsFood(imageDescription: string): Promise<boolean> {
  const checkRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'You are a food detection assistant. Based on the image description, determine if it contains food, a meal, a dish, ingredients, or something edible. Reply ONLY with a single word: YES or NO.' },
        { role: 'user', content: `Image description: "${imageDescription}". Is this food or a meal?` },
      ],
      temperature: 0.1,
      max_tokens: 10,
    }),
  });

  const data = await checkRes.json();
  if (!checkRes.ok) return true;
  const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase();
  return answer === 'YES';
}

async function analyzeWithMistralOCR(imageUrl: string, language: string): Promise<any> {
  const ocrRes = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        image_url: imageUrl,
      },
    }),
  });

  const ocrData = await ocrRes.json();
  if (!ocrRes.ok) {
    throw new Error(ocrData.error?.message || 'Mistral OCR error');
  }

  const extractedText = ocrData.pages?.map((p: any) => p.markdown || p.text || '').join('\n') || '';
  const imageDescription = extractedText || 'Food image (no text extracted)';

  const isFood = await checkIsFood(imageDescription);
  if (!isFood) {
    throw new Error('NOT_FOOD');
  }

  const analysisPrompt = `You are a professional nutrition analyst. Based on this image description, return a JSON object with:
- "foodName": detected food name (string)
- "calories": total calories per serving (number)
- "protein": protein in grams (number)
- "carbs": carbohydrates in grams (number)
- "fat": fat in grams (number)
- "fiber": fiber in grams (number)
- "sugar": sugar in grams (number)
- "healthScore": 0-100 score based on nutritional value (number)
- "ingredients": list of likely ingredients (array of strings)
- "warnings": any health warnings (array of strings, empty if none)
- "recommendations": healthy eating tips related to this food (array of strings, at least 2-3 tips)
- "voiceResponse": a short spoken summary in ${language || 'English'} (string)

Use realistic nutritional values per standard serving (approx 250-300g). Be accurate and scientific. Provide detailed analysis with at least 3 recommendations.`;

  const analysisRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: analysisPrompt },
        { role: 'user', content: `Describe and analyze this food image: ${imageDescription}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const analysisData = await analysisRes.json();
  if (!analysisRes.ok) {
    throw new Error(analysisData.error?.message || 'Mistral analysis error');
  }

  const content = analysisData.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Mistral analysis');

  return JSON.parse(content);
}

async function analyzeFoodText(foodName: string, language: string): Promise<any> {
  const prompt = `You are a professional nutrition analyst. Analyze the food "${foodName}" and return a JSON object with:
- "foodName": "${foodName}"
- "calories": total calories per serving (number)
- "protein": protein in grams (number)
- "carbs": carbohydrates in grams (number)
- "fat": fat in grams (number)
- "fiber": fiber in grams (number)
- "sugar": sugar in grams (number)
- "healthScore": 0-100 score based on nutritional value (number)
- "ingredients": list of typical ingredients (array of strings)
- "warnings": any health warnings (array of strings, empty if none)
- "recommendations": healthy eating tips related to this food (array of strings, at least 2-3 tips)
- "voiceResponse": a short spoken summary in ${language || 'English'} (string)

Use realistic nutritional values per standard serving (approx 250-300g). Be accurate and scientific.`;

  const analysisRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Analyze the nutritional information for: ${foodName}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await analysisRes.json();
  if (!analysisRes.ok) throw new Error(data.error?.message || 'Mistral analysis error');
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
  const { imageUrl, foodName, language } = body;

  try {
    let analysis;
    if (foodName) {
      analysis = await analyzeFoodText(foodName, language || 'en');
    } else {
      if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'Image URL or food name is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      analysis = await analyzeWithMistralOCR(imageUrl, language || 'en');
    }

    const { data: dbData, error: dbError } = await client.database
      .from('nutrition_analyses')
      .insert([{
        user_id: userData.user.id,
        image_url: imageUrl,
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
    const message = err.message === 'NOT_FOOD'
      ? 'This image does not appear to contain food. Please upload a clear photo of a meal, dish, or ingredients, or type the food name manually.'
      : err.message || 'Analysis failed';
    return new Response(JSON.stringify({ error: message }), {
      status: err.message === 'NOT_FOOD' ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
