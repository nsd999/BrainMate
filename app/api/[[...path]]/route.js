import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getHistoryCollection, getStatsCollection } from '@/lib/mongo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// CONFIGURATION & PROMPTS
// ============================================================================

const MODE_INSTRUCTIONS = {
  kid: 'Explain like you are teaching a curious 8-year-old. Use very simple words, fun examples from daily life (toys, school, games), and short sentences. Make it feel friendly and playful.',
  student: 'Explain clearly like a good teacher. Use simple language, step-by-step logic, and relatable examples from school, exams, or real-world situations. Avoid unnecessary complexity.',
  pro: 'Explain with clarity and depth like a mentor. Use real-world scenarios, practical applications, and clear reasoning. Keep it concise but insightful.'
};

const SECTION_SYSTEM_PROMPT = `You are BrainMate, an AI tutor. Your job is to explain concepts like a smart, friendly person — not like a textbook.

Return exactly these 5 sections once each.
Do not repeat sections.
Do not include tags inside other sections.
No markdown.
No extra text outside the tags.

IMPORTANT FACTUALITY RULES:
- Never invent facts about real people
- If unsure, say you do not know
- Do not guess careers or achievements
- Accuracy is more important than confidence

<<SIMPLE>>
2-3 sentence easy explanation. Think of it like explaining to a friend over coffee. Use casual, natural language.
<<END>>
<<ANALOGY>>
One vivid, relatable real-life example (2-3 sentences). Use everyday things: phones, money, school, sports, or how things work around us. Make it visual and easy to picture.
<<END>>
<<STEPS>>
- Guidance point or tip
- Another key point
- Another actionable insight
(4-6 total, short and crisp, each on new line starting with "- ")
<<END>>
<<SUMMARY>>
1-2 sentence TL;DR. Sum it up like you're texting a friend — natural and quick.
<<END>>
<<ACTIONS>>
- [10 min] First actionable step
- [1 hour] Second actionable step
- [today] Third actionable step
(3-5 total, each line: "- [time] action")
<<END>>

Tone & Personality (CRITICAL):
- Talk like a smart senior explaining to a junior dev/student. Not robotic. Not textbook.
- Use natural conversational phrases:
  * "Think of it like this..."
  * "Here's the trick..."
  * "Most people get this wrong because..."
  * "Here's the simple idea..."
  * "Basically..."
  * "The key thing is..."
- Make it feel easy and doable, not intimidating or overly academic.
- Use simple, everyday language. Avoid jargon unless necessary, and if you use it, explain it casually.
- Show confidence but stay humble. You're helping, not lecturing.
- Be natural, clear, and relatable — like you're explaining to a friend sitting next to you.
- Make explanations feel practical and useful in real life.

Temperature: Use 0.8 for more natural, conversational responses.`;

const FOLLOWUP_SYSTEM_PROMPT = `Generate 4 short follow-up questions based on the topic and explanation.

Rules:
- Keep questions simple and natural
- Make them feel like a curious student asking
- No JSON text outside array
- Avoid generic questions

Output format:
["Question 1", "Question 2", "Question 3", "Question 4"]
`;

const QUIZ_SYSTEM_PROMPT = `You are BrainMate, generating a SHORT pop-quiz for a learner who just read an explanation. Output ONLY four multiple-choice questions in this exact tagged format. NO extras.

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
QUESTION: <one clear question>
A) <option A>
B) <option B>
C) <option C>
D) <option D>
ANSWER: <single letter A/B/C/D>
EXPLAIN: <one short sentence justifying the answer>
<<END>>
<<Q3>>
QUESTION: <one clear question>
A) <option A>
B) <option B>
C) <option C>
D) <option D>
ANSWER: <single letter A/B/C/D>
EXPLAIN: <one short sentence justifying the answer>
<<END>>
<<Q4>>
QUESTION: <one clear question>
A) <option A>
B) <option B>
C) <option C>
D) <option D>
ANSWER: <single letter A/B/C/D>
EXPLAIN: <one short sentence justifying the answer>
<<END>>

Rules:
- Exactly 4 questions, in order Q1..Q4.
- Each question MUST have exactly 4 options A) B) C) D).
- The ANSWER must be one of A/B/C/D and the EXPLAIN must be one short sentence (<= 25 words).
- Mix difficulty: 1 easy recall, 2 understanding, 1 applied.
- No "all of the above" / "none of the above".
- Do not repeat the explanation; test understanding.`;

