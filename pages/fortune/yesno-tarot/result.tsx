import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { getYesNoByCard, getAnswerText, YesNoAnswer } from '../../../utils/yesno-tarot-logic';

interface ShuffledTarotCard {
  id: number;
  name: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
  orientation: 'upright' | 'reversed';
}

interface YesNoTarotDraw {
  timestamp: number;
  card: ShuffledTarotCard;
}

// LocalStorage keys
const STORAGE_KEY_DRAW = 'yesno_tarot_draw_v1';
const STORAGE_KEY_QUESTION = 'yesno_tarot_question_v1';

export default function YesNoTarotResult() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [card, setCard] = useState<ShuffledTarotCard | null>(null);
  const [answer, setAnswer] = useState<YesNoAnswer | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 读取抽牌结果
    const drawData = localStorage.getItem(STORAGE_KEY_DRAW);
    if (!drawData) {
      // 如果没有抽牌结果，跳转回抽牌页
      router.replace('/');
      return;
    }

    const draw: YesNoTarotDraw = JSON.parse(drawData);
    setCard(draw.card);

    // 读取用户问题
    const savedQuestion = localStorage.getItem(STORAGE_KEY_QUESTION) || '';
    setQuestion(savedQuestion);

    // 判断是否使用AI解读
    const hasQuestion = savedQuestion.trim().length > 0;
    setUseAI(hasQuestion);

    if (hasQuestion) {
      // 有问题：调用AI生成解读
      fetchAIInterpretation(savedQuestion, draw.card);
    } else {
      // 无问题：使用本地映射表
      const result = getYesNoByCard(draw.card.name, draw.card.orientation);
      setAnswer(result.answer);
      setInterpretation(result.reason);
      setIsLoading(false);
    }
  }, [router]);

  const fetchAIInterpretation = async (userQuestion: string, drawnCard: ShuffledTarotCard) => {
    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          cardName: drawnCard.name,
          orientation: drawnCard.orientation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取解读失败');
      }

      // 解析AI返回的答案
      const aiAnswer = data.answer.toLowerCase();
      let parsedAnswer: YesNoAnswer = 'MAYBE';
      if (aiAnswer.includes('yes') || aiAnswer.includes('是')) {
        parsedAnswer = 'YES';
      } else if (aiAnswer.includes('no') || aiAnswer.includes('否')) {
        parsedAnswer = 'NO';
      }

      setAnswer(parsedAnswer);
      setInterpretation(data.interpretation || data.answer);
      setIsLoading(false);
    } catch (error) {
      console.error('获取AI解读失败:', error);
      // 降级到本地映射表
      const result = getYesNoByCard(drawnCard.name, drawnCard.orientation);
      setAnswer(result.answer);
      setInterpretation(result.reason + '\n\n（AI解读暂时不可用，这是基于牌意的简要判断）');
      setIsLoading(false);
    }
  };

  const handleNewReading = () => {
    if (typeof window === 'undefined') return;
    // 清除所有数据
    localStorage.removeItem(STORAGE_KEY_DRAW);
    localStorage.removeItem(STORAGE_KEY_QUESTION);
    // 跳转到首页并自动打开提问弹窗
    router.push('/?tarot=true');
  };

  if (!card || isLoading) {
    return (
      <div className="dark">
        <Head>
          <title>是否塔罗 - 解读中</title>
        </Head>
        <div className="font-display bg-[#191022] min-h-screen text-white flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #7f13ec 0deg, #7f13ec 270deg, transparent 270deg, transparent 360deg)',
                }}
              />
              <div className="absolute inset-0 rounded-full bg-[#191022]" style={{ margin: '4px' }} />
            </div>
            <p className="text-white/70 text-lg">正在解读中...</p>
          </div>
        </div>
      </div>
    );
  }

  const answerColor = answer === 'YES' ? 'text-green-400' : answer === 'NO' ? 'text-red-400' : 'text-yellow-400';
  const answerBgColor = answer === 'YES' ? 'from-green-500/10' : answer === 'NO' ? 'from-red-500/10' : 'from-yellow-500/10';

  return (
    <div className="dark">
      <Head>
        <title>是否塔罗 - 解读结果</title>
        <meta name="description" content="查看你的塔罗指引" />
      </Head>

      <div className="font-display bg-[#191022] min-h-screen text-white">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#191022]/80 backdrop-blur-sm">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm font-medium">首页</span>
          </button>
          
          <h2 className="text-lg font-bold">Mystic Insights</h2>

          <button
            onClick={handleNewReading}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-sm font-medium hidden sm:inline">新占卜</span>
          </button>
        </header>

        {/* 主内容 */}
        <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            {/* 标题 */}
            <div className="text-center mb-12">
              <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">Yes/No Tarot</p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                你的塔罗指引
              </h1>
            </div>

            {/* 用户问题（如果有） */}
            {question && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 text-center"
              >
                <p className="text-sm font-medium text-primary/80 mb-2 uppercase tracking-wider">Your Question</p>
                <p className="text-lg text-white/95 leading-relaxed font-medium">{question}</p>
              </motion.div>
            )}

            <div className="grid gap-8 md:grid-cols-[minmax(0,300px)_1fr]">
              {/* 左侧：卡牌 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="perspective w-full flex justify-center">
                  <div className="w-48 h-72 sm:w-56 sm:h-80 overflow-hidden rounded-3xl border-2 border-primary/30 bg-black/20 shadow-[0_0_30px_rgba(127,19,236,0.4)]">
                    <img
                      src={card.image}
                      alt={card.name}
                      className={`w-full h-full object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{card.name}</h3>
                  <p className="text-sm text-white/60">
                    {card.orientation === 'upright' ? '正位' : '逆位'} · {card.orientation === 'upright' ? card.upright : card.reversed}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {card.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 右侧：解读 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-6"
              >
                {/* 答案 */}
                <div className={`rounded-2xl border border-primary/30 bg-gradient-to-br ${answerBgColor} to-transparent p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`material-symbols-outlined ${answerColor} text-3xl`}>
                      {answer === 'YES' ? 'check_circle' : answer === 'NO' ? 'cancel' : 'help'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white/70 uppercase tracking-wider">答案</p>
                      <p className={`text-4xl font-black ${answerColor}`}>
                        {answer ? getAnswerText(answer) : '未知'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 解读 */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">解读</p>
                  <p className="text-base leading-relaxed text-white/90 whitespace-pre-line">
                    {interpretation}
                  </p>
                </div>

                {/* 温馨提示 */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/60 leading-relaxed">
                    ✨ 塔罗牌只是工具，它反映的是当下的能量和可能性。最终的选择权在你手中，请结合自身情况和内心感受做出决定。
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleNewReading}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    再问一个
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-semibold transition-all hover:bg-white/10"
                  >
                    返回首页
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
