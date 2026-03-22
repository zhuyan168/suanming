import type { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'

function LogoMark() {
  return (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="size-6 text-primary shrink-0">
      <path
        d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SectionCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-7 sm:py-7 shadow-[0_0_40px_-12px_rgba(127,19,236,0.15)] ${className}`}
    >
      <h2 className="text-white text-base sm:text-lg font-bold tracking-wide mb-4 border-l-2 border-primary/80 pl-3">
        {title}
      </h2>
      <div className="text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>关于 FateAura - FateAura</title>
        <meta name="description" content="了解 FateAura 品牌、服务内容与使用说明。" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;800&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </Head>

      <div className="dark min-h-screen font-display bg-background-light dark:bg-background-dark relative overflow-x-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-[320px] bg-primary/[0.12] rounded-full blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-0 w-[420px] h-[420px] bg-secondary/10 rounded-full blur-[110px]" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
              <LogoMark />
              <span className="text-lg font-bold tracking-[-0.015em]">FateAura</span>
            </Link>
            <nav className="flex items-center gap-6 sm:gap-8">
              <Link href="/" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                首页
              </Link>
              <span className="text-primary text-sm font-medium" aria-current="page">
                关于
              </span>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16">
            <div className="mx-auto max-w-3xl">
              <div className="mb-10 sm:mb-12 text-center sm:text-left">
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight [text-shadow:0_0_40px_rgba(127,19,236,0.25)]">
                  关于 FateAura
                </h1>
              </div>

              <div className="flex flex-col gap-8 sm:gap-10">
                <SectionCard title="一、品牌介绍">
                  <p>
                    FateAura 是一个以塔罗与占卜为核心的指引平台，帮助用户在困惑、选择与等待之中，看见当下的能量流动，获得更清晰的思考方向。
                  </p>
                </SectionCard>

                <SectionCard title="二、我们提供的内容">
                  <p>在 FateAura，你可以根据不同的问题与需求，选择适合自己的占卜方式：</p>
                  <ul className="list-none space-y-2.5 pl-0">
                    <li className="flex gap-2.5">
                      <span className="text-primary/90 shrink-0 mt-0.5">·</span>
                      <span>
                        <span className="text-white/90 font-medium">综合占卜</span>
                        ：适合日常困惑、关系判断、选择与方向问题
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="text-primary/90 shrink-0 mt-0.5">·</span>
                      <span>
                        <span className="text-white/90 font-medium">运势测算</span>
                        ：适合观察一段时间内的整体趋势与变化
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="text-primary/90 shrink-0 mt-0.5">·</span>
                      <span>
                        <span className="text-white/90 font-medium">主题占卜</span>
                        ：适合聚焦爱情、事业、学业、财富等具体议题
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="text-primary/90 shrink-0 mt-0.5">·</span>
                      <span>
                        <span className="text-white/90 font-medium">会员内容</span>
                        ：提供更深入、更完整的解读体验
                      </span>
                    </li>
                  </ul>
                </SectionCard>

                <SectionCard title="三、我们的理念">
                  <p>
                    我们相信，占卜不是替你做决定，而是帮助你更诚实地看见自己，看见当下，并在不确定中找到更清晰的方向。
                  </p>
                  <p>牌面可以提供提醒与启发，但真正做出选择的人，始终是你自己。</p>
                </SectionCard>

                <section
                  className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-6 sm:px-7 sm:py-7"
                  aria-labelledby="about-disclaimer-heading"
                >
                  <h2
                    id="about-disclaimer-heading"
                    className="text-amber-100/95 text-base sm:text-lg font-bold tracking-wide mb-4 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl text-amber-200/80" aria-hidden>
                      policy
                    </span>
                    四、免责声明
                  </h2>
                  <div className="text-white/70 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>
                      FateAura 提供的占卜与解读内容，仅供个人参考与自我探索使用，不构成医疗、法律、财务或其他专业建议。
                    </p>
                    <p>当你面临重大决定时，请结合现实情况，并在必要时寻求专业人士的帮助。</p>
                  </div>
                </section>

                <SectionCard title="五、隐私说明">
                  <p>我们重视用户隐私，并尽力保护你的账户信息与使用记录。</p>
                  <p>
                    有关数据收集、使用与保护的更多内容，请参阅
                    <Link href="/privacy" className="text-primary hover:text-secondary mx-1 underline underline-offset-2">
                      隐私政策
                    </Link>
                    页面。
                  </p>
                </SectionCard>

                <section
                  className="rounded-xl border border-primary/35 bg-primary/[0.08] px-5 py-6 sm:px-7 sm:py-7 shadow-[0_0_32px_-8px_rgba(127,19,236,0.35)]"
                  aria-labelledby="about-contact-heading"
                >
                  <h2
                    id="about-contact-heading"
                    className="text-white text-base sm:text-lg font-bold tracking-wide mb-4 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl text-primary/90" aria-hidden>
                      mail
                    </span>
                    六、联系我们
                  </h2>
                  <div className="text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>如有使用问题、合作咨询或反馈建议，欢迎通过以下方式联系我们：</p>
                    <p>
                      <span className="text-white/60">邮箱：</span>
                      <a
                        href="mailto:sephiroth.wang@foxmail.com"
                        className="text-primary hover:text-secondary break-all transition-colors"
                      >
                        sephiroth.wang@foxmail.com
                      </a>
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  返回首页
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
