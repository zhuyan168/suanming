import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CelticCrossSlots from '../../../../components/fortune/CelticCrossSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { useMembership } from '../../../../hooks/useMembership';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 塔罗牌英文名称到中文名称的映射
const getChineseCardName = (englishName: string): string => {
  const nameMap: { [key: string]: string } = {
    // Major Arcana
    '0. The Fool': '愚者',
    'I. The Magician': '魔术师',
    'II. The High Priestess': '女祭司',
    'III. The Empress': '皇后',
    'IV. The Emperor': '皇帝',
    'V. The Hierophant': '教皇',
    'VI. The Lovers': '恋人',
    'VII. The Chariot': '战车',
    'VIII. Strength': '力量',
    'IX. The Hermit': '隐者',
    'X. Wheel of Fortune': '命运之轮',
    'XI. Justice': '正义',
    'XII. The Hanged Man': '倒吊人',
    'XIII. Death': '死神',
    'XIV. Temperance': '节制',
    'XV. The Devil': '恶魔',
    'XVI. The Tower': '塔',
    'XVII. The Star': '星星',
    'XVIII. The Moon': '月亮',
    'XIX. The Sun': '太阳',
    'XX. Judgement': '审判',
    'XXI. The World': '世界',
    
    // Cups - 圣杯
    'Ace of Cups': '圣杯王牌',
    'Two of Cups': '圣杯二',
    'Three of Cups': '圣杯三',
    'Four of Cups': '圣杯四',
    'Five of Cups': '圣杯五',
    'Six of Cups': '圣杯六',
    'Seven of Cups': '圣杯七',
    'Eight of Cups': '圣杯八',
    'Nine of Cups': '圣杯九',
    'Ten of Cups': '圣杯十',
    'Page of Cups': '圣杯侍者',
    'Knight of Cups': '圣杯骑士',
    'Queen of Cups': '圣杯王后',
    'King of Cups': '圣杯国王',
    
    // Pentacles - 星币
    'Ace of Pentacles': '星币王牌',
    'Two of Pentacles': '星币二',
    'Three of Pentacles': '星币三',
    'Four of Pentacles': '星币四',
    'Five of Pentacles': '星币五',
    'Six of Pentacles': '星币六',
    'Seven of Pentacles': '星币七',
    'Eight of Pentacles': '星币八',
    'Nine of Pentacles': '星币九',
    'Ten of Pentacles': '星币十',
    'Page of Pentacles': '星币侍者',
    'Knight of Pentacles': '星币骑士',
    'Queen of Pentacles': '星币王后',
    'King of Pentacles': '星币国王',
    
    // Swords - 宝剑
    'Ace of Swords': '宝剑王牌',
    'Two of Swords': '宝剑二',
    'Three of Swords': '宝剑三',
    'Four of Swords': '宝剑四',
    'Five of Swords': '宝剑五',
    'Six of Swords': '宝剑六',
    'Seven of Swords': '宝剑七',
    'Eight of Swords': '宝剑八',
    'Nine of Swords': '宝剑九',
    'Ten of Swords': '宝剑十',
    'Page of Swords': '宝剑侍者',
    'Knight of Swords': '宝剑骑士',
    'Queen of Swords': '宝剑王后',
    'King of Swords': '宝剑国王',
    
    // Wands - 权杖
    'Ace of Wands': '权杖王牌',
    'Two of Wands': '权杖二',
    'Three of Wands': '权杖三',
    'Four of Wands': '权杖四',
    'Five of Wands': '权杖五',
    'Six of Wands': '权杖六',
    'Seven of Wands': '权杖七',
    'Eight of Wands': '权杖八',
    'Nine of Wands': '权杖九',
    'Ten of Wands': '权杖十',
    'Page of Wands': '权杖侍者',
    'Knight of Wands': '权杖骑士',
    'Queen of Wands': '权杖王后',
    'King of Wands': '权杖国王',
  };
  
  return nameMap[englishName] || englishName;
};

// 牌位名称与含义
const POSITION_INFO = [
  { name: '现状', desc: '代表你当前面对的核心情况' },
  { name: '阻碍', desc: '阻挡你前进的挑战或障碍' },
  { name: '重点', desc: '这个问题的焦点或意识层面的关键' },
  { name: '过去', desc: '影响现状的过去事件或根源' },
  { name: '优势', desc: '你拥有的资源、可能性或最佳潜力' },
  { name: '近期', desc: '即将到来的发展方向' },
  { name: '应对', desc: '你可以采取的态度或行动' },
  { name: '提醒', desc: '外部环境或周围人对你的影响' },
  { name: '期待恐惧', desc: '你内心深处的希望或担忧' },
  { name: '走向', desc: '最终可能的结果或发展方向' },
];

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_celtic_cross_question';
const RESULT_STORAGE_KEY = 'general_celtic_cross_draw_result';

