'use client';

import { useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function ChatDrawer({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  streaming,
  onSend,
  topic
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !streaming) {
        onSend();
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <MessageSquare className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Follow-Up Chat</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Topic: {topic}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
            <Bot className="h-8 w-8 text-purple-500/60" />
            <p className="text-sm font-medium text-foreground">Ask anything about this topic!</p>
            <p className="text-xs max-w-xs">
              BrainMate remembers the current explanation and will answer follow-ups clearly.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-2.5 text-sm',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white mt-0.5">
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 max-w-[85%] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-muted/80 text-foreground border border-border/50 rounded-bl-none'
                )}
              >
                {msg.content || (streaming && idx === messages.length - 1 ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                  </span>
                ) : null)}
              </div>
              {msg.role === 'user' && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground mt-0.5">
                  <User className="h-4 w-4" />
                </span>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-border/60 p-3 bg-muted/20">
        <div className="flex items-end gap-2 rounded-xl border border-border/80 bg-background p-2 focus-within:border-purple-500/80 focus-within:ring-1 focus-within:ring-purple-500/30">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a follow-up question..."
            rows={1}
            disabled={streaming}
            className="min-h-[38px] flex-1 resize-none border-0 bg-transparent px-2 text-xs sm:text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
          <Button
            onClick={onSend}
            disabled={!input.trim() || streaming}
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
