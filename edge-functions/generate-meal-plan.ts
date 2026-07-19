import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
  const { dietType, goal, targetCalories, allergies, cuisine, mealsPerDay, budget, weekly, weekStart, activityLevel, cookingTime, excludedIngredients } = body;

  const activityDesc = activityLevel ? `Activity level: ${activityLevel.replace('-', ' ')}.` : '';
  const cookingDesc = cookingTime === 'quick' ? 'Prefer quick meals (under 15 minutes prep).' : cookingTime === 'moderate' ? 'Moderate cooking time OK (15-30 minutes).' : '';
  const excludedDesc = excludedIngredients?.length ? `Strictly exclude these ingredients: ${excludedIngredients.join(', ')}.` : '';

  const cuisineFocus = cuisine && cuisine !== 'Any'
    ? `STRICT: All meals MUST be ${cuisine} cuisine. Every recipe must be authentically ${cuisine}. Use traditional ${cuisine} ingredients, spices, and cooking methods.`
    : 'Use a variety of cuisines.';

  const systemPrompt = weekly
    ? `You are a professional nutritionist. Generate a 7-day weekly meal plan for a ${goal || 'maintain'} goal.
Diet type: ${dietType || 'Balanced'}. Target: ${targetCalories || 2000} kcal/day. ${cuisineFocus} Budget: ${budget || 'medium'}.
Allergies/restrictions: ${allergies?.length ? allergies.join(', ') : 'none'}. ${activityDesc} ${cookingDesc} ${excludedDesc}

Return valid JSON (no markdown, no code fences):
{ "days": [{ "day": "Monday", "meals": { "breakfast": { "name", "calories", "protein", "carbs", "fat", "ingredients": [{ "name", "quantity", "category" }] }, "lunch": {...}, "dinner": {...}, "snacks": [{ "name", "calories", "protein", "carbs", "fat" }] }, "totalCalories": number }], "weeklySummary": { "avgCalories": number, "totalProtein": number, "totalCarbs": number, "totalFat": number } }

REQUIREMENTS:
- Each day: breakfast, lunch, dinner, and snacks
- Each meal: name, calories, protein, carbs, fat, ingredients (name + quantity + category)
- Total calories per day ≈ ${targetCalories || 2000} kcal
- All meals must be varied across the week
- Keep response concise - no cooking instructions needed
- ${cuisineFocus}`
    : `You are a professional nutritionist. Generate a VERY DETAILED meal plan with exactly ${mealsPerDay || 3} meals for a ${goal || 'maintain'} goal.
Diet type: ${dietType || 'Balanced'}. Target: ${targetCalories || 2000} kcal. ${cuisineFocus} Budget: ${budget || 'medium'}.
Allergies/restrictions: ${allergies?.length ? allergies.join(', ') : 'none'}. ${activityDesc} ${cookingDesc} ${excludedDesc}

Return valid JSON (no markdown, no code fences):
{ "meals": [{ "name", "type": "breakfast"|"lunch"|"dinner"|"snack", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number, "prepTime": "15 mins", "cookingInstructions": "step by step (2-3 sentences)", "ingredients": [{ "name", "quantity", "category" }] }], "totalCalories": number, "totalProtein": number, "totalCarbs": number, "totalFat": number }

REQUIREMENTS:
- Each meal: name, type, calories, protein, carbs, fat, fiber, sugar, prepTime, cookingInstructions, ingredients (name+quantity+category)
- 3-4+ ingredients per meal with exact quantities (e.g., "200g", "1 cup", "2 tbsp")
- Total calories ≈ ${targetCalories || 2000} kcal
- ${cuisineFocus}`;

  try {
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: weekly
            ? `Create a weekly meal plan starting ${weekStart || 'next Monday'}.`
            : `Create a ${mealsPerDay || 3}-meal plan for ${dietType || 'balanced'} diet.` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: weekly ? 3000 : 4000,
      }),
    });

    const mistralData = await mistralRes.json();
    if (!mistralRes.ok) {
      throw new Error(mistralData.error?.message || 'Mistral API error');
    }

    const content = mistralData.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Mistral');

    const plan = JSON.parse(content);

    if (weekly) {
      const { data: dbData, error: dbError } = await client.database
        .from('weekly_plans')
        .insert([{
          user_id: userData.user.id,
          week_start: weekStart || new Date().toISOString().split('T')[0],
          goal: goal || 'maintain',
          days: plan.days || [],
          weekly_summary: plan.weeklySummary || {},
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      return new Response(JSON.stringify({ success: true, data: dbData }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const { data: dbData, error: dbError } = await client.database
        .from('meal_plans')
        .insert([{
          user_id: userData.user.id,
          meals: plan.meals || [],
          total_calories: plan.totalCalories || 0,
          date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      return new Response(JSON.stringify({ success: true, data: dbData }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
