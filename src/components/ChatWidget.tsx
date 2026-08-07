import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
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
];

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Logo size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">ShopBot</p>
                <p className="text-[11px] text-gray-300 leading-tight">Shopping assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Hi! I'm ShopBot. Ask me about products, prices, or how to check out.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Try asking</p>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-gray-100 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-gray-900 text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                  <span className="text-xs text-gray-500">Thinking…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, orders…"
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