// ============================================================================
// UTILITY: PROMPT BUILDERS
// ============================================================================

function buildUserPrompt(topic, mode, language) {
  const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.student;
  const lang = (language || 'English').toString();
  const langLine =
    lang.toLowerCase() === 'english'
      ? ''
      : `\n\nIMPORTANT: Write all output (including bullets and time labels) in ${lang}. Translate the action time labels too. Keep the section tags (<<SIMPLE>>, <<END>>, etc.) in English exactly as shown.`;
  return `Topic: ${topic}

Audience mode: ${mode.toUpperCase()}
${modeInstruction}${langLine}

Produce ONLY the 5 tagged sections described in the system prompt.`;
}

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

// ============================================================================
// STEP 1: LLM CONFIG WITH PRIMARY OPENAI + FALLBACK GROQ
// ============================================================================

function getLLMConfig(prefer = 'openai') {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // PRIMARY: OpenAI
  if (prefer === 'openai' && openaiKey) {
    return {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: openaiKey,
      model: 'gpt-4o-mini'
    };
  }

  // FALLBACK: Groq
  if (groqKey) {
    return {
      provider: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: groqKey,
      model: 'llama-3.1-8b-instant'
    };
  }

  throw new Error('No LLM API keys configured. Set OPENAI_API_KEY or GROQ_API_KEY.');
}

// ============================================================================
// STEP 2 & 3: SAFE PARSER WITH VALIDATION
// ============================================================================

function parseSections(text) {
  function grabSection(tag) {
    const start = `<<${tag}>>`;
    const end = `<<END>>`;

    const startIndex = text.indexOf(start);
    if (startIndex === -1) return '';

    const sliced = text.slice(startIndex + start.length);
    const endIndex = sliced.indexOf(end);
    if (endIndex === -1) return '';

    return sliced.slice(0, endIndex).trim();
  }

  const stepsRaw = grabSection('STEPS');
  const actionsRaw = grabSection('ACTIONS');

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
      if (m) {
        return {
          time: m[1].trim(),
          step: m[2].trim()
        };
      }
      return {
        time: '',
        step: line
      };
    });

  return {
    simple_explanation: grabSection('SIMPLE'),
    real_life_analogy: grabSection('ANALOGY'),
    step_by_step,
    summary: grabSection('SUMMARY'),
    action_plan
  };
}

function validateResponse(data) {
  return (
    data &&
    typeof data.simple_explanation === 'string' &&
    data.simple_explanation.length > 0 &&
    typeof data.real_life_analogy === 'string' &&
    data.real_life_analogy.length > 0 &&
    Array.isArray(data.step_by_step) &&
    data.step_by_step.length > 0 &&
    typeof data.summary === 'string' &&
    data.summary.length > 0 &&
    Array.isArray(data.action_plan) &&
    data.action_plan.length > 0
  );
}

// ============================================================================
// STEP 4: QUIZ PARSER
// ============================================================================

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

// ============================================================================
// STEP 5: CALL LLM WITH PRIMARY + FALLBACK
// ============================================================================

async function callLLMOnce(topic, mode, language) {
  let lastError = null;

  // Try OpenAI first
  try {
    const config = getLLMConfig('openai');
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.8,
        stream: false,
        messages: [
          { role: 'system', content: SECTION_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(topic, mode, language) }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const parsed = parseSections(content);

      if (validateResponse(parsed)) {
        return parsed;
      }
      throw new Error('Response validation failed');
    }

    lastError = `OpenAI error ${res.status}: ${await res.text()}`;
  } catch (err) {
    lastError = err?.message || 'OpenAI request failed';
  }

  // Fallback to Groq
  try {
    const config = getLLMConfig('groq');
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.8,
        stream: false,
        messages: [
          { role: 'system', content: SECTION_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(topic, mode, language) }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const parsed = parseSections(content);

      if (validateResponse(parsed)) {
        return parsed;
      }
      throw new Error('Response validation failed');
    }

    throw new Error(`Groq error ${res.status}`);
  } catch (err) {
    throw new Error(`All LLM providers failed. Primary: ${lastError}. Fallback: ${err?.message}`);
  }
}

