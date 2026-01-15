import { useRouter } from 'next/router';
import Head from 'next/head';

export default function OfferDecisionPlaceholder() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>我已经拿到 offer / 录取 / 合作邀请了，要不要接受？ - Mystic Insights</title>
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
          <span className="material-symbols-outlined text-4xl text-primary">verified</span>
        </div>
        
        <h1 className="text-3xl font-bold">我已经拿到 offer / 录取 / 合作邀请了，要不要接受？</h1>
        
        <p className="text-white/60 leading-relaxed">
          该功能正在开发中，敬请期待。在选择分岔口看清代价与机会，帮你做更安心的决定。
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

