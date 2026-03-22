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

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>服务条款 - FateAura</title>
        <meta name="description" content="FateAura 服务条款与使用说明。" />
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
              <Link href="/about" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                关于
              </Link>
              <span className="text-primary text-sm font-medium" aria-current="page">
                服务条款
              </span>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16">
            <div className="mx-auto max-w-3xl">
              <div className="mb-10 sm:mb-12 text-center sm:text-left">
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight [text-shadow:0_0_40px_rgba(127,19,236,0.25)]">
                  服务条款
                </h1>
              </div>

              <div className="flex flex-col gap-8 sm:gap-10">
                <SectionCard title="一、服务说明">
                  <p>欢迎使用 FateAura。</p>
                  <p>
                    FateAura
                    是一个提供塔罗与占卜相关内容、指引与互动功能的线上平台，用户可通过本网站体验不同类型的占卜服务、查看解读内容，并使用与账户、会员相关的功能。
                  </p>
                </SectionCard>

                <section
                  className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-6 sm:px-7 sm:py-7"
                  aria-labelledby="terms-reference-heading"
                >
                  <h2
                    id="terms-reference-heading"
                    className="text-amber-100/95 text-base sm:text-lg font-bold tracking-wide mb-4 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl text-amber-200/80" aria-hidden>
                      info
                    </span>
                    二、仅供参考
                  </h2>
                  <div className="text-white/70 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>
                      FateAura
                      提供的占卜与解读内容，仅供个人参考与自我探索使用，不构成医疗、法律、财务、心理咨询或其他专业建议。
                    </p>
                    <p>当你面临重大决定时，请结合现实情况，并在必要时寻求专业人士的帮助。</p>
                  </div>
                </section>

                <SectionCard title="三、账户与使用">
                  <p>当你注册并使用 FateAura 账户时，应妥善保管你的登录信息，并对账户下发生的行为负责。</p>
                  <p>
                    你不得以任何方式滥用、干扰、攻击或破坏本网站及其服务，也不得将本网站用于任何违法或不当用途。
                  </p>
                </SectionCard>

                <SectionCard title="四、会员与权益">
                  <p>FateAura 可能提供会员服务、会员码兑换或其他付费相关功能。</p>
                  <p>具体会员权益、可用范围、有效期限及相关说明，以网站当前页面展示与实际功能为准。</p>
                  <p>我们保留根据产品发展情况，对会员内容、功能或展示方式进行调整与更新的权利。</p>
                </SectionCard>

                <SectionCard title="五、服务变更与中断">
                  <p>
                    为了优化体验、修复问题或进行功能调整，FateAura
                    可能在不事先通知的情况下，对部分页面、功能、内容或服务进行更新、修改、暂停或下线。
                  </p>
                  <p>
                    我们会尽力保持服务稳定，但不对因系统维护、网络异常、第三方服务波动或其他不可控因素导致的中断承担保证责任。
                  </p>
                </SectionCard>

                <SectionCard title="六、内容与版权">
                  <p>
                    本网站中的页面设计、文案内容、解读文本、图像素材及相关内容，除另有说明外，均归 FateAura
                    或相关权利人所有。
                  </p>
                  <p>未经授权，不得复制、转载、修改、传播或用于其他商业用途。</p>
                </SectionCard>

                <section
                  className="rounded-xl border border-primary/35 bg-primary/[0.08] px-5 py-6 sm:px-7 sm:py-7 shadow-[0_0_32px_-8px_rgba(127,19,236,0.35)]"
                  aria-labelledby="terms-privacy-heading"
                >
                  <h2
                    id="terms-privacy-heading"
                    className="text-white text-base sm:text-lg font-bold tracking-wide mb-4 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl text-primary/90" aria-hidden>
                      privacy_tip
                    </span>
                    七、隐私与联系
                  </h2>
                  <div className="text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>我们重视用户隐私，并会尽力保护你的账户信息与使用记录。</p>
                    <p>
                      有关数据收集、使用与保护的更多内容，请参阅
                      <Link href="/privacy" className="text-primary hover:text-secondary mx-1 underline underline-offset-2">
                        隐私政策
                      </Link>
                      页面。
                    </p>
                    <p>如有使用问题、合作咨询或反馈建议，可通过页面中提供的联系方式与我们取得联系。</p>
                  </div>
                </section>

                <SectionCard title="八、条款更新">
                  <p>FateAura 保留对本服务条款进行更新与调整的权利。</p>
                  <p>更新后的内容将在网站公布，并自公布后生效。</p>
                </SectionCard>
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