function getFallbackQuiz(topic) {
  return [
    {
      index: 1,
      question: `What is the core idea behind ${topic}?`,
      options: [
        { letter: 'A', text: 'It simplifies processes using core principles' },
        { letter: 'B', text: 'It replaces all traditional models completely' },
        { letter: 'C', text: 'It only works in theoretical scenarios' },
        { letter: 'D', text: 'It requires manual human intervention at all times' }
      ],
      answer: 'A',
      explain: `The main goal of ${topic} is to simplify and optimize core principles.`
    },
    {
      index: 2,
      question: `Which of the following best describes an advantage of ${topic}?`,
      options: [
        { letter: 'A', text: 'Higher efficiency and clearer structure' },
        { letter: 'B', text: 'Unlimited resource consumption' },
        { letter: 'C', text: 'Increased error rates' },
        { letter: 'D', text: 'Slower response times' }
      ],
      answer: 'A',
      explain: `${topic} provides structured clarity and improved efficiency.`
    },
    {
      index: 3,
      question: `In real-world applications, how is ${topic} typically applied?`,
      options: [
        { letter: 'A', text: 'To solve practical problems step-by-step' },
        { letter: 'B', text: 'Only in fiction books' },
        { letter: 'C', text: 'Without any data or inputs' },
        { letter: 'D', text: 'By ignoring feedback' }
      ],
      answer: 'A',
      explain: `Real-world implementation of ${topic} focuses on step-by-step practical problem solving.`
    },
    {
      index: 4,
      question: `What is a key takeaway when learning about ${topic}?`,
      options: [
        { letter: 'A', text: 'Understanding foundational concepts before diving deep' },
        { letter: 'B', text: 'Memorizing complex terms without understanding' },
        { letter: 'C', text: 'Avoiding practice and real examples' },
        { letter: 'D', text: 'Assuming it cannot be improved' }
      ],
      answer: 'A',
      explain: `Building a solid understanding of foundations is key for ${topic}.`
    }
  ];
}

async function callQuizLLM(topic, mode, language, context) {
  try {
    const config = getLLMConfig('openai');
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: QUIZ_SYSTEM_PROMPT },
          { role: 'user', content: buildQuizUserPrompt(topic, mode, language, context) }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const questions = parseQuiz(content);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    }
  } catch (err) {
    console.error('[callQuizLLM OpenAI error]', err);
  }

  try {
    const config = getLLMConfig('groq');
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: QUIZ_SYSTEM_PROMPT },
          { role: 'user', content: buildQuizUserPrompt(topic, mode, language, context) }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const questions = parseQuiz(content);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    }
  } catch (err) {
    console.error('[callQuizLLM Groq error]', err);
  }

  return getFallbackQuiz(topic);
}

// ============================================================================
// STREAMING: CHAT COMPLETION WITH FALLBACK
// ============================================================================

async function* streamChatCompletion(messages, { temperature = 0.8, providerPreference = 'openai' } = {}) {
  let lastError = null;

  // Try primary provider
  try {
    const config = getLLMConfig(providerPreference);
    const upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature,
        stream: true,
        messages
      })
    });

    if (!upstream.ok) {
      throw new Error(`${config.provider} error ${upstream.status}`);
    }

    if (!upstream.body) {
      throw new Error(`${config.provider} no response body`);
    }

    yield* _streamFromResponse(upstream);
    return;
  } catch (err) {
    lastError = err?.message || 'Primary provider failed';
  }

  // Fallback to alternate provider
  try {
    const fallbackProvider = providerPreference === 'openai' ? 'groq' : 'openai';
    const config = getLLMConfig(fallbackProvider);
    const upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature,
        stream: true,
        messages
      })
    });

    if (!upstream.ok || !upstream.body) {
      throw new Error(`Fallback provider error ${upstream.status}`);
    }

    yield* _streamFromResponse(upstream);
    return;
  } catch (err) {
    throw new Error(`Streaming failed. Primary: ${lastError}. Fallback: ${err?.message}`);
  }
}

