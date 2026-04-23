import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODE_INSTRUCTIONS = {
  kid: 'Explain as if to a curious 8-year-old. Use very simple words, playful comparisons, and short sentences. No jargon at all.',
  student: 'Explain as if to a high-school or early college student. Use clear, educational language. Define any technical terms simply.',
  pro: 'Explain to a working professional. Use precise terminology but still keep it clear. Include nuance and practical depth.'
};

const buildSystemPrompt = () => {
  return `You are BrainMate, an expert AI tutor. Your job is to explain ANY topic with crystal clarity and give the user an actionable plan.\n\nYou MUST respond ONLY with a valid JSON object (no markdown, no code fences, no preamble). The JSON MUST match this exact schema:\n{\n  "simple_explanation": string,           // 2-3 easy sentences\n  "real_life_analogy": string,            // a vivid everyday analogy\n  "step_by_step": string[],               // 4-7 short bullets that break the concept down\n  "summary": string,                      // 1-2 sentence TL;DR\n  "action_plan": [                        // 3-5 concrete next steps\n    { "step": string, "time": string }    // time e.g. "10 min", "1 hour", "today"\n  ]\n}\n\nRules:\n- Avoid jargon; if a difficult word is essential, define it inline in plain English.\n- Friendly, encouraging tone.\n- Keep bullets crisp, no filler.\n- Action plan must be practical and specific to the topic (not generic like "read more").\n- Return ONLY the JSON, nothing else.`;
};

async function callOpenAI(topic, mode) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured on server');
  }

  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  const systemPrompt = buildSystemPrompt();
  const userPrompt = `Topic: ${topic}\n\nAudience mode: ${mode.toUpperCase()}\n${modeInstruction}\n\nNow produce the JSON.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '{}';
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // Try to salvage by extracting JSON block
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    parsed = JSON.parse(match[0]);
  }

  // Basic shape guarantees
  return {
    simple_explanation: parsed.simple_explanation || '',
    real_life_analogy: parsed.real_life_analogy || '',
    step_by_step: Array.isArray(parsed.step_by_step) ? parsed.step_by_step : [],
    summary: parsed.summary || '',
    action_plan: Array.isArray(parsed.action_plan)
      ? parsed.action_plan.map((a) =>
          typeof a === 'string'
            ? { step: a, time: '' }
            : { step: a.step || '', time: a.time || '' }
        )
      : []
  };
}

export async function GET(request, { params }) {
  const path = params?.path || [];
  const route = path.join('/');

  if (route === '' || route === 'health') {
    return NextResponse.json({ ok: true, service: 'BrainMate API', time: new Date().toISOString() });
  }

  return NextResponse.json({ error: 'Not found', route }, { status: 404 });
}

export async function POST(request, { params }) {
  const path = params?.path || [];
  const route = path.join('/');

  try {
    if (route === 'explain') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      if (!topic) {
        return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      }
      if (topic.length > 500) {
        return NextResponse.json({ error: 'topic too long (max 500 chars)' }, { status: 400 });
      }
      const result = await callOpenAI(topic, mode);
      return NextResponse.json({
        topic,
        mode,
        generated_at: new Date().toISOString(),
        ...result
      });
    }

    return NextResponse.json({ error: 'Not found', route }, { status: 404 });
  } catch (err) {
    console.error('[BrainMate API error]', err);
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
