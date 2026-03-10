import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LunaChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onMessagesChange: (msgs: Message[]) => void;
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    '嗨，我是 Luna。你不需要想好要问什么，有时候，只是开口说说，就已经是一个好的开始了。',
};

export default function LunaChatPanel({
  isOpen,
  onClose,
  messages,
  onMessagesChange,
}: LunaChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      onMessagesChange([WELCOME_MESSAGE]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isClosing) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, isClosing]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    onMessagesChange(updated);
    setInput('');

    setIsLoading(true);
    try {
      // Only send last 20 messages for context window management
      const contextMessages = updated
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/luna-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: contextMessages }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Hmm, I seem to have lost my train of thought. Could you try again?',
      };
      onMessagesChange([...updated, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Please try again in a moment.",
      };
      onMessagesChange([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, onMessagesChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed bottom-[80px] right-2 sm:bottom-[160px] sm:right-14 lg:bottom-[168px] lg:right-16 z-[9998] w-[calc(100vw-1rem)] sm:w-[380px] max-h-[72vh] sm:max-h-[65vh] flex flex-col rounded-2xl border border-purple-500/20 bg-[#1a1025] shadow-2xl shadow-purple-900/30 ${
        isClosing ? 'animate-luna-panel-out' : 'animate-luna-panel-in'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/10">
        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-purple-500/30 flex-shrink-0">
          <img
            src="/assets/luna-avatar.png"
            alt="Luna"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">Luna</p>
          <p className="text-purple-300/60 text-xs">Tarot Companion</p>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          aria-label="Close chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[calc(70vh-120px)] scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/80 text-white rounded-br-md'
                  : 'bg-white/[0.06] text-white/90 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-purple-500/10">
        <div className="flex items-end gap-2 bg-white/[0.04] rounded-xl px-3 py-2 ring-1 ring-purple-500/10 focus-within:ring-purple-500/30 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your thoughts..."
            rows={1}
            className="flex-1 bg-transparent text-white/90 text-sm resize-none outline-none placeholder:text-white/25 max-h-[80px] min-h-[24px]"
            style={{ height: 'auto', overflow: 'hidden' }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 80) + 'px';
              el.style.overflow = el.scrollHeight > 80 ? 'auto' : 'hidden';
            }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/80 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary transition-colors"
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
