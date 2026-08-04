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
import { notifyExplanationComplete } from '@/lib/notifications';

const MODES = [
  { id: 'kid', label: 'Kid Mode', hint: 'Super simple & playful' },
  { id: 'student', label: 'Student Mode', hint: 'Clear & educational' },
  { id: 'pro', label: 'Pro Mode', hint: 'Precise & engineering' }
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
        notifyExplanationComplete(t);
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
        if (Array.isArray(data?.questions)) {
          setQuizData(data.questions);
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
      doc.setFontSize(20);
      doc.text(`BrainMate: ${result.topic}`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Mode: ${result.mode} | Language: ${result.language || 'English'}`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

      let y = 44;

      if (result.simple_explanation) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Simple Explanation:', 14, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(result.simple_explanation, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      if (result.real_life_analogy) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Real-Life Analogy:', 14, y);
        y += 6;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(result.real_life_analogy, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 6;
      }

      if (result.summary) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('TL;DR Summary:', 14, y);
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
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-purple-500/20 selection:text-purple-600 flex flex-col justify-between">
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
            <div className="text-center space-y-3 py-6 animate-in fade-in-up duration-300">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 dark:border-purple-800/80 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 px-4 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-spin" />
                <span>AI Clarity & Learning Partner</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gradient-brand leading-tight">
                Understand Better. Learn Smarter.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto font-medium">
                Explaining complex concepts like a smart senior sitting right next to you—with simple words, real-life analogies, and step-by-step action roadmaps.
              </p>
            </div>
          )}

          {/* Input & Mode Controls Card */}
          <div className="rounded-3xl border border-purple-200/60 dark:border-purple-900/40 bg-card p-6 shadow-md space-y-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Why BrainMate is Unique</h3>
                  <p className="text-xs text-muted-foreground">Built for instant clarity & real retention</p>
                </div>
              </div>
              <button
                onClick={() => setWhyBrainMateOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-500/5 space-y-1">
                <span className="font-bold text-sm text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" /> Smart Senior Explanations
                </span>
                <p>
                  Instead of dense textbook dumps, BrainMate breaks down any topic into everyday terms, real-life analogies, and step-by-step action roadmaps.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-pink-100 dark:border-pink-900/40 bg-pink-500/5 space-y-1">
                <span className="font-bold text-sm text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-pink-500" /> Interactive Pop Quizzes & Audio
                </span>
                <p>
                  Test your understanding instantly with AI-generated pop quizzes and listen to explanations hands-free using speech synthesis.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/about"
                onClick={() => setWhyBrainMateOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
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
