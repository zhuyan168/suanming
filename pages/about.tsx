import type { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const isEn = router.locale === 'en'

  const texts = isEn ? {
    title: 'About FateAura - FateAura',
    metaDesc: 'Learn about FateAura, tarot readings, membership access, privacy, and contact information.',
    navHome: 'Home',
    navAbout: 'About',
    heading: 'About FateAura',
    brandTitle: '1. What FateAura Is',
    brandBody: 'FateAura is a tarot and intuitive guidance platform built for people facing questions, decisions, waiting periods, and emotional uncertainty. Our readings are designed to help you reflect on the present moment and see your next step more clearly.',
    contentTitle: '2. What We Offer',
    contentIntro: 'On FateAura, you can choose different reading paths based on your question:',
    contentItems: [
      ['General readings', 'For open-ended questions, decisions, relationships, and direction.'],
      ['Fortune forecasts', 'For daily, monthly, seasonal, and yearly energy check-ins.'],
      ['Themed readings', 'For focused questions about love, career, study, and money.'],
      ['Member readings', 'For deeper spreads and more complete reading experiences.'],
    ],
    philosophyTitle: '3. Our Approach',
    philosophyBody1: 'We do not treat tarot as a fixed prediction or a replacement for your own judgment. A reading can offer reflection, language, and perspective.',
    philosophyBody2: 'The cards may point to patterns and possibilities, but the final choice is always yours.',
    disclaimerTitle: '4. Disclaimer',
    disclaimerBody1: 'FateAura readings are for personal reflection and self-exploration only. They are not medical, legal, financial, psychological, or other professional advice.',
    disclaimerBody2: 'For serious decisions, please consider real-world facts and seek qualified professional support when needed.',
    privacyTitle: '5. Privacy',
    privacyBody1: 'We care about user privacy and aim to protect your account information and usage records.',
    privacyBody2Prefix: 'For more details about data collection, use, and protection, please read our',
    privacyLink: 'Privacy Policy',
    privacyBody2Suffix: '.',
    contactTitle: '6. Contact Us',
    contactBody: 'For product questions, collaboration, or feedback, contact us by email:',
    backHome: 'Back to Home',
  } : {
    title: '关于 FateAura - FateAura',
    metaDesc: '了解 FateAura 品牌、服务内容与使用说明。',
    navHome: '首页',
    navAbout: '关于',
    heading: '关于 FateAura',
    brandTitle: '一、品牌介绍',
    brandBody: 'FateAura 是一个以塔罗与占卜为核心的指引平台，帮助用户在困惑、选择与等待之中，看见当下的能量流动，获得更清晰的思考方向。',
    contentTitle: '二、我们提供的内容',
    contentIntro: '在 FateAura，你可以根据不同的问题与需求，选择适合自己的占卜方式：',
    contentItems: [
      ['综合占卜', '适合日常困惑、关系判断、选择与方向问题'],
      ['运势测算', '适合观察一段时间内的整体趋势与变化'],
      ['主题占卜', '适合聚焦爱情、事业、学业、财富等具体议题'],
      ['会员内容', '提供更深入、更完整的解读体验'],
    ],
    philosophyTitle: '三、我们的理念',
    philosophyBody1: '我们相信，占卜不是替你做决定，而是帮助你更诚实地看见自己，看见当下，并在不确定中找到更清晰的方向。',
    philosophyBody2: '牌面可以提供提醒与启发，但真正做出选择的人，始终是你自己。',
    disclaimerTitle: '四、免责声明',
    disclaimerBody1: 'FateAura 提供的占卜与解读内容，仅供个人参考与自我探索使用，不构成医疗、法律、财务或其他专业建议。',
    disclaimerBody2: '当你面临重大决定时，请结合现实情况，并在必要时寻求专业人士的帮助。',
    privacyTitle: '五、隐私说明',
    privacyBody1: '我们重视用户隐私，并尽力保护你的账户信息与使用记录。',
    privacyBody2Prefix: '有关数据收集、使用与保护的更多内容，请参阅',
    privacyLink: '隐私政策',
    privacyBody2Suffix: '页面。',
    contactTitle: '六、联系我们',
    contactBody: '如有使用问题、合作咨询或反馈建议，欢迎通过以下方式联系我们：',
    backHome: '返回首页',
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
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
                {texts.navHome}
              </Link>
              <span className="text-primary text-sm font-medium" aria-current="page">
                {texts.navAbout}
              </span>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16">
            <div className="mx-auto max-w-3xl">
              <div className="mb-10 sm:mb-12 text-center sm:text-left">
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight [text-shadow:0_0_40px_rgba(127,19,236,0.25)]">
                  {texts.heading}
                </h1>
              </div>

              <div className="flex flex-col gap-8 sm:gap-10">
                <SectionCard title={texts.brandTitle}>
                  <p>{texts.brandBody}</p>
                </SectionCard>

                <SectionCard title={texts.contentTitle}>
                  <p>{texts.contentIntro}</p>
                  <ul className="list-none space-y-2.5 pl-0">
                    {texts.contentItems.map(([label, desc]) => (
                      <li key={label} className="flex gap-2.5">
                        <span className="text-primary/90 shrink-0 mt-0.5">·</span>
                        <span>
                          <span className="text-white/90 font-medium">{label}</span>
                          {isEn ? ': ' : '：'}{desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title={texts.philosophyTitle}>
                  <p>{texts.philosophyBody1}</p>
                  <p>{texts.philosophyBody2}</p>
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
                    {texts.disclaimerTitle}
                  </h2>
                  <div className="text-white/70 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>{texts.disclaimerBody1}</p>
                    <p>{texts.disclaimerBody2}</p>
                  </div>
                </section>

                <SectionCard title={texts.privacyTitle}>
                  <p>{texts.privacyBody1}</p>
                  <p>
                    {texts.privacyBody2Prefix}
                    <Link href="/privacy" className="text-primary hover:text-secondary mx-1 underline underline-offset-2">
                      {texts.privacyLink}
                    </Link>
                    {texts.privacyBody2Suffix}
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
                    {texts.contactTitle}
                  </h2>
                  <div className="text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-3">
                    <p>{texts.contactBody}</p>
                    <p>
                      <span className="text-white/60">{isEn ? 'Email: ' : '邮箱：'}</span>
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
                  {texts.backHome}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
