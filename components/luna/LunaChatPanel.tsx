import { useState, useRef, useEffect, useCallback } from 'react';
import { matchSpreadByMessage, getSpreadById } from '../../utils/luna/spreadMatcher';
import { getAuthHeaders } from '../../lib/apiHeaders';

interface MessageAction {
  label: string;
  type: 'quick-entry' | 'link';
  href?: string;
  payload?: string;
}

export interface LunaMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: MessageAction[];
}

interface LunaChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: LunaMessage[];
  onMessagesChange: (msgs: LunaMessage[]) => void;
}

type ConversationMode = 'idle' | 'spread-select' | 'support';

const WELCOME_MESSAGE: LunaMessage = {
  role: 'assistant',
  content: '嗨，我是 Luna。\n不知道从哪里开始的话，就先来找我吧。',
  actions: [
    { label: '帮我选牌阵', type: 'quick-entry', payload: 'spread-select' },
    { label: '充值 / 使用问题', type: 'quick-entry', payload: 'support' },
  ],
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
  const [mode, setMode] = useState<ConversationMode>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!isLoading && isOpen && !isClosing) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isLoading, isOpen, isClosing]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  const appendMessages = useCallback(
    (current: LunaMessage[], ...newMsgs: LunaMessage[]) => {
      const updated = [...current, ...newMsgs];
      onMessagesChange(updated);
      return updated;
    },
    [onMessagesChange],
  );

  const handleSpreadSelect = useCallback(
    async (userText: string, current: LunaMessage[]) => {
      setIsLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/luna-spread-match', {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: userText }),
        });

        if (!res.ok) throw new Error('API failed');

        const data = await res.json();
        const spread = getSpreadById(data.spreadId);

        if (spread) {
          const reply: LunaMessage = {
            role: 'assistant',
            content: data.reason || `推荐你试试「${spread.name}」——${spread.description}`,
            actions: [
              { label: '去看看这个牌阵', type: 'link', href: spread.url },
              { label: '换个问题重新选', type: 'quick-entry', payload: 'spread-select' },
            ],
          };
          appendMessages(current, reply);
          setMode('idle');
          return;
        }
      } catch {
        // AI failed, fall through to keyword matching
      } finally {
        setIsLoading(false);
      }

      const result = matchSpreadByMessage(userText);
      const reply: LunaMessage = {
        role: 'assistant',
        content: result.message,
        actions: [
          { label: '去看看这个牌阵', type: 'link', href: result.spread.url },
          { label: '换个问题重新选', type: 'quick-entry', payload: 'spread-select' },
        ],
      };
      appendMessages(current, reply);
      setMode('idle');
    },
    [appendMessages],
  );

  const handleSupport = useCallback(
    (current: LunaMessage[]) => {
      const reply: LunaMessage = {
        role: 'assistant',
        content: '你想了解哪方面的问题？',
        actions: [
          { label: '如何充值 / 成为会员', type: 'quick-entry', payload: 'faq-membership' },
          { label: '占卜结果在哪里看', type: 'quick-entry', payload: 'faq-result' },
          { label: '联系人工客服', type: 'quick-entry', payload: 'faq-human' },
        ],
      };
      appendMessages(current, reply);
      setMode('idle');
    },
    [appendMessages],
  );

  const handleFaq = useCallback(
    (faqKey: string, current: LunaMessage[]) => {
      const answers: Record<string, string> = {
        'faq-membership':
          '目前会员功能还在完善中，部分高级牌阵会在页面上标注「会员专属」。后续我们会上线正式的会员系统，届时你可以在个人中心完成开通。\n\n如果你有其他问题，随时可以问我。',
        'faq-result':
          '你的占卜结果会在完成抽牌后直接展示在页面上。如果中途离开了页面，目前暂不支持历史记录查看，建议占卜时截图保存。\n\n后续我们会上线历史记录功能，敬请期待。',
        'faq-human':
          '目前暂未开通人工客服通道。如果你遇到了无法解决的问题，可以通过页面底部的联系方式给我们留言，我们会尽快回复。',
      };
      const reply: LunaMessage = {
        role: 'assistant',
        content: answers[faqKey] || '这个问题我暂时还回答不了，后续会继续完善。',
        actions: [
          { label: '我还有别的问题', type: 'quick-entry', payload: 'support' },
          { label: '返回主菜单', type: 'quick-entry', payload: 'home' },
        ],
      };
      appendMessages(current, reply);
    },
    [appendMessages],
  );

  const handleActionClick = useCallback(
    (action: MessageAction) => {
      if (action.type === 'link' && action.href) {
        window.location.href = action.href;
        return;
      }

      const payload = action.payload;
      if (!payload) return;

      const userMsg: LunaMessage = { role: 'user', content: action.label };
      const current = [...messages, userMsg];
      onMessagesChange(current);

      if (payload === 'spread-select') {
        const reply: LunaMessage = {
          role: 'assistant',
          content: '把你现在最想占卜的事情告诉我，我来帮你推荐更适合的牌阵。',
        };
        appendMessages(current, reply);
        setMode('spread-select');
        return;
      }

      if (payload === 'support') {
        handleSupport(current);
        return;
      }

      if (payload === 'home') {
        const homeReply: LunaMessage = {
          ...WELCOME_MESSAGE,
          content: '好的，还有什么我能帮你的吗？',
        };
        appendMessages(current, homeReply);
        setMode('idle');
        return;
      }

      if (payload.startsWith('faq-')) {
        handleFaq(payload, current);
        return;
      }
    },
    [messages, onMessagesChange, appendMessages, handleSupport, handleFaq],
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: LunaMessage = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    onMessagesChange(updated);
    setInput('');

    if (mode === 'spread-select') {
      await handleSpreadSelect(trimmed, updated);
      return;
    }

    setIsLoading(true);
    try {
      const contextMessages = updated
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const headers = await getAuthHeaders();
      const res = await fetch('/api/luna-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: contextMessages }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const assistantMsg: LunaMessage = {
        role: 'assistant',
        content: data.reply || '嗯，我好像走神了。你可以再说一次吗？',
      };
      onMessagesChange([...updated, assistantMsg]);
    } catch {
      const errorMsg: LunaMessage = {
        role: 'assistant',
        content: '我现在连接遇到了一点问题，请稍后再试。',
      };
      onMessagesChange([...updated, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, onMessagesChange, mode, handleSpreadSelect]);

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
          <img src="/assets/luna-avatar.png" alt="Luna" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">Luna</p>
          <p className="text-purple-300/60 text-xs">你的站内小助手</p>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          aria-label="Close chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[calc(70vh-120px)] scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary/80 text-white rounded-br-md'
                    : 'bg-white/[0.06] text-white/90 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>

            {/* Action buttons */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-0.5">
                {msg.actions.map((action, j) => (
                  <button
                    key={j}
                    onClick={() => handleActionClick(action)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                      action.type === 'link'
                        ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60'
                        : 'border-purple-400/20 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-purple-400/40'
                    }`}
                  >
                    {action.type === 'link' && (
                      <span className="mr-1">→</span>
                    )}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
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
        {mode === 'spread-select' && (
          <p className="text-[11px] text-purple-300/50 mb-1.5 px-1">
            描述你想占卜的事情，我来帮你匹配牌阵
          </p>
        )}
        <div className="flex items-end gap-2 bg-white/[0.04] rounded-xl px-3 py-2 ring-1 ring-purple-500/10 focus-within:ring-purple-500/30 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'spread-select' ? '比如：我想知道前任怎么想我...' : '输入你想说的...'}
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
