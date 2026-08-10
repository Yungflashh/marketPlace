import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'What logs do you have in stock?',
  'Recommend something under $50',
  'How do I check out?',
  'What payment methods do you accept?',
  'Track my last order',
];

const STORAGE_KEY = 'shopbot.messages.v1';
const MAX_STORED = 40;

const loadStored = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-MAX_STORED);
  } catch {
    return [];
  }
};

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStored);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // storage full or blocked — silently fall back to memory-only
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/chat', { messages: nextMessages });
      const reply = res.data?.data?.message;
      if (reply?.content) {
        setMessages([...nextMessages, { role: 'assistant', content: reply.content }]);
      } else {
        setError('No reply received. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = () => {
    if (messages.length === 0) return;
    if (!window.confirm('Clear the chat history? This cannot be undone.')) return;
    setMessages([]);
    setError(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden"
          style={{ height: '100dvh', width: '100vw' }}
        >
          {/* Header */}
          <header className="bg-gray-900 text-white shrink-0 w-full">
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-2 px-3 sm:px-6 py-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Logo size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold leading-tight truncate">ShopBot</p>
                  <p className="text-[11px] text-gray-300 leading-tight truncate">
                    {messages.length > 0
                      ? `${messages.length} message${messages.length !== 1 ? 's' : ''} · continues where you left off`
                      : 'Shopping assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    aria-label="Clear history"
                    title="Clear history"
                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Messages scroll area */}
          <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden">
            <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                      Hi! I'm ShopBot. Ask me about products, prices, payment methods, or how to check out. I remember our conversation between visits.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl ${ m.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-sm' }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 animate-spin" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Thinking…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div
            className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 w-full"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="max-w-3xl mx-auto w-full">
              {/* Suggested prompts strip */}
              <div className="px-3 sm:px-6 pt-3 pb-2 w-full overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
                    {messages.length === 0 ? 'Try asking' : 'Suggested'}
                  </p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      disabled={loading}
                      className="shrink-0 snap-start text-xs px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-3 sm:px-6 pb-3 pt-1 flex items-center gap-2 w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, orders…"
                  disabled={loading}
                  className="flex-1 min-w-0 text-sm px-4 py-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-gray-300 dark:focus:border-gray-500 focus:bg-white dark:focus:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-11 h-11 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
