import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

function LogoMark() {
  return (
    <img
      src="/favicon.png"
      alt=""
      aria-hidden="true"
      className="size-8 rounded-md object-cover shrink-0"
    />
  )
}

export default function ContactPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'

  const texts = isEn ? {
    title: 'Contact Us - FateAura',
    metaDesc: 'Contact FateAura by email for questions, feedback, or collaboration.',
    navHome: 'Home',
    navAbout: 'About',
    navContact: 'Contact',
    heading: 'Contact Us',
    intro: 'For product questions, collaboration, or feedback, contact us through the channels below.',
    emailLabel: 'Email',
    wechatLabel: 'WeChat',
    wechatNote: 'If you add us on WeChat, please include a short note so we can understand your request.',
    responseNote: 'We try to respond as soon as possible, but replies may take longer during busy periods.',
    backHome: 'Back to Home',
  } : {
    title: '联系我们 - FateAura',
    metaDesc: '通过邮箱或微信联系 FateAura。',
    navHome: '首页',
    navAbout: '关于',
    navContact: '联系我们',
    heading: '联系我们',
    intro: '如有使用问题、合作咨询或反馈建议，欢迎通过以下方式与我们联系。',
    emailLabel: '电子邮箱',
    wechatLabel: '微信号',
    wechatNote: '添加时请简单备注来意，方便我们更快处理。',
    responseNote: '我们会尽量及时回复，但在高峰时段可能存在一定延迟，感谢你的理解。',
    backHome: '返回首页',
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
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
              <Link href="/about" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                {texts.navAbout}
              </Link>
              <span className="text-primary text-sm font-medium" aria-current="page">
                {texts.navContact}
              </span>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16">
            <article className="mx-auto max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 sm:px-10 sm:py-12 shadow-[0_0_48px_-20px_rgba(127,19,236,0.2)]">
              <header className="text-center sm:text-left">
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight [text-shadow:0_0_40px_rgba(127,19,236,0.25)]">
                  {texts.heading}
                </h1>
                <p className="mt-5 text-white/65 text-sm sm:text-[15px] leading-relaxed">
                  {texts.intro}
                </p>
              </header>

              <div className="mt-10 space-y-9 border-t border-white/10 pt-10">
                <div>
                  <p className="text-white/45 text-xs font-medium tracking-wide mb-2.5">{texts.emailLabel}</p>
                  <a
                    href="mailto:support@fateaura.com"
                    className="text-[15px] sm:text-base text-white/95 hover:text-primary break-all transition-colors underline decoration-white/20 underline-offset-[5px] hover:decoration-primary/60"
                  >
                    support@fateaura.com
                  </a>
                </div>

                <div>
                  <p className="text-white/45 text-xs font-medium tracking-wide mb-2.5">{texts.wechatLabel}</p>
                  <p className="text-[15px] sm:text-base text-white/95 font-medium tabular-nums select-all tracking-wide">
                    shefei66
                  </p>
                  <p className="mt-2.5 text-white/50 text-sm leading-relaxed">
                    {texts.wechatNote}
                  </p>
                </div>
              </div>

              <p className="mt-10 pt-8 border-t border-white/10 text-white/45 text-sm leading-relaxed text-center sm:text-left">
                {texts.responseNote}
              </p>

              <div className="mt-10 flex justify-center sm:justify-start">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden>
                    arrow_back
                  </span>
                  {texts.backHome}
                </Link>
              </div>
            </article>
          </main>
        </div>
      </div>
    </>
  )
}
