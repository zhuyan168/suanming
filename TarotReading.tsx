declare const React: typeof import("react");
declare const ReactDOM: typeof import("react-dom/client");

const { useEffect, useMemo, useRef, useState } = React;

const TAROT_TRIGGER_EVENT = "tarot-reading:open";

const registerTarotTriggers = (): void => {
  const triggers = document.querySelectorAll<HTMLElement>("[data-tarot-trigger]");
  triggers.forEach((trigger) => {
    if (trigger.dataset.tarotBound === "true") {
      return;
    }

    trigger.dataset.tarotBound = "true";
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(TAROT_TRIGGER_EVENT));
    });
  });
};

type TarotCard = {
  id: number;
  name: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
};

type Orientation = "upright" | "reversed";

type DrawResult = {
  card: TarotCard;
  orientation: Orientation;
  interpretation: string;
};

const tarotCards: TarotCard[] = [
  {
    id: 0,
    name: "0. The Fool",
    image: "https://images.unsplash.com/photo-1541182388496-ac92a2239f84?auto=format&fit=crop&w=600&q=80",
    upright: "新的开始、信任直觉、勇敢冒险",
    reversed: "冲动行事、犹豫不决、方向不明",
    keywords: ["纯真", "自由", "机会"],
  },
  {
    id: 1,
    name: "I. The Magician",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    upright: "资源整合、贯彻执行、影响力",
    reversed: "分散注意、欺骗、缺乏计划",
    keywords: ["行动", "意志", "显化"],
  },
  {
    id: 2,
    name: "II. The High Priestess",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
    upright: "内在智慧、直觉洞察、保持沉静",
    reversed: "忽略直觉、情绪混乱、资讯不明",
    keywords: ["直觉", "秘密", "平衡"],
  },
  {
    id: 3,
    name: "VI. The Lovers",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    upright: "真诚连接、重要抉择、价值一致",
    reversed: "矛盾、分歧、失去平衡",
    keywords: ["关系", "信任", "选择"],
  },
  {
    id: 4,
    name: "XVII. The Star",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    upright: "希望重燃、疗愈、灵感源泉",
    reversed: "信心不足、能量枯竭、迟滞",
    keywords: ["希望", "指引", "灵性"],
  },
  {
    id: 5,
    name: "XIX. The Sun",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    upright: "乐观、成功、清晰洞见",
    reversed: "延迟、自满、暂时挫折",
    keywords: ["活力", "喜悦", "成长"],
  },
  {
    id: 6,
    name: "XVIII. The Moon",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80",
    upright: "潜意识、梦境、面对不安",
    reversed: "困惑解除、真相浮现、逐渐明朗",
    keywords: ["直觉", "感受", "阴影"],
  },
  {
    id: 7,
    name: "XVI. The Tower",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    upright: "突发变化、觉醒、旧结构崩塌",
    reversed: "抗拒改变、延迟崩解、局部冲击",
    keywords: ["变革", "释放", "突破"],
  },
];

const uprightTemplates: Array<(card: TarotCard, question: string) => string> = [
  (card, question) => `关于“${question}”，${card.name} 正位提醒你：${card.upright}。保持开阔的心，主动迎接机会。`,
  (card, question) => `你心中的问题“${question}”得到这张牌的回应。正位的 ${card.name} 鼓励你踏实运用资源，让愿望逐步显化。`,
  (card, question) => `${card.name} 在正位出现，象征你的直觉与理性保持一致。相信你对“${question}”的判断，并勇敢实践。`,
  (card, question) => `正位的 ${card.name} 表示：${card.upright}。在处理“${question}”时，不妨给自己更多信任与承诺。`,
];

const reversedTemplates: Array<(card: TarotCard, question: string) => string> = [
  (card, question) => `面对“${question}”，${card.name} 逆位提示你留意：${card.reversed}。请放慢脚步，先厘清内心真正的需求。`,
  (card, question) => `当 ${card.name} 以逆位回应“${question}”时，意味着目前能量不稳定，需要你重新调整节奏与策略。`,
  (card, question) => `逆位的 ${card.name} 暗示：${card.reversed}。处理“${question}”时，可以先整理情绪，等待更明确的讯号。`,
  (card, question) => `关于“${question}”，这张牌的逆位提醒你先修复根基，再作决定，这样才能避免重复旧的模式。`,
];

const pickRandom = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const generateInterpretation = (card: TarotCard, orientation: Orientation, question: string): string => {
  const normalizedQuestion = question.trim();
  const displayQuestion = normalizedQuestion.length > 0 ? normalizedQuestion : "这个主题";
  const templates = orientation === "upright" ? uprightTemplates : reversedTemplates;
  const template = pickRandom(templates);
  return template(card, displayQuestion);
};

