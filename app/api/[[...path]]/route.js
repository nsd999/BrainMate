import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODE_INSTRUCTIONS = {
  kid: 'Explain as if to a curious 8-year-old. Use very simple words, playful comparisons, and short sentences. No jargon at all.',
  student: 'Explain as if to a high-school or early college student. Use clear, educational language. Define any technical terms simply.',
  pro: 'Explain to a working professional. Use precise terminology but still keep it clear. Include nuance and practical depth.'
};

const SYSTEM_PROMPT = `You are BrainMate, an expert AI tutor. Your job is to explain ANY topic with crystal clarity and give the user an actionable plan.

You MUST respond ONLY with a valid JSON object (no markdown, no code fences, no preamble). The JSON MUST match this exact schema:
{
  "simple_explanation": string,           // 2-3 easy sentences
  "real_life_analogy": string,            // a vivid everyday analogy
  "step_by_step": string[],               // 4-7 short bullets that break the concept down
  "summary": string,                      // 1-2 sentence TL;DR
  "action_plan": [                        // 3-5 concrete next steps
    { "step": string, "time": string }    // time e.g. "10 min", "1 hour", "today"
  ]
}

Rules:
- Avoid jargon; if a difficult word is essential, define it inline in plain English.
- Friendly, encouraging tone.
- Keep bullets crisp, no filler.
- Action plan must be practical and specific to the topic (not generic like "read more").
- Return ONLY the JSON, nothing else.`;

function runPythonBridge(payload) {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'lib', 'llm', 'emergent_llm.py');
    const child = spawn('/root/.venv/bin/python3', [script], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`python exit ${code}: ${stderr || stdout}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim().split('\n').pop());
        if (parsed.error) return reject(new Error(parsed.error));
        resolve(parsed.content || '');
      } catch (e) {
        reject(new Error(`bad python output: ${stdout}`));
      }
    });

    // Stdin payload
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function callLLM(topic, mode) {
  const provider = 'openai';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  const userPrompt = `Topic: ${topic}

Audience mode: ${mode.toUpperCase()}
${modeInstruction}

Return ONLY the JSON object described in the system prompt.`;

  const content = await runPythonBridge({
    provider,
    model,
    system_prompt: SYSTEM_PROMPT,
    user_prompt: userPrompt,
    session_id: `brainmate-${Date.now()}`
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    parsed = JSON.parse(match[0]);
  }

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
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  if (route === '' || route === 'health') {
    return NextResponse.json({ ok: true, service: 'BrainMate API', time: new Date().toISOString() });
  }

  return NextResponse.json({ error: 'Not found', route }, { status: 404 });
}

export async function POST(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

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
      const result = await callLLM(topic, mode);
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
