import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getHistoryCollection, getStatsCollection } from '@/lib/mongo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODE_INSTRUCTIONS = {
  kid: 'Explain like you are teaching a curious 8-year-old. Use very simple words, fun examples from daily life (toys, school, games), and short sentences. Make it feel friendly and playful.',
  
  student: 'Explain clearly like a good teacher. Use simple language, step-by-step logic, and relatable examples from school, exams, or real-world situations. Avoid unnecessary complexity.',
  
  pro: 'Explain with clarity and depth like a mentor. Use real-world scenarios, practical applications, and clear reasoning. Keep it concise but insightful.'
};

const SECTION_SYSTEM_PROMPT = `You are BrainMate, an expert AI tutor. Your job is to explain ANY topic with crystal clarity and give the user an actionable plan.You MUST respond using EXACTLY this section-delimited format, in this exact order, with NO markdown, NO code fences, NO extra commentary:

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
- Talk like a smart, friendly buddy who explains things clearly and confidently.
- Keep it natural and human, not robotic or textbook-like.
- ALWAYS make the user feel “this is actually easy”.
- Use simple, relatable language and real-life situations (school, phone, money, daily life).
- Avoid boring definitions — explain meaning through examples.
- Be slightly conversational, but not slangy or unprofessional.

- Occasionally start explanations in an engaging way like "Think of it like this..." or "Here’s a simple way to see it..."
- Steps should feel like guidance a smart friend would give, not formal textbook instructions.
- Keep steps between 4–6 only. Prioritize clarity over completeness.

- Start with "<<SIMPLE>>" on its own line. Never skip any section. End every section with "<<END>>" on its own line.
- ALWAYS include a strong real-life analogy that feels relatable.
- Steps must feel like guidance, not instructions from a machine.
- Action plan must feel practical and doable in real life.

- Output nothing outside of these tagged sections.`;

const FOLLOWUP_SYSTEM_PROMPT = `You are BrainMate.

Generate 4 short, relevant follow-up questions based on the user's topic and explanation.

Rules:
- Questions must feel natural and curious
- Keep them short (max 10 words)
- Make them specific to the topic
- Avoid generic questions
- Output ONLY a JSON array of strings

Example:
["What is compound interest?", "How to grow savings faster?", "Best bank interest rates?", "Any risks involved?"]
`;

const QUIZ_SYSTEM_PROMPT = `You are BrainMate, generating a SHORT pop-quiz for a learner who just read an explanation. Output ONLY four multiple-choice questions in this exact tagged format. NO extra text, NO markdown.

<<Q1>>
QUESTION: <one clear question>
A) <option A>
B) <option B>
C) <option C>
D) <option D>
ANSWER: <single letter A/B/C/D>
EXPLAIN: <one short sentence justifying the answer>
<<END>>
<<Q2>>
... (same 7-line structure)
<<END>>
<<Q3>>
... 
<<END>>
<<Q4>>
... 
<<END>>

Rules:
- Exactly 4 questions, in order Q1..Q4.
- Each question MUST have exactly 4 options A) B) C) D).
- The ANSWER must be one of A/B/C/D and the EXPLAIN must be one short sentence (<= 25 words).
- Mix difficulty: 1 easy recall, 2 understanding, 1 applied.
- No "all of the above" / "none of the above".
- Do not repeat the explanation; test understanding.`;

function buildQuizUserPrompt(topic, mode, language, context) {
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  const lang = (language || 'English').toString();
  const langLine =
    lang.toLowerCase() === 'english'
      ? ''
      : `\nIMPORTANT: Write the QUESTION text, options, and EXPLAIN in ${lang}. Keep tags (<<Q1>>, <<END>>, ANSWER:, EXPLAIN:) and the letters A/B/C/D in English.`;
  return `Topic: ${topic}
Audience: ${mode.toUpperCase()} — ${modeInstruction}${langLine}

Use this explanation as the source of truth for the questions:
---
${context || '(no prior context — generate from general knowledge)'}
---

Now produce ONLY the 4 tagged quiz questions.`;
}