const cardBackWords = ["专注", "能量", "命运", "直觉", "旅程", "灵感"];

const TarotReading = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);

  const cardBackIndices = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);

  useEffect(() => {
    registerTarotTriggers();

    const handleOpen = () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setDrawResult(null);
      setQuestion("");
      setError(null);
      setIsOpen(true);
    };

    window.addEventListener(TAROT_TRIGGER_EVENT, handleOpen);
    return () => {
      window.removeEventListener(TAROT_TRIGGER_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen && questionInputRef.current) {
      questionInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setQuestion("");
      setError(null);
      setDrawResult(null);
    }, 320);
  };

  const handleDrawCard = () => {
    if (!question.trim()) {
      setError("请先输入你的问题，再开始抽牌。");
      return;
    }

    setError(null);
    const card = pickRandom(tarotCards);
    const orientation: Orientation = Math.random() > 0.5 ? "upright" : "reversed";
    const interpretation = generateInterpretation(card, orientation, question);

    setDrawResult({
      card,
      orientation,
      interpretation,
    });
  };

  const handleDrawAgain = () => {
    setError(null);
    setDrawResult(null);
  };

  const isDrawDisabled = question.trim().length === 0;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-background-dark/95 via-background-dark/90 to-black/90 backdrop-blur-md"
        onClick={handleClose}
      ></div>
      <section
        className={`relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >
        <button
          aria-label="关闭塔罗占卜面板"
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white"
          type="button"
          onClick={handleClose}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <header className="mb-6 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">塔罗占卜</p>
          <h2 className="text-3xl font-black leading-tight tracking-tight">静心提问，抽取你的指引</h2>
          <p className="text-sm text-white/70">请在心中专注你的问题，深呼吸三次后开始抽牌。相信宇宙会为你带来最适合的讯息。</p>
        </header>

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/80" htmlFor="tarot-question">
              你的问题
            </label>
            <textarea
              id="tarot-question"
              ref={questionInputRef}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              maxLength={160}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="例如：我应该接受新的工作机会吗？"
            ></textarea>
            <div className="mt-2 flex items-center justify-between text-xs text-white/50">
              <span>最多 160 字</span>
              <span>{question.length}/160</span>
            </div>
            {error ? <p className="mt-2 text-sm text-orange-300">{error}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleDrawCard}
              disabled={isDrawDisabled}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition ${isDrawDisabled ? "cursor-not-allowed bg-white/10 text-white/30" : "bg-primary text-white shadow-glow hover:bg-primary/90"}`}
            >
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              抽牌
            </button>
            {drawResult ? (
              <button
                type="button"
                onClick={handleDrawAgain}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
                再次抽牌
              </button>
            ) : null}
          </div>

          {drawResult ? (
            <div className="animate-fade-in rounded-3xl border border-white/10 bg-black/25 p-6">
              <div className="mb-6 flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.35em] text-primary">你的问题</span>
                <p className="text-lg font-semibold text-white">{question}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr]">
                <div className="flex flex-col items-center gap-4">
                  <div className="perspective w-full flex justify-center">
                    <div className="animate-flip-in h-72 w-48 overflow-hidden rounded-3xl border border-white/15 bg-black/20 shadow-glow">
                      <img
                        src={drawResult.card.image}
                        alt={drawResult.card.name}
                        className={`h-full w-full object-cover transition-transform duration-500 ${drawResult.orientation === "reversed" ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">若出现逆位，牌面将倒置显示。</p>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{drawResult.card.name}</h3>
                    <p className="mt-1 text-sm text-white/60">
                      {drawResult.orientation === "upright" ? "正位" : "逆位"} · {drawResult.orientation === "upright" ? drawResult.card.upright : drawResult.card.reversed}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {drawResult.card.keywords.map((keyword) => (
                      <span key={keyword} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-white/80">
                    {drawResult.interpretation}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleDrawAgain}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-lg">shuffle</span>
                      重新洗牌
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      结束占卜
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm text-white/70">直觉会带你挑选最适合的牌。让目光在牌阵掠过，停留在最吸引你的那一张，然后点击“抽牌”。</p>
              <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {cardBackIndices.map((index) => (
                  <div
                    key={index}
                    className="flex h-32 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/20 via-transparent to-white/5 text-xs font-semibold uppercase tracking-[0.45em] text-white/40"
                  >
                    {cardBackWords[index % cardBackWords.length]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

registerTarotTriggers();

const rootElement = document.getElementById("tarot-reading-root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<TarotReading />);
}

window.addEventListener("focus", registerTarotTriggers);

