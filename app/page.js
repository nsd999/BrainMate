'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ModeSelector from '@/components/ModeSelector';
import TopicInput from '@/components/TopicInput';
import ExplanationCard from '@/components/ExplanationCard';
import QuizModal from '@/components/QuizModal';
import ChatDrawer from '@/components/ChatDrawer';
import HistorySidebar from '@/components/HistorySidebar';
import Footer from '@/components/Footer';

import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Sparkles, X, Brain, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { setupReengagementNotification } from '@/lib/notifications';

const MODES = [
  { id: 'kid', label: "Explain like I'm 8", hint: 'Simple & playful' },
  { id: 'student', label: 'Standard & Clear', hint: 'Best for study' },
  { id: 'pro', label: 'Technical & Deep', hint: 'Practical depth' }
];

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'Italian', label: 'Italiano', flag: '🇮🇹' },
  { code: 'Portuguese', label: 'Português', flag: '🇵🇹' },
  { code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'Mandarin Chinese', label: '中文', flag: '🇨🇳' },
  { code: 'Japanese', label: '日本語', flag: '🇯🇵' },
  { code: 'Korean', label: '한국어', flag: '🇰🇷' },
  { code: 'Arabic', label: 'العربية', flag: '🇸🇦' },
  { code: 'Russian', label: 'Русский', flag: '🇷🇺' }
];

const THEME_KEY = 'brainmate.theme';
const LANG_KEY = 'brainmate.language';

