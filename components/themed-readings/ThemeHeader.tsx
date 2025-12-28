import { useRouter } from 'next/router';

interface ThemeHeaderProps {
  titleZh: string;
  titleEn: string;
  descZh?: string;
  descEn?: string;
  showBackButton?: boolean;
}

/**
 * 主题页面头部组件
 */
export default function ThemeHeader({
  titleZh,
  titleEn,
  descZh,
  descEn,
  showBackButton = true,
}: ThemeHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span className="text-sm font-medium">返回</span>
        </button>
      )}
      
      <div className="flex flex-col gap-3">
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight tracking-[-0.02em]">
          {titleZh}
        </h1>
        
        {descZh && (
          <p className="text-white/60 text-lg font-normal leading-relaxed max-w-2xl">
            {descZh}
          </p>
        )}
      </div>

      {/* 装饰性分隔线 */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}

