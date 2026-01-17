import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SkillsDirectionResult() {
  const router = useRouter();

  return (
    <div className="dark">
      <Head>
        <title>事业 & 学业 - 解读页</title>
      </Head>

      <div className="bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">解读页明天再做</h1>
        <p className="text-white/60 mb-8 max-w-md">
          您的事业牌阵已保存。具体的深度解读逻辑（AI 解析）将在明天完成开发。
        </p>
        <button
          onClick={() => router.push('/themed-readings/career-study')}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-medium border border-white/10"
        >
          返回事业占卜列表
        </button>
      </div>
    </div>
  );
}

