import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODE_INSTRUCTIONS = {
  kid: 'Explain as if to a curious 8-year-old. Use very simple words, playful comparisons, and short sentences. No jargon at all.',
  student: 'Explain as if to a high-school or early college student. Use clear, educational language. Define any technical terms simply.',
  pro: 'Explain to a working professional. Use precise terminology but still keep it clear. Include nuance and practical depth.'
};

const SECTION_SYSTEM_PROMPT = `You are BrainMate, an expert AI tutor. Your job is to explain ANY topic with crystal clarity and give the user an actionable plan.

You MUST respond using EXACTLY this section-delimited format, in this exact order, with NO markdown, NO code fences, NO extra commentary:

<<SIMPLE>>
A 2-3 sentence very easy explanation.
<<END>>
<<ANALOGY>>
A vivid, everyday real-life analogy (2-3 sentences).
<<END>>
<<STEPS>>
- First bullet
- Second bullet
- Third bullet
- (4-7 total, short, crisp, one per line, each starting with "- ")
<<END>>
<<SUMMARY>>
A 1-2 sentence TL;DR.
<<END>>
<<ACTIONS>>
- [10 min] First concrete action
- [1 hour] Second concrete action
- [today] Third concrete action
- (3-5 total, each line starts with "- [time] " followed by a specific, actionable step)
<<END>>

Rules:
- Start with "<<SIMPLE>>" on its own line. Never skip any section. End every section with "<<END>>" on its own line.
- Avoid jargon; if a difficult word is essential, define it inline in plain English.
- Friendly, encouraging tone. No filler. Action plan must be practical and topic-specific.
- Output nothing outside of these tagged sections.`;

function buildUserPrompt(topic, mode) {
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  return `Topic: ${topic}

Audience mode: ${mode.toUpperCase()}
${modeInstruction}

Produce ONLY the 5 tagged sections described in the system prompt.`;
}

function getLLMConfig() {
  const emergentKey = process.env.EMERGENT_LLM_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const preferred = (process.env.LLM_PROVIDER || 'emergent').toLowerCase();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (preferred === 'openai' && openaiKey) {
    return { baseUrl: 'https://api.openai.com/v1', apiKey: openaiKey, model };
  }
  if (emergentKey) {
    return { baseUrl: 'https://integrations.emergentagent.com/llm', apiKey: emergentKey, model };
  }
  if (openaiKey) {
    return { baseUrl: 'https://api.openai.com/v1', apiKey: openaiKey, model };
  }
  throw new Error('No LLM key configured (set EMERGENT_LLM_KEY or OPENAI_API_KEY).');
}

// ----------- Non-streaming path (kept for compatibility) -----------

async function callLLMOnce(topic, mode) {
  const { baseUrl, apiKey, model } = getLLMConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      stream: false,
      messages: [
        { role: 'system', content: SECTION_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(topic, mode) }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return parseSections(content);
}

// ----------- Streaming path (SSE passthrough) -----------

async function* streamLLM(topic, mode) {
  const { baseUrl, apiKey, model } = getLLMConfig();
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      stream: true,
      messages: [
        { role: 'system', content: SECTION_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(topic, mode) }
      ]
    })
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => '');
    throw new Error(`LLM error ${upstream.status}: ${errText}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nlIdx;
    while ((nlIdx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nlIdx).trim();
      buffer = buffer.slice(nlIdx + 1);
      if (!line) continue;
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length) {
          yield delta;
        }
      } catch (e) {
        // ignore malformed chunk
      }
    }
  }
}

// ----------- Section parser (from full text) -----------

function parseSections(text) {
  const grab = (tag) => {
    const re = new RegExp(`<<${tag}>>([\\s\\S]*?)<<END>>`, 'i');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };
  const stepsRaw = grab('STEPS');
  const actionsRaw = grab('ACTIONS');

  const step_by_step = stepsRaw
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);

  const action_plan = actionsRaw
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (m) return { time: m[1].trim(), step: m[2].trim() };
      return { time: '', step: line };
    });

  return {
    simple_explanation: grab('SIMPLE'),
    real_life_analogy: grab('ANALOGY'),
    step_by_step,
    summary: grab('SUMMARY'),
    action_plan
  };
}

// ----------- Handlers -----------

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
    if (route === 'explain' || route === 'explain/stream') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const wantsStream = route === 'explain/stream' || body?.stream === true;

      if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      if (topic.length > 500) return NextResponse.json({ error: 'topic too long (max 500 chars)' }, { status: 400 });

      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (event, data) => {
              controller.enqueue(
                encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
              );
            };
            try {
              send('meta', { topic, mode, started_at: new Date().toISOString() });
              for await (const delta of streamLLM(topic, mode)) {
                send('token', { text: delta });
              }
              send('done', { finished_at: new Date().toISOString() });
            } catch (err) {
              send('error', { message: err?.message || 'stream error' });
            } finally {
              controller.close();
            }
          }
        });
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no'
          }
        });
      }

      const result = await callLLMOnce(topic, mode);
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
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
