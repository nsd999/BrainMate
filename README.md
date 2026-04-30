TITLE: Fix BrainMate API + Upgrade to Smart Buddy Style + Voice Improvement

---

PROBLEM

The current API has:

- Duplicate functions (buildUserPrompt, buildQuizUserPrompt)
- Confusing structure
- AI responses sound like textbook (boring, robotic)
- Voice output sounds unnatural

---

GOAL

Make BrainMate feel like a smart senior friend, not a teacher or textbook.

---

REQUIRED FIXES

1. REMOVE DUPLICATES

- Keep only ONE version of:
  - buildUserPrompt()
  - buildQuizUserPrompt()

2. CLEAN STRUCTURE
   Order should be:

3. Prompts

4. Helper functions

5. API handlers

6. FIX PROMPT (VERY IMPORTANT)

Replace SECTION_SYSTEM_PROMPT with:

"You are BrainMate, a smart senior friend helping a junior understand things.

Before explaining:

- Briefly acknowledge confusion or curiosity

Style:

- Talk casually but clearly
- Avoid textbook definitions
- Use phrases like:
  'Okay, this looks confusing at first...'
  'Think of it like this...'
  'Here’s the simple idea...'
  'Most people get this wrong because...'

Tone:

- Friendly, slightly informal
- Use 'you'
- Vary sentence length
- Make it feel like real conversation

IMPORTANT:

- Do NOT sound robotic
- Do NOT repeat same explanation pattern
- Keep it natural every time

OUTPUT FORMAT MUST STILL FOLLOW TAGS:
<<SIMPLE>>, <<ANALOGY>>, <<STEPS>>, <<SUMMARY>>, <<ACTIONS>>"

---

VOICE UPGRADE (ADD THIS)

Add function:

async function formatForVoice(text) {
return text
.replace(/./g, '. ')
.replace(/,/g, ', ')
.replace(/:/g, ': ')
.trim();
}

---

API CHANGE

After getting result:

const result = await callLLMOnce(...)

Add:

const voice_text = formatForVoice(
result.simple_explanation + " " + result.real_life_analogy
);

Return it in response:

voice_text: voice_text

---

FRONTEND CHANGE

Update speak():

function speak(text) {
const utterance = new SpeechSynthesisUtterance(text);

utterance.rate = 0.92;
utterance.pitch = 1.05;

const voices = speechSynthesis.getVoices();

utterance.voice =
voices.find(v => v.name.includes('Google UK English Female')) ||
voices.find(v => v.name.includes('Google')) ||
voices[0];

speechSynthesis.cancel();
speechSynthesis.speak(utterance);
}

Use:

speak(data.voice_text || data.simple_explanation)

---

RULES

- DO NOT break streaming API
- DO NOT change database logic
- DO NOT remove features
- ONLY improve clarity, tone, and voice

---

EXPECTED RESULT

- AI feels like a real smart friend
- Not robotic or textbook
- Voice sounds natural
- Better engagement