// 结果数据接口
interface CelticCrossResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
}

// 从 localStorage 读取结果
const loadResult = (): CelticCrossResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load celtic cross result:', error);
    return null;
  }
};

// 会员提示弹窗组件
function MembershipModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToMembership = () => {
    // TODO: 后续接入会员系统后，跳转到会员开通页面
    // router.push('/membership');
    alert('会员系统即将上线，敬请期待！');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-[#1a1a2e] rounded-2xl border border-primary/30 shadow-2xl overflow-hidden">
          {/* 顶部装饰 */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* 内容区域 */}
          <div className="p-8">
            {/* 图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-white text-2xl font-bold text-center mb-4">
              会员专属解读
            </h3>

            {/* 说明 */}
            <p className="text-white/70 text-center leading-relaxed mb-8">
              这是会员专属解读功能。<br />开通会员后即可开始解读（功能即将上线）。
            </p>

            {/* 按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoToMembership}
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
              >
                去开通会员
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function CelticCrossRevealPage() {
  const router = useRouter();
  const { isMember } = useMembership();
  const [result, setResult] = useState<CelticCrossResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载抽牌结果
    const saved = loadResult();
    if (!saved) {
      // 如果没有结果，跳转回问题输入页
      router.replace('/reading/general/celtic-cross/question');
      return;
    }
    
    setResult(saved);

    // 加载问题
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    if (savedQuestion) {
      setQuestion(savedQuestion);
    }
  }, [router]);

  const handleRedraw = () => {
    if (!confirm('确定要重新占卜吗？当前结果将被清空。')) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(QUESTION_STORAGE_KEY);
    }
    
    router.push('/reading/general/celtic-cross/question');
  };

  const handleStartInterpretation = () => {
    // TODO: 后续接入会员系统后，在此处校验会员状态
    if (!isMember) {
      // 非会员：显示会员提示弹窗
      setIsModalOpen(true);
      return;
    }
    
    // 会员：跳转到解读页
    // TODO: 解读页开发中
    router.push('/reading/general/celtic-cross/reading');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleBackToList = () => {
    router.push('/reading/general');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-white/70">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>凯尔特十字牌阵 - 结果展示 | Mystic Insights</title>
        <meta name="description" content="查看你的凯尔特十字牌阵占卜结果" />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">返回</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Mystic Insights
            </h2>
          </div>

          <button
            onClick={handleRedraw}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">重新占卜</span>
          </button>
        </header>

        {/* 主内容 */}
        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                CELTIC CROSS SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                凯尔特十字牌阵
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                牌已就位，以下是你抽到的十张塔罗牌
              </p>
            </motion.div>

            {/* 问题展示区域 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 mx-auto max-w-3xl"
            >
              <div className="rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                    psychology
                  </span>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs font-medium mb-1">你的问题</p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {question || '你没有写下具体问题，我们将以你当下的能量趋势进行解读'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 卡牌展示区域 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <CelticCrossSlots
                cards={result.cards}
                isAnimating={Array(10).fill(false)}
                showLoadingText={false}
                forceFlipped={true}
              />

              {/* 卡牌信息列表 */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {result.cards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-primary/80 text-xs font-medium">
                          {POSITION_INFO[index].name}
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-semibold text-sm mb-1">
                      {getChineseCardName(card.name)}
                    </h3>
                    
                    <p className="text-white/70 text-xs mb-2">
                      {card.orientation === 'upright' ? '正位' : '逆位'}
                    </p>
                    
                    <p className="text-white/50 text-xs leading-relaxed">
                      {POSITION_INFO[index].desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* 付费提示区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-amber-400 text-2xl mt-1">
                    workspace_premium
                  </span>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2 text-lg">
                      解读需开通会员
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      凯尔特十字属于深度牌阵，解读会更详细也更耗时。你可以先根据牌位含义自行阅读牌面；如果想获得更完整、更有结构的解读，可以开通会员后解锁「开始解读」。
                    </p>
                    <div className="flex items-center gap-2 text-amber-400/90 text-xs">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>会员系统即将上线，敬请期待</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 操作按钮区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-8 space-y-4"
              >
                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartInterpretation}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)] relative overflow-hidden"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      开始解读
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-500/50">
                        会员
                      </span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToHome}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/10"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">home</span>
                      返回首页
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* 底部提示 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="mt-8 flex justify-center"
              >
                <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                  <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">
                    auto_awesome
                  </span>
                  <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                    占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。
                  </p>
                  <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>
                    auto_awesome
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* 会员提示弹窗 */}
      <MembershipModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