function parseQuiz(text) {
  const out = [];
  for (let i = 1; i <= 4; i++) {
    const re = new RegExp(`<<Q${i}>>([\\s\\S]*?)<<END>>`, 'i');
    const m = text.match(re);
    if (!m) continue;
    const block = m[1];
    const grab = (label) => {
      const lr = new RegExp(`^\\s*${label}:\\s*(.+)$`, 'im');
      const r = block.match(lr);
      return r ? r[1].trim() : '';
    };
    const optRe = /^\s*([ABCD])\)\s*(.+)$/gim;
    const options = [];
    let mm;
    while ((mm = optRe.exec(block)) !== null) {
      options.push({ letter: mm[1].toUpperCase(), text: mm[2].trim() });
    }
    const question = grab('QUESTION');
    const answer = (grab('ANSWER') || '').toUpperCase().slice(0, 1);
    const explain = grab('EXPLAIN');
    if (question && options.length === 4 && /^[ABCD]$/.test(answer)) {
      out.push({ index: i, question, options, answer, explain });
    }
  }
  return out;
}



function buildUserPrompt(topic, mode, language) {
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  const lang = (language || 'English').toString();
  const langLine =
    lang.toLowerCase() === 'english'
      ? ''
      : `\n\nIMPORTANT: Write all output (including bullets and time labels) in ${lang}. Translate the action time labels too. Keep the section tags (<<SIMPLE>>, <<END>>, etc.) in English exactly as specified.`;
  return `Topic: ${topic}

Audience mode: ${mode.toUpperCase()}
${modeInstruction}${langLine}

Make the explanation feel practical and useful in real life.

Produce ONLY the 5 tagged sections described in the system prompt.`;
}

function getLLMConfig() {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const emergentKey = process.env.EMERGENT_LLM_KEY;

  // ✅ PRIORITY 1: GROQ (FREE)
  if (groqKey) {
    return {
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
model: 'llama-3.1-8b-instant'
    };
  }

  // fallback options (keep them)
  if (emergentKey) {
    return {
      baseUrl: 'https://integrations.emergentagent.com/llm',
      apiKey: emergentKey,
      model: 'gpt-4o-mini'
    };
  }

  if (openaiKey) {
    return {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: openaiKey,
      model: 'gpt-4o-mini'
    };
  }

  throw new Error('No LLM key configured (set GROQ_API_KEY).');
}
// ----------- Non-streaming path (kept for compatibility) -----------

async function callLLMOnce(topic, mode, language) {
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
        { role: 'user', content: buildUserPrompt(topic, mode, language) }
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

async function* streamChatCompletion(messages, { temperature = 0.6 } = {}) {
  const { baseUrl, apiKey, model } = getLLMConfig();
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature,
      stream: true,
      messages
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
async function generateFollowUps(topic, explanation) {
  const { baseUrl, apiKey, model } = getLLMConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
        { role: 'user', content: `Topic: ${topic}\nExplanation:\n${explanation}` }
      ]
    })
  });

  const data = await res.json();

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return [];
  }
}

// ----------- Handlers -----------

