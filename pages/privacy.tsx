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

export default function PrivacyPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'

  const texts = isEn ? {
    title: 'Privacy Policy - FateAura',
    metaDesc: 'Learn how FateAura handles account information, usage records, and privacy.',
    navAbout: 'About',
    heading: 'Privacy Policy',
    paragraphs: [
      'We care about your privacy and data security. This policy explains how FateAura handles information related to your account and use of the service.',
      'Information we may process includes account details, login status, membership status, guest trial data, reading history, questions you choose to submit, payment-related status, support messages, and basic technical information needed to keep the service working.',
      'We use this information to provide readings, maintain your account, manage membership access, process subscription status, respond to support requests, prevent abuse, improve the product, and keep the service secure.',
      'FateAura readings may be generated or assisted by AI. Questions, card selections, and related reading context may be processed to generate the reading experience you request.',
      'Payments are handled through third-party payment providers. FateAura does not need to store full card numbers. Payment providers may process payment details according to their own security and privacy practices.',
      'We may rely on service providers such as hosting, authentication, database, analytics, email, AI, and payment tools. These providers only receive information needed to help us operate the service.',
      'We do not sell personally identifiable information to third parties without your consent. We keep information only as long as reasonably needed for service operation, account records, legal compliance, security, and legitimate business purposes.',
      'You may contact us to ask privacy questions or request help with your account information.',
    ],
    contactPrefix: 'If you have privacy questions, contact us at',
    backAbout: 'Back to About FateAura',
  } : {
    title: '隐私政策 - FateAura',
    metaDesc: 'FateAura 隐私与数据保护说明。',
    navAbout: '关于',
    heading: '隐私政策',
    paragraphs: [
      '我们重视你的隐私与数据安全。本政策说明 FateAura 如何处理与你的账户和服务使用相关的信息。',
      '我们可能处理的信息包括账户资料、登录状态、会员状态、游客试用数据、历史记录、你主动提交的问题、付款相关状态、客服沟通内容，以及维持服务正常运行所需的基础技术信息。',
      '我们使用这些信息，是为了提供占卜解读、维护账户、管理会员权限、处理订阅状态、回复支持请求、防止滥用、改进产品体验，并保障服务安全。',
      'FateAura 的部分解读可能由 AI 生成或辅助生成。你提交的问题、抽到的牌和相关解读上下文，可能会被用于生成你请求的解读体验。',
      '付款由第三方支付服务商处理。FateAura 不需要保存完整银行卡号。支付服务商会根据其自身的安全和隐私规则处理付款信息。',
      '我们可能使用托管、登录认证、数据库、数据分析、邮件、AI 和支付等服务提供商。这些服务商只会接收帮助我们运行服务所需的信息。',
      '我们不会在未获你同意的情况下出售可识别你身份的信息。相关信息仅会在服务运行、账户记录、合规、安全和合理业务需要范围内保存。',
      '你可以联系我们咨询隐私问题，或请求协助处理你的账户信息。',
    ],
    contactPrefix: '若你对隐私有任何疑问，欢迎通过',
    backAbout: '← 返回关于 FateAura',
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
      </Head>

      <div className="dark min-h-screen font-display bg-background-light dark:bg-background-dark relative overflow-x-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-[280px] bg-primary/[0.1] rounded-full blur-[100px]" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
              <LogoMark />
              <span className="text-lg font-bold tracking-[-0.015em]">FateAura</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/about" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                {texts.navAbout}
              </Link>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 [text-shadow:0_0_40px_rgba(127,19,236,0.2)]">
                {texts.heading}
              </h1>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-7 sm:py-8 text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-4">
                {texts.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p>
                  {texts.contactPrefix}{' '}
                  <a
                    href="mailto:support@fateaura.com"
                    className="text-primary hover:text-secondary mx-1 underline underline-offset-2 break-all"
                  >
                    support@fateaura.com
                  </a>
                  {isEn ? '.' : '与我们联系。'}
                </p>
              </div>
              <div className="mt-10 text-center sm:text-left">
                <Link href="/about" className="text-sm text-white/50 hover:text-primary transition-colors">
                  {texts.backAbout}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