// Stream tag parser helper
function parsePartial(buffer) {
  const out = {
    simple_explanation: '',
    real_life_analogy: '',
    step_by_step: [],
    summary: '',
    action_plan: [],
    active: null
  };

  const sections = [
    { tag: 'SIMPLE', key: 'simple_explanation', type: 'text' },
    { tag: 'ANALOGY', key: 'real_life_analogy', type: 'text' },
    { tag: 'STEPS', key: 'step_by_step', type: 'bullets' },
    { tag: 'SUMMARY', key: 'summary', type: 'text' },
    { tag: 'ACTIONS', key: 'action_plan', type: 'actions' }
  ];

  for (const s of sections) {
    const openTag = `<<${s.tag}>>`;
    const startIdx = buffer.indexOf(openTag);
    if (startIdx === -1) continue;
    const afterStart = startIdx + openTag.length;
    const endIdx = buffer.indexOf('<<END>>', afterStart);
    const isClosed = endIdx !== -1;
    const raw = isClosed ? buffer.slice(afterStart, endIdx) : buffer.slice(afterStart);
    const content = raw.replace(/^\n+/, '').replace(/\n+$/, '');

    if (!isClosed) out.active = s.key;

    if (s.type === 'text') {
      out[s.key] = content;
    } else if (s.type === 'bullets') {
      out[s.key] = content
        .split('\n')
        .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean);
    } else if (s.type === 'actions') {
      out[s.key] = content
        .split('\n')
        .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean)
        .map((line) => {
          const m = line.match(/^\[([^\]]+)\]\s*(.*)$/);
          if (m) return { time: m[1].trim(), step: m[2].trim() };
          return { time: '', step: line };
        });
    }
  }
  return out;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('student');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('light');

  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  // History & Identity
  const [userId, setUserId] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stats, setStats] = useState({ total_explanations: 0 });

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);

  // Why BrainMate Modal State
  const [whyBrainMateOpen, setWhyBrainMateOpen] = useState(false);

  // Voice Speech State
  const [speaking, setSpeaking] = useState(false);
  const [speakingWhat, setSpeakingWhat] = useState(null);

  const abortRef = useRef(null);
  const chatAbortRef = useRef(null);

  // Initialize theme, language & user_id
  useEffect(() => {
    try {
      let uid = localStorage.getItem('brainmate.user_id');
      if (!uid) {
        uid = (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem('brainmate.user_id', uid);
      }
      setUserId(uid);

      const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');

      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang) setLanguage(savedLang);

      setupReengagementNotification();
    } catch (e) {}
  }, []);

  // Sync theme changes to localStorage
  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch (e) {}
  };

  // Sync language changes
  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch (e) {}
  };

  // Load history from API
  useEffect(() => {
    if (!userId) return;
    let isCancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/history?user_id=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data?.items)) {
            setHistory(
              data.items.map((it) => ({
                id: it.id,
                topic: it.topic,
                mode: it.mode,
                created_at: it.created_at,
                favorite: !!it.favorite,
                payload: it.payload
              }))
            );
            setStats({ total_explanations: data.items.length });
          }
        }
      } catch (e) {
      } finally {
        if (!isCancelled) setHistoryLoading(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Save item to history
  const saveToHistory = async (item) => {
    setHistory((prev) => [item, ...prev.filter((x) => x.id !== item.id)]);
    setStats((prev) => ({ ...prev, total_explanations: prev.total_explanations + 1 }));
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id: item.id,
          favorite: item.favorite || false,
          created_at: item.created_at,
          payload: item.payload
        })
      });
    } catch (e) {}
  };

  // Toggle favorite history item
  const handleToggleFavorite = async (id, favorite) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite } : item))
    );
    try {
      await fetch(`/api/history/${id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, favorite })
      });
    } catch (e) {}
  };

  // Delete history item
  const handleDeleteHistory = async (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/history?id=${id}&user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  // Generate Explanation Stream
  const handleGenerate = async () => {
    const t = topic.trim();
    if (!t || loading) return;

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setStreaming(true);
    setResult(null);
    setActiveSection(null);
    setChatMessages([]);

    let buffer = '';

    try {
      const res = await fetch('/api/explain/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, mode, language }),
        signal: ctrl.signal
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuf += decoder.decode(value, { stream: true });

        let sepIdx;
        while ((sepIdx = sseBuf.indexOf('\n\n')) !== -1) {
          const chunk = sseBuf.slice(0, sepIdx);
          sseBuf = sseBuf.slice(sepIdx + 2);

          let evt = 'message';
          let dataLine = '';
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event:')) evt = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
          }
          if (!dataLine) continue;

          if (evt === 'token') {
            try {
              const { text } = JSON.parse(dataLine);
              if (typeof text === 'string') {
                buffer += text;
                const partial = parsePartial(buffer);
                setResult({
                  topic: t,
                  mode,
                  language,
                  ...partial
                });
                setActiveSection(partial.active);
              }
            } catch (e) {}
          }
        }
      }

      const finalPartial = parsePartial(buffer);
      const finalResult = {
        topic: t,
        mode,
        language,
        generated_at: new Date().toISOString(),
        ...finalPartial
      };
      setResult(finalResult);
      setActiveSection(null);

      if (finalResult.simple_explanation || finalResult.summary) {
        saveToHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          topic: t,
          mode,
          created_at: new Date().toISOString(),
          payload: finalResult
        });
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error(err?.message || 'Failed to generate explanation');
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStreaming(false);
    setLoading(false);
  };

  // Quiz Generation
  const handleStartQuiz = async () => {
    if (!result) return;
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizData([]);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: result.topic,
          mode: result.mode,
          language: result.language,
          context: result.simple_explanation
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          setQuizData(data.questions);
        } else {
          toast.error('Failed to parse quiz options');
        }
      } else {
        toast.error('Failed to generate quiz');
      }
    } catch (e) {
      toast.error('Error connecting to quiz service');
    } finally {
      setQuizLoading(false);
    }
  };

  // Follow-up Chat Stream
  const handleSendChat = async (presetText) => {
    const text = presetText || chatInput.trim();
    if (!text || chatStreaming || !result) return;

    if (!chatOpen) setChatOpen(true);

    if (chatAbortRef.current) chatAbortRef.current.abort();
    const ctrl = new AbortController();
    chatAbortRef.current = ctrl;

    const userMsg = { role: 'user', content: text };
    const assistantMsg = { role: 'assistant', content: '' };
    const nextMsgs = [...chatMessages, userMsg, assistantMsg];

    setChatMessages(nextMsgs);
    if (!presetText) setChatInput('');
    setChatStreaming(true);

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: result.topic,
          mode: result.mode,
          language: result.language,
          context: result.simple_explanation,
          messages: nextMsgs.slice(0, -1)
        }),
        signal: ctrl.signal
      });

      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuf = '';
      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuf += decoder.decode(value, { stream: true });

        let sepIdx;
        while ((sepIdx = sseBuf.indexOf('\n\n')) !== -1) {
          const chunk = sseBuf.slice(0, sepIdx);
          sseBuf = sseBuf.slice(sepIdx + 2);

          let evt = 'message';
          let dataLine = '';
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event:')) evt = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
          }
          if (!dataLine) continue;

          if (evt === 'token') {
            try {
              const { text: t } = JSON.parse(dataLine);
              if (typeof t === 'string') {
                assistantText += t;
                setChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantText
                  };
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Failed to get response');
      }
    } finally {
      setChatStreaming(false);
      chatAbortRef.current = null;
    }
  };

  // Text-To-Speech Output
  const handleSpeak = (text, key) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported on this device');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeaking(true);
      setSpeakingWhat(key);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setSpeakingWhat(null);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeakingWhat(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setSpeakingWhat(null);
  };

  // Export PDF Output
  const handleExportPdf = () => {
    if (!result) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`BrainMate: ${result.topic}`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Mode: ${result.mode} | Language: ${result.language || 'English'}`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

      let y = 44;

      if (result.simple_explanation) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('The Core Idea:', 14, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(result.simple_explanation, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      if (result.real_life_analogy) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Real-World Analogy:', 14, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(result.real_life_analogy, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      if (result.summary) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Quick Summary:', 14, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(result.summary, 180);
        doc.text(lines, 14, y);
      }

      doc.save(`BrainMate-${result.topic.replace(/\s+/g, '_')}.pdf`);
      toast.success('Downloaded PDF summary');
    } catch (e) {
      toast.error('Failed to export PDF');
    }
  };

  // Share URL Output
  const handleShare = () => {
    if (!result) return;
    if (navigator.share) {
      navigator.share({
        title: `BrainMate: ${result.topic}`,
        text: `Check out this clear explanation of ${result.topic} on BrainMate!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          theme={theme}
          setTheme={handleSetTheme}
          language={language}
          setLanguage={handleSetLanguage}
          languages={LANGUAGES}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          historyCount={history.length}
          stats={stats}
        />

        {/* Main Container */}
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
          {/* Intro Hero Banner */}
          {!result && (
            <div className="text-center space-y-3 py-6 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Explains anything in plain English</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Understand any topic in 2 minutes.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto font-medium">
                Clear explanations, real-world analogies, and a practical 3-step action plan to help you learn faster.
              </p>
            </div>
          )}

          {/* Input & Mode Controls Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-2xs space-y-6">
            <ModeSelector
              modes={MODES}
              selectedMode={mode}
              onSelectMode={(m) => setMode(m)}
            />

            <TopicInput
              topic={topic}
              setTopic={setTopic}
              loading={loading}
              streaming={streaming}
              onGenerate={handleGenerate}
              onStop={handleStop}
            />
          </div>

          {/* Generated Explanation Display */}
          <ExplanationCard
            result={result}
            activeSection={activeSection}
            onStartQuiz={handleStartQuiz}
            onAskFollowup={(text) => handleSendChat(text)}
            speaking={speaking}
            speakingWhat={speakingWhat}
            onSpeak={handleSpeak}
            onStopSpeak={handleStopSpeak}
            onShare={handleShare}
            onExportPdf={handleExportPdf}
          />
        </main>
      </div>

      {/* Interactive Pop Quiz Modal */}
      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        quizData={quizData}
        loading={quizLoading}
        topic={result?.topic}
      />

      {/* Follow-up Chat Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        streaming={chatStreaming}
        onSend={() => handleSendChat()}
        topic={result?.topic}
      />

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          setResult(item.payload);
          setTopic(item.topic);
          setMode(item.mode);
        }}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistory={handleDeleteHistory}
        loading={historyLoading}
      />

      {/* Why BrainMate Modal */}
      {whyBrainMateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Brain className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">Why BrainMate works better</h3>
                  <p className="text-xs text-muted-foreground font-medium">Built for real understanding</p>
                </div>
              </div>
              <button
                onClick={() => setWhyBrainMateOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" /> Simple Explanations & Analogies
                </span>
                <p>
                  Instead of dense textbook paragraphs, BrainMate breaks down any topic into clear language and relatable everyday examples.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-500" /> Quick Memory Quizzes & Action Steps
                </span>
                <p>
                  Test your understanding in seconds with pop quizzes and get practical steps you can take today.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/about"
                onClick={() => setWhyBrainMateOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow-xs transition-all"
              >
                <span>Read Full Story on About Page</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Website Compact Strip Footer */}
      <Footer onOpenWhyBrainMate={() => setWhyBrainMateOpen(true)} />
    </div>
  );
}
