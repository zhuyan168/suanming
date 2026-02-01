import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';
import { GENERAL_SPREADS } from '../../../data/spreads';

export default function GeneralSpreadPlaceholder() {
  const router = useRouter();
  const { spreadId } = router.query;
  const spread = GENERAL_SPREADS.find((item) => item.id === spreadId);

  return (
    <>
      <Head>
        <title>牌阵开发中 • Mystic Insights</title>
      </Head>

      <div className="min-h-screen bg-[#05030f] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 md:px-12 py-10">
          <ThemeHeader
            titleZh="综合占卜"
            titleEn=""
            descZh="此牌阵正在建设中，敬请期待更完整的抽牌与解读体验。"
            showBackButton
          />

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h1 className="text-3xl font-bold">
              {spread ? spread.titleZh : '通用牌阵占卜'}
            </h1>
            <p className="mt-4 text-white/70">
              {spread
                ? `“${spread.titleZh}” 目前尚未打开抽牌页，路线正在铺设中。`
                : '暂未找到对应的牌阵 id，我们已记录并将在下一版本中补齐。'}
            </p>
            <p className="mt-3 text-sm text-white/50">
              抽牌页面会保持统一的霓虹卡片风格，并在会员牌阵中加上专属插画与会员提示。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/reading/general">
                <a className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/70">
                  返回通用牌阵
                </a>
              </Link>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60"
              >
                返回上一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
