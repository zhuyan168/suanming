import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useMembership } from '../../hooks/useMembership';

export default function MonthlyFortune() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const { isMember } = useMembership();

  const texts = isEn ? {
    pageTitle: 'Monthly Tarot Readings — FateAura',
    back: 'Back',
    sectionLabel: 'MONTHLY TAROT',
    h1: 'Choose Your Monthly Reading',
    subtitle: 'Start with a quick three-card overview or unlock a deeper seven-card monthly spread.',
    basicTitle: 'Three-Card Monthly Reading',
    basicSubtitle: 'A clear snapshot of this month\'s overall energy and direction.',
    basicButton: 'Start Free Reading',
    memberTitle: 'Seven-Card Monthly Deep Dive',
    memberSubtitle: 'A fuller look at love, career, wealth, relationships, month-end energy, and practical guidance.',
    memberButtonUnlocked: 'Start Member Reading',
    memberButtonLocked: 'Unlock Full Reading',
    memberBadge: 'Member',
  } : {
    pageTitle: '月度运势 - FateAura',
    back: '返回首页',
    sectionLabel: '月度运势',
    h1: '本月你的命运走向如何？',
    subtitle: '选择一种牌阵开始占卜。',
    basicTitle: '三张牌月度运势（免费）',
    basicSubtitle: '快速了解你本月的整体走向。',
    basicButton: '开始占卜',
    memberTitle: '月度运势深层解析（会员）',
    memberSubtitle: '事业 / 财运 / 感情 / 人际 / 能量全方面解析。',
    memberButtonUnlocked: '开始深度占卜',
    memberButtonLocked: '解锁完整占卜',
    memberBadge: '会员',
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleCardClick = (path: string, isPremium: boolean = false) => {
    // 会员或免费功能，正常跳转
    // 暂时绕过会员检查，方便查看界面
    // if (isPremium && !isMember) {
    //   router.push('/membership/unlock');
    //   return;
    // }
    
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>{texts.pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-flow {
            animation: flow 20s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 5px 0px rgba(127, 19, 236, 0.4), 0 0 2px 0px rgba(127, 19, 236, 0.2);
            }
            50% {
              box-shadow: 0 0 10px 2px rgba(127, 19, 236, 0.6), 0 0 4px 1px rgba(127, 19, 236, 0.4);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
          }
          html.dark,
          html.dark body {
            background-color: #191022;
          }
        ` }} />
        
      </Head>
      
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white">
          {/* 头部 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">{texts.back}</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <img
                    src="/favicon.png"
                    alt=""
                    aria-hidden="true"
                    className="size-8 rounded-md object-cover shrink-0"
                  />
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">FateAura</h2>
            </div>
            <div className="w-20"></div> {/* 占位，保持标题居中 */}
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
              {/* 标题区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">{texts.sectionLabel}</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {texts.h1}
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  {texts.subtitle}
                </p>
              </motion.div>

              {/* 入口卡片区域 */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-6xl mx-auto">
                {/* 左侧卡片 - 三张牌阵（免费版） */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 md:w-1/2 min-h-[400px]"

                >
                  <CardEntry
                    title={texts.basicTitle}
                    subtitle={texts.basicSubtitle}
                    buttonText={texts.basicButton}
                    cardCount={3}
                    layout="horizontal"
                    onClick={() => handleCardClick('/fortune/monthly/basic', false)}
                  />
                </motion.div>

                {/* 右侧卡片 - 七张牌阵（会员版） */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex-1 md:w-1/2 min-h-[400px]"
                >
                  <CardEntry
                    title={texts.memberTitle}
                    subtitle={texts.memberSubtitle}
                    buttonText={isMember ? texts.memberButtonUnlocked : texts.memberButtonLocked}
                    cardCount={7}
                    layout="grid"
                    onClick={() => handleCardClick('/fortune/monthly/member', true)}
                    isPremium={true}
                    memberBadge={texts.memberBadge}
                  />
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// 入口卡片组件
interface CardEntryProps {
  title: string;
  subtitle: string;
  buttonText: string;
  cardCount: number;
  layout: 'horizontal' | 'grid';
  onClick: () => void;
  isPremium?: boolean;
  memberBadge?: string;
}

function CardEntry({ title, subtitle, buttonText, cardCount, layout, onClick, isPremium = false, memberBadge = '会员' }: CardEntryProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 transition-all duration-300 hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(127,19,236,0.3)] h-full flex flex-col"
      onClick={onClick}
    >
      {/* 卡片展示区域 */}
      <div className="flex justify-center items-center mb-6 min-h-[200px] sm:min-h-[240px] md:min-h-[380px]">
        {layout === 'horizontal' ? (
          // 三张牌水平排列
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-8 sm:pt-10 md:pt-12">
            {Array.from({ length: cardCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          // 七张牌固定阵型布局（桌面端和移动端保持一致）
          <div className="flex items-center justify-center w-full">
            <div 
              className="relative mx-auto scale-75 md:scale-100"
              style={{ 
                width: '300px', 
                height: '380px',
                transformOrigin: 'top center'
              }}
            >
              {/* 牌1：中心 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 0 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '20px', left: 'calc(50% - 40px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌2：左上 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 1 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '80px', left: 'calc(50% - 120px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌3：右上 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 2 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '80px', left: 'calc(50% + 40px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌4：左下 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 3 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '200px', left: 'calc(50% - 120px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌5：右下 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 4 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '200px', left: 'calc(50% + 40px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌6：最底部中心 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 5 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '270px', left: 'calc(50% - 40px)'}}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
              
              {/* 牌7：最右侧单张 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * 6 }}
                className="absolute w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ top: '150px', left: 'calc(50% + 120px)' }}
              >
                <img
                  src="/assets/card-back.png"
                  alt="Card Back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                    }
                  }}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* 文字内容 */}
      <div className="flex flex-col gap-3 flex-grow justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {title}
          </h3>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-2">
            {subtitle}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="mt-4 w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(127,19,236,0.5)]"
        >
          {buttonText}
        </motion.button>
      </div>

      {/* 会员标识 */}
      {isPremium && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium">
            <span className="material-symbols-outlined text-xs">workspace_premium</span>
            {memberBadge}
          </span>
        </div>
      )}
    </motion.div>
  );
}

