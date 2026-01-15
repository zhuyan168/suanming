import { useRouter } from 'next/router';
import Head from 'next/head';

export default function StayOrLeavePlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>这份工作还值得我继续做下去吗？ - Mystic Insights</title>
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
          <span className="material-symbols-outlined text-4xl text-primary">signpost</span>
        </div>
        
        <h1 className="text-3xl font-bold">这份工作还值得我继续做下去吗？</h1>
        
        <p className="text-white/60 leading-relaxed">
          该功能正在开发中，敬请期待。评估继续投入的意义、消耗与转机，判断坚持是否仍然值得。
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

