import { useState, useEffect, useCallback, useRef } from 'react';
import LunaChatPanel from './LunaChatPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingLuna() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Bubble visibility: 'hidden' -> 'visible' -> 'fading' -> 'hidden'
  const [bubbleState, setBubbleState] = useState<'hidden' | 'visible' | 'fading'>('hidden');
  // Once user clicks Luna, never auto-show bubble again
  const lunaClickedRef = useRef(false);
  // How many times bubble has auto-appeared (max 2)
  const autoShowCountRef = useRef(0);
  // Track active timers for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  // Fade out the bubble with animation
  const fadeBubble = useCallback(() => {
    setBubbleState((cur) => {
      if (cur !== 'visible') return cur;
      setTimeout(() => setBubbleState('hidden'), 400);
      return 'fading';
    });
  }, []);

  // Show bubble once, auto-hide after 5s, respects max count & lunaClicked
  const showBubbleOnce = useCallback(() => {
    if (lunaClickedRef.current) return;
    if (autoShowCountRef.current >= 2) return;

    autoShowCountRef.current += 1;
    setBubbleState('visible');

    addTimer(() => fadeBubble(), 5000);
  }, [addTimer, fadeBubble]);

  // First appearance: 4s after page load
  useEffect(() => {
    addTimer(() => showBubbleOnce(), 4000);
    return clearAllTimers;
  }, []);

  // Second appearance: 15s of no interaction after first bubble disappears
  // Resets on scroll, click, or keydown
  useEffect(() => {
    if (lunaClickedRef.current) return;
    if (autoShowCountRef.current < 1) return; // wait for first show to finish
    if (autoShowCountRef.current >= 2) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (lunaClickedRef.current || autoShowCountRef.current >= 2) return;
      idleTimer = setTimeout(() => showBubbleOnce(), 15000);
    };

    // Start idle tracking once bubble has hidden after first show
    if (bubbleState === 'hidden' && autoShowCountRef.current === 1) {
      resetIdle();
      window.addEventListener('scroll', resetIdle, { passive: true });
      window.addEventListener('click', resetIdle);
      window.addEventListener('keydown', resetIdle);
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, [bubbleState, showBubbleOnce]);

  const handleAvatarClick = useCallback(() => {
    lunaClickedRef.current = true;
    clearAllTimers();
    // Hide bubble immediately if showing
    if (bubbleState === 'visible') {
      setBubbleState('fading');
      setTimeout(() => setBubbleState('hidden'), 400);
    } else {
      setBubbleState('hidden');
    }
    setIsChatOpen((prev) => !prev);
  }, [bubbleState, clearAllTimers]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <>
      {/* Floating Luna avatar button */}
      <button
        onClick={handleAvatarClick}
        className="fixed bottom-6 right-4 sm:bottom-20 sm:right-14 lg:right-16 z-[9999] w-[48px] h-[48px] sm:w-[72px] sm:h-[72px] lg:w-[76px] lg:h-[76px] rounded-full overflow-hidden cursor-pointer animate-luna-breathe hover:scale-110 transition-transform duration-300 focus:outline-none"
        aria-label="Chat with Luna"
      >
        <img
          src="/assets/luna-avatar.png"
          alt="Luna"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </button>

      {/* Hint bubble */}
      {bubbleState !== 'hidden' && (
        <div
          className={`fixed bottom-[68px] right-4 sm:bottom-[160px] sm:right-14 lg:bottom-[168px] lg:right-16 z-[9999] max-w-[220px] sm:max-w-[280px] ${
            bubbleState === 'fading' ? 'animate-luna-bubble-out' : 'animate-luna-bubble-in'
          }`}
        >
          <div className="relative bg-[#1a1025]/95 border border-purple-400/25 rounded-xl px-5 py-3.5 shadow-lg shadow-purple-900/30 backdrop-blur-sm">
            <p className="text-white/90 text-sm leading-relaxed">
            嗨，我是 Luna。不知道从哪里开始，就先来找我吧。
            </p>
            {/* Tail arrow pointing to avatar */}
            <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-[#1a1025]/95 border-r border-b border-purple-400/25 rotate-45" />
          </div>
        </div>
      )}

      {/* Chat panel */}
      <LunaChatPanel
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        messages={messages}
        onMessagesChange={setMessages}
      />
    </>
  );
}