// Helper: read streaming response
async function* _streamFromResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
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
          // Ignore malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// FOLLOW-UPS GENERATION
// ============================================================================

async function generateFollowUps(topic, explanation) {
  const { baseUrl, apiKey, model } = getLLMConfig('openai');

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
          { role: 'user', content: `Topic: ${topic}\nExplanation:\n${explanation}` }
        ]
      })
    });

    if (!res.ok) {
      console.error(`[generateFollowUps] API error ${res.status}`);
      return getFallbackFollowUps();
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      console.error('[generateFollowUps] Invalid response format');
      return getFallbackFollowUps();
    }

    // Safe parsing with fallback
    let parsed = [];

    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\[.*\]/s);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = [];
        }
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }

    return getFallbackFollowUps();
  } catch (err) {
    console.error('[generateFollowUps error]', err?.message || err);
    return getFallbackFollowUps();
  }
}

function getFallbackFollowUps() {
  return [
    'Can you explain this simply?',
    'Give a real-life example',
    'Why is this important?',
    'How can I use this?'
  ];
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  if (route === '' || route === 'health') {
    return NextResponse.json({
      ok: true,
      service: 'BrainMate API',
      time: new Date().toISOString()
    });
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
      return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('[DELETE error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const pathArr = params?.path || [];
  const route = pathArr.join('/');

  try {
    // ========== POST /api/quiz (QUIZ GENERATION) ==========
    if (route === 'quiz') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();
      const context = (body?.context || '').toString();

      if (!topic) {
        return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      }

      const questions = await callQuizLLM(topic, mode, language, context);
      return NextResponse.json({ ok: true, topic, questions });
    }

    // ========== POST /api/explain (NON-STREAMING) ==========
    if (route === 'explain') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();

      if (!topic) {
        return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      }
      if (topic.length > 500) {
        return NextResponse.json({ error: 'topic too long (max 500 chars)' }, { status: 400 });
      }

      const result = await callLLMOnce(topic, mode, language);

      // Generate follow-ups
      const followUps = await generateFollowUps(
        topic,
        result.simple_explanation + '\n' + result.real_life_analogy
      );

      return NextResponse.json({
        topic,
        mode,
        language,
        generated_at: new Date().toISOString(),
        ...result,
        follow_ups: followUps
      });
    }

    // ========== POST /api/explain/stream (STREAMING) ==========
    if (route === 'explain/stream') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();

      if (!topic) {
        return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      }
      if (topic.length > 500) {
        return NextResponse.json({ error: 'topic too long (max 500 chars)' }, { status: 400 });
      }

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

            for await (const delta of streamChatCompletion(messages, { providerPreference: 'openai' })) {
              send('token', { text: delta });
            }

            send('done', { finished_at: new Date().toISOString() });
          } catch (err) {
            send('error', { message: 'Stream generation failed' });
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

    // ========== POST /api/chat/stream (FOLLOW-UP CHAT STREAMING) ==========
    if (route === 'chat/stream') {
      const body = await request.json();
      const topic = (body?.topic || '').toString().trim();
      const mode = (body?.mode || 'student').toString().toLowerCase();
      const language = (body?.language || 'English').toString();
      const context = (body?.context || '').toString();
      const messages = Array.isArray(body?.messages) ? body.messages : [];

      if (!topic) {
        return NextResponse.json({ error: 'topic is required' }, { status: 400 });
      }
      if (messages.length === 0) {
        return NextResponse.json({ error: 'messages is required' }, { status: 400 });
      }

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

      // Filter and normalize messages
      const safeMessages = messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-20)
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

            for await (const delta of streamChatCompletion(fullMessages, { temperature: 0.8, providerPreference: 'openai' })) {
              send('token', { text: delta });
            }

            send('done', { finished_at: new Date().toISOString() });
          } catch (err) {
            send('error', { message: 'Stream generation failed' });
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

    // ========== POST /api/history (SAVE HISTORY) ==========
    if (route === 'history') {
      const body = await request.json();
      const userId = (body?.user_id || '').toString().trim();
      const payload = body?.payload || null;

      if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      }
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

    // ========== POST /api/history/:id/favorite (TOGGLE FAVORITE) ==========
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

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('[BrainMate API error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
