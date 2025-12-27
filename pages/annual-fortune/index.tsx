/**
 * 年度运势入口页
 * 路由: /annual-fortune
 * 
 * 临时页面：用于测试和演示
 * 实际项目中应该使用现有的抽牌页 pages/fortune/annual/year-ahead/index.tsx
 */

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import type { TarotCard, AnnualFortuneReading } from '../../types/annual-fortune';
import { saveReadingToSession } from '../../utils/annual-fortune-storage';

// 模拟 78 张塔罗牌数据（简化版，仅用于测试）
const MOCK_TAROT_CARDS = [
  { id: 0, name: '0. The Fool', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fool.png', keywords: ['纯真', '自由', '机会'] },
  { id: 1, name: 'I. The Magician', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_magician.png', keywords: ['行动', '意志', '显化'] },
  { id: 2, name: 'II. The High Priestess', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_priestess.png', keywords: ['直觉', '秘密', '平衡'] },
  { id: 3, name: 'III. The Empress', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_empress.png', keywords: ['丰盛', '创造', '滋养'] },
  { id: 4, name: 'IV. The Emperor', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_emperor.png', keywords: ['权威', '秩序', '稳定'] },
  { id: 5, name: 'V. The Hierophant', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hierophant.png', keywords: ['传统', '指引', '规范'] },
  { id: 6, name: 'VI. The Lovers', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_lovers.png', keywords: ['关系', '信任', '选择'] },
  { id: 7, name: 'VII. The Chariot', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_chariot.png', keywords: ['意志', '目标', '胜利'] },
  { id: 8, name: 'VIII. Strength', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_strength.png', keywords: ['力量', '耐心', '控制'] },
  { id: 9, name: 'IX. The Hermit', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hermit.png', keywords: ['内省', '真理', '指引'] },
  { id: 10, name: 'X. Wheel of Fortune', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fortune.png', keywords: ['命运', '循环', '变化'] },
  { id: 11, name: 'XI. Justice', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_justice.png', keywords: ['正义', '平衡', '责任'] },
  { id: 12, name: 'XII. The Hanged Man', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hanged.png', keywords: ['等待', '牺牲', '视角'] },
];

export default function AnnualFortuneEntryPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * 生成测试数据并跳转
   */
  const handleGenerateMockReading = () => {
    setIsGenerating(true);

    // 随机选择 13 张牌
    const shuffled = [...MOCK_TAROT_CARDS].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 13);

    // 创建 TarotCard 对象
    const createCard = (card: typeof MOCK_TAROT_CARDS[0], isReversed: boolean): TarotCard => ({
      id: card.id.toString(),
      name: card.name,
      imageUrl: card.image,
      isReversed,
      keywords: card.keywords,
      upright: '正位含义（测试数据）',
      reversed: '逆位含义（测试数据）'
    });

    // 构建 reading 对象
    const reading: AnnualFortuneReading = {
      id: `mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
      themeCard: createCard(selectedCards[12], Math.random() > 0.5),
      monthCards: {},
      meta: {
        year: new Date().getFullYear(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: 'zh-CN'
      }
    };

    for (let i = 0; i < 12; i++) {
      reading.monthCards[i + 1] = createCard(selectedCards[i], Math.random() > 0.5);
    }

    // 保存到 sessionStorage
    saveReadingToSession(reading);

    // 跳转到结果页
    setTimeout(() => {
      router.push('/annual-fortune/result');
    }, 500);
  };

  return (
    <>
      <Head>
        <title>年度运势 - Mystic Insights</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html.dark, html.dark body {
              background-color: #191022;
            }
          `
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.tailwindConfigSet) {
                window.tailwindConfigSet = true;
                (function() {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
                  script.async = true;
                  script.onload = function() {
                    if (window.tailwind) {
                      window.tailwind.config = {
                        darkMode: 'class',
                        theme: {
                          extend: {
                            colors: {
                              primary: '#7f13ec',
                              'background-light': '#f7f6f8',
                              'background-dark': '#191022',
                            },
                            fontFamily: {
                              display: ['Spline Sans', 'sans-serif'],
                            },
                          }
                        }
                      };
                    }
                  };
                  document.head.appendChild(script);
                })();
              }
            `,
          }}
        />
      </Head>

      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white">
          {/* 顶部导航 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 text-white">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Mystic Insights
              </h2>
            </div>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-10 md:py-16">
            <div className="mx-auto max-w-4xl">
              {/* 标题 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary mb-3 sm:mb-4">
                  Annual Fortune
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-4">
                  年度运势占卜
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  探索未来一年的运势走向，获取每月的能量指引
                </p>
              </motion.div>

              {/* 功能卡片 */}
              <div className="grid gap-6 md:grid-cols-2 mb-12">
                {/* 快速测试 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/10 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-primary mb-4 block">
                      auto_awesome
                    </span>
                    <h2 className="text-2xl font-bold mb-3">快速测试</h2>
                    <p className="text-white/60 mb-6">
                      自动生成测试数据，快速体验结果页面
                    </p>
                    <button
                      onClick={handleGenerateMockReading}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      {isGenerating ? '生成中...' : '生成测试数据'}
                    </button>
                  </div>
                </motion.div>

                {/* 完整抽牌 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-white/70 mb-4 block">
                      style
                    </span>
                    <h2 className="text-2xl font-bold mb-3">完整抽牌</h2>
                    <p className="text-white/60 mb-6">
                      前往完整的抽牌页面，亲自选择 13 张牌
                    </p>
                    <button
                      onClick={() => router.push('/fortune/annual/year-ahead')}
                      className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors w-full"
                    >
                      去抽牌
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* 其他入口 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-center mb-6">其他功能</h3>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => router.push('/annual-fortune/test')}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">bug_report</span>
                    运行测试
                  </button>
                  
                  <button
                    onClick={() => router.push('/annual-fortune/result')}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">description</span>
                    查看上次结果
                  </button>
                  
                  <button
                    onClick={() => window.open('/ANNUAL_FORTUNE_IMPLEMENTATION.md', '_blank')}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">menu_book</span>
                    查看文档
                  </button>
                </div>
              </motion.div>

              {/* 说明 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/5"
              >
                <h4 className="text-lg font-semibold mb-3">📝 使用说明</h4>
                <ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
                  <li>
                    <strong>快速测试</strong>：自动生成随机数据，立即体验结果页面（推荐）
                  </li>
                  <li>
                    <strong>完整抽牌</strong>：跳转到现有的抽牌页面，亲自选择 13 张牌
                  </li>
                  <li>
                    <strong>运行测试</strong>：执行自动化测试，验证功能完整性
                  </li>
                  <li>
                    <strong>查看上次结果</strong>：如果有保存的数据，直接查看结果
                  </li>
                </ul>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

