import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

/**
 * 凯尔特十字牌阵 - 解读页（占位）
 * 
 * TODO: 后续需要实现以下功能：
 * 1. 接入会员系统进行权限校验
 * 2. 调用 AI API 生成解读内容
 * 3. 展示每个牌位的详细解读
 * 4. 生成整体综合分析
 */

// LocalStorage Keys
const RESULT_STORAGE_KEY = 'general_celtic_cross_draw_result';

export default function CelticCrossReadingPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检查是否有抽牌结果
    const result = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!result) {
      // 如果没有结果，跳转回问题输入页
      router.replace('/reading/general/celtic-cross/question');
      return;
    }
  }, [router]);

  const handleBack = () => {
    router.push('/reading/general/celtic-cross/reveal');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>凯尔特十字牌阵 - 解读 | Mystic Insights</title>
        <meta name="description" content="凯尔特十字牌阵深度解读" />
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
            onClick={handleBack}
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

          <div className="w-16" /> {/* 占位 */}
        </header>

        {/* 主内容 */}
        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* 图标 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">construction</span>
              </div>
            </motion.div>

            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                解读页开发中
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                凯尔特十字牌阵的AI深度解读功能正在紧张开发中，<br />
                敬请期待！
              </p>
            </motion.div>

            {/* 返回按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="px-8 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)]"
                style={{ backgroundColor: '#7f13ec' }}
              >
                返回查看牌面
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToHome}
                className="px-8 py-3 rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/10"
              >
                返回首页
              </motion.button>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
