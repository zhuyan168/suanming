import Head from 'next/head';
import { useRouter } from 'next/router';

export default function InterviewExamReadingPlaceholder() {
  const router = useRouter();

  return (
    <div className="bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4 text-center">
      <Head>
        <title>面试 / 考试关键提醒 - 深度解读</title>
      </Head>
      
      <div className="max-w-md">
        <div className="text-6xl mb-6">🔮</div>
        <h1 className="text-2xl font-bold mb-4">深度解读页开发中</h1>
        <p className="text-white/60 mb-8">
          你的抽牌结果已保存。我们正在努力打磨解读内容，请耐心等待上线。
        </p>
        <button 
          onClick={() => router.push('/themed-readings/career-study/interview-exam-key-reminders/draw')}
          className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
        >
          返回抽牌页
        </button>
      </div>
    </div>
  );
}

