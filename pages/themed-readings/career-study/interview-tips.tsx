import { useRouter } from 'next/router';
import Head from 'next/head';

export default function InterviewTipsPlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>面试 / 考试关键提醒牌阵 - Mystic Insights</title>
      </Head>
      
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        返回
      </button>

      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-primary">work</span>
        </div>
        
        <h1 className="text-3xl font-bold">面试 / 考试关键提醒牌阵</h1>
        
        <p className="text-white/60 leading-relaxed">
          该功能正在开发中，敬请期待。看清优势、风险点与准备重点，把能掌控的部分做到最好。
        </p>

        <button 
          onClick={() => router.back()}
          className="px-8 py-3 bg-primary rounded-full font-bold hover:bg-primary/90 transition-transform hover:scale-105"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}

