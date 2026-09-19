import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2 } from 'lucide-react';

const AVATAR_SRC = '/meye-avatar.jpg';
import { useTheme } from '../../contexts/ThemeContext';

// Vite proxies /n8n-chat → n8n webhook (avoids CORS in development).
const N8N_CHAT_URL = '/n8n-chat';
const ASSISTANT_NAME = 'মেয়ে';

function TypingIndicator({ isDark }) {
  return (
    <div className="flex items-end gap-2">
      <img
        src={AVATAR_SRC}
        alt={ASSISTANT_NAME}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-violet-400/40"
      />
      <div
        className={`px-4 py-3 rounded-2xl rounded-bl-sm ${
          isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
        }`}
      >
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg, isDark }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          }`}
        >
          <User className="w-4 h-4 text-white" />
        </div>
      ) : (
        <img
          src={AVATAR_SRC}
          alt={ASSISTANT_NAME}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-violet-400/40"
        />
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? `rounded-2xl rounded-br-sm text-white ${
                isDark
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`
            : `rounded-2xl rounded-bl-sm ${
                isDark
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 হ্যালো! আমি ${ASSISTANT_NAME}। আপনাকে কীভাবে সাহায্য করতে পারি?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId,
          chatInput: text,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      // n8n returns { output: "..." } or { message: "..." }
      const reply =
        data?.output ||
        data?.message ||
        data?.text ||
        data?.response ||
        (typeof data === 'string' ? data : null) ||
        "I'm sorry, I couldn't understand the response.";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Something went wrong: ${err.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`fixed bottom-24 right-5 z-50 w-[360px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-slate-800 border border-white/10'
                : 'bg-slate-50 border border-slate-200'
            }`}
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div
              className={`flex items-center gap-3 px-4 py-3 flex-shrink-0 ${
                isDark
                  ? 'bg-gradient-to-r from-violet-700 to-blue-700'
                  : 'bg-gradient-to-r from-violet-600 to-blue-500'
              }`}
            >
              <img
                src={AVATAR_SRC}
                alt={ASSISTANT_NAME}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/30 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{ASSISTANT_NAME}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/75 text-xs">Online</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} isDark={isDark} />
              ))}
              {isLoading && <TypingIndicator isDark={isDark} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`flex-shrink-0 px-3 py-3 border-t ${
                isDark ? 'border-white/10 bg-slate-800' : 'border-slate-200 bg-white'
              }`}
            >
              <div
                className={`flex items-end gap-2 rounded-xl px-3 py-2 ${
                  isDark
                    ? 'bg-slate-700 border border-white/10'
                    : 'bg-slate-100 border border-slate-200'
                }`}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  className={`flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-slate-400 leading-relaxed py-0.5 max-h-28 overflow-y-auto ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}
                  style={{ fieldSizing: 'content' }}
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md hover:shadow-violet-500/30 hover:scale-105'
                      : isDark
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <p
                className={`text-center text-[10px] mt-2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Powered by n8n · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle button */}
      <motion.button
        id="chat-widget-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full shadow-xl overflow-hidden"
        style={{ boxShadow: '0 4px 28px rgba(124,58,237,0.55)' }}
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-blue-500"
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
            >
              <img
                src={AVATAR_SRC}
                alt={ASSISTANT_NAME}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
