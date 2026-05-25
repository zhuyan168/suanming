import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

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
  const { t } = useTranslation('common');
  const isZh = router.locale === 'zh';

  const title = isZh ? titleZh : (titleEn || titleZh);
  const desc  = isZh ? descZh  : (descEn  || descZh);

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <div className="relative">
      {showBackButton && (
        <button
          onClick={handleBackClick}
          className="mb-2 flex items-center gap-2 text-white/70 hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span className="text-xs font-medium">{t('spreads.back')}</span>
        </button>
      )}
      
      <div className="flex flex-col gap-1">
        <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
          {title}
        </h1>
        
        {desc && (
          <p className="text-white/60 text-sm font-normal leading-snug max-w-2xl">
            {desc}
          </p>
        )}
      </div>

      {/* 装饰性分隔线 */}
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
