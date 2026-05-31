import { useRouter } from 'next/router';
import Head from 'next/head';

export default function StayOrLeavePlaceholder() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const text = isEn ? {
    title: 'Is This Job Still Worth Staying In?',
    pageTitle: 'Is This Job Still Worth Staying In? - FateAura',
    back: 'Back',
    body: 'This feature is still in development. It will help you assess the meaning, cost, and possible turning points of staying, so you can decide whether continuing is still worthwhile.',
    ok: 'Got it',
  } : {
    title: '这份工作还值得我继续做下去吗？',
    pageTitle: '这份工作还值得我继续做下去吗？ - FateAura',
    back: '返回',
    body: '该功能正在开发中，敬请期待。评估继续投入的意义、消耗与转机，判断坚持是否仍然值得。',
    ok: '我知道了',
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>{text.pageTitle}</title>
      </Head>
      
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        {text.back}
      </button>

      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-primary">signpost</span>
        </div>
        
        <h1 className="text-3xl font-bold">{text.title}</h1>
        
        <p className="text-white/60 leading-relaxed">
          {text.body}
        </p>

        <button 
          onClick={() => router.back()}
          className="px-8 py-3 bg-primary rounded-full font-bold hover:bg-primary/90 transition-transform hover:scale-105"
        >
          {text.ok}
        </button>
      </div>
    </div>
  );
}