export async function GET(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  if (route === '' || route === 'health') {
    return NextResponse.json({ ok: true, service: 'BrainMate API', time: new Date().toISOString() });
  }

  // GET /api/history?user_id=xxx&limit=50
  if (route === 'history') {
    try {
      const url = new URL(request.url);
      const userId = (url.searchParams.get('user_id') || '').trim();
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
      if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      }
      const col = await getHistoryCollection();
      const items = await col
        .find({ user_id: userId }, { projection: { _id: 0 } })
        .sort({ favorite: -1, favorited_at: -1, created_at: -1 })
        .limit(limit)
        .toArray();
      return NextResponse.json({ user_id: userId, count: items.length, items });
    } catch (err) {
      console.error('[history GET error]', err);
      return NextResponse.json({ error: err?.message || 'Failed to load history' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found', route }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  try {
    const url = new URL(request.url);
    const userId = (url.searchParams.get('user_id') || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // DELETE /api/history → clear all for user
    if (route === 'history') {
      const col = await getHistoryCollection();
      const r = await col.deleteMany({ user_id: userId });
      return NextResponse.json({ ok: true, deleted: r.deletedCount });
    }

    // DELETE /api/history/:id → delete single entry for user
    if (pathArr[0] === 'history' && pathArr[1]) {
      const id = pathArr[1];
      const col = await getHistoryCollection();
      const r = await col.deleteOne({ user_id: userId, id });
      if (r.deletedCount === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Not found', route }, { status: 404 });
  } catch (err) {
    console.error('[DELETE error]', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  try {
    if (route === 'explain' || route === 'explain/stream') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();
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
              send('meta', { topic, mode, language, started_at: new Date().toISOString() });
              const messages = [
                { role: 'system', content: SECTION_SYSTEM_PROMPT },
                { role: 'user', content: buildUserPrompt(topic, mode, language) }
              ];
              for await (const delta of streamChatCompletion(messages)) {
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

      const result = await callLLMOnce(topic, mode, language);
      const followUps = await generateFollowUps(topic, result.simple_explanation);
      return NextResponse.json({
  topic,
  mode,
  language,
  generated_at: new Date().toISOString(),
  ...result,
  followUps`
});

    // -------- Follow-up chat (streaming) --------
    if (route === 'chat/stream') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();
      const context = (body?.context || '').toString();
      const messages = Array.isArray(body?.messages) ? body.messages : [];

      if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      if (messages.length === 0) return NextResponse.json({ error: 'messages is required' }, { status: 400 });

      const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
      const langLine =
        language && language.toLowerCase() !== 'english'
          ? `\nIMPORTANT: Respond in ${language}.`
          : '';
      const chatSystem = `You are BrainMate, a friendly AI tutor answering follow-up questions about an explanation you just gave.

Original topic: ${topic}
Audience: ${mode.toUpperCase()} — ${modeInstruction}${langLine}

Here is the explanation you previously provided (for context):
---
${context || '(no prior explanation context supplied)'}
---

Rules:
- Stay on topic. If the user asks something totally unrelated, gently steer them back or answer briefly.
- Keep answers concise (under ~150 words) unless the user asks for depth.
- Use plain, friendly language. Define jargon if you use it.
- NEVER respond with JSON or tagged sections — this is a normal conversation.
- If helpful, use short bullets, but don't over-format.`;

      // Filter and normalize messages to role/content only
      const safeMessages = messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-20) // keep last 20 turns max
        .map((m) => ({ role: m.role, content: m.content }));

      const fullMessages = [{ role: 'system', content: chatSystem }, ...safeMessages];

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event, data) => {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          };
          try {
            send('meta', { started_at: new Date().toISOString() });
            for await (const delta of streamChatCompletion(fullMessages, { temperature: 0.7 })) {
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

    // -------- Save history (cross-device via user_id) --------
    if (route === 'history') {
      const body = await request.json();
      const userId = (body?.user_id || '').toString().trim();
      const payload = body?.payload || null;
      if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ error: 'payload is required' }, { status: 400 });
      }
      const id = (body?.id || uuidv4()).toString();
      const doc = {
        id,
        user_id: userId,
        topic: payload?.topic || '',
        mode: payload?.mode || 'student',
        language: payload?.language || 'English',
        favorite: !!body?.favorite,
        created_at: body?.created_at || new Date().toISOString(),
        payload
      };
      const col = await getHistoryCollection();
      await col.updateOne({ id }, { $set: doc }, { upsert: true });
      return NextResponse.json({ ok: true, id, entry: doc });
    }

    // -------- Toggle favorite on a history entry --------
    if (pathArr[0] === 'history' && pathArr[1] && pathArr[2] === 'favorite') {
      const id = pathArr[1];
      const body = await request.json();
      const userId = (body?.user_id || '').toString().trim();
      const favorite = !!body?.favorite;
      if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      }
      const col = await getHistoryCollection();
      const r = await col.updateOne(
        { id, user_id: userId },
        { $set: { favorite, favorited_at: favorite ? new Date().toISOString() : null } }
      );
      if (r.matchedCount === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, id, favorite });
    }

    return NextResponse.json({ error: 'Not found', route }, { status: 404 });

  } catch (err) {
    console.error('[BrainMate API error]', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
