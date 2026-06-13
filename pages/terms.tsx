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

export default function TermsPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'

  const texts = isEn ? {
    title: 'Terms of Service - FateAura',
    metaDesc: 'Read the FateAura terms of service, membership pricing, cancellation terms, and disclaimers.',
    navHome: 'Home',
    navAbout: 'About',
    navPricing: 'Pricing',
    navTerms: 'Terms',
    heading: 'Terms of Service',
    backHome: 'Back to Home',
    sections: [
      {
        title: '1. Service Overview',
        paragraphs: [
          'FateAura is an online platform for tarot readings, intuitive guidance, interactive reading experiences, account features, and membership access.',
          'FateAura readings are for entertainment, personal reflection, and self-exploration only.',
        ],
      },
      {
        title: '2. For Reflection Only',
        paragraphs: [
          'FateAura readings are not medical, legal, financial, psychological, or other professional advice.',
          'You should not use FateAura to ask for decisions or predictions about health, fertility, legal matters, missing persons, gambling, betting, lotteries, or similar high-risk topics.',
          'If your situation involves safety, health, legal rights, financial risk, or a missing person, please contact qualified professionals, emergency services, or appropriate real-world support channels.',
          'Some readings may be generated or assisted by AI. For serious decisions, please consider real-world facts and seek qualified professional support when needed.',
        ],
      },
      {
        title: '3. Accounts and Use',
        paragraphs: [
          'When you create and use a FateAura account, you are responsible for keeping your login information secure and for activity under your account.',
          'You may not misuse, attack, interfere with, or disrupt the website or its services, and you may not use FateAura for unlawful or inappropriate purposes.',
        ],
      },
      {
        title: '4. Membership Pricing, Renewal, and Cancellation',
        paragraphs: [
          'FateAura offers paid membership subscriptions: Monthly Membership at $9.90 per month, Quarterly Membership at $23.90 every 3 months, and Annual Membership at $86.90 per year.',
          'Subscriptions renew automatically unless canceled. You can cancel anytime; paid access remains available until the end of the current billing period.',
          'Prices are shown on the public membership pricing page before sign-up and are also shown at checkout before payment is completed.',
          'For billing, subscription, or refund questions, contact support@fateaura.com.',
        ],
      },
      {
        title: '5. Service Changes and Interruptions',
        paragraphs: [
          'FateAura may update, modify, suspend, or remove pages, features, content, or services as the product develops.',
          'We aim to keep the service stable, but we cannot guarantee uninterrupted access when maintenance, network issues, third-party service problems, or other events outside our control occur.',
        ],
      },
      {
        title: '6. Content and Copyright',
        paragraphs: [
          'Unless otherwise stated, page design, written content, reading text, images, and related materials on this website belong to FateAura or their respective rights holders.',
          'You may not copy, republish, modify, distribute, or use this content commercially without permission.',
        ],
      },
      {
        title: '7. Privacy and Contact',
        paragraphs: [
          'We care about user privacy and aim to protect your account information and usage records.',
          'For more details about data collection, use, and protection, please read our Privacy Policy.',
          'For questions, collaboration, feedback, or billing support, contact support@fateaura.com.',
        ],
      },
      {
        title: '8. Updates',
        paragraphs: [
          'FateAura may update these terms from time to time.',
          'Updated terms will be posted on this website and take effect when published.',
        ],
      },
    ],
  } : {
    title: '服务条款 - FateAura',
    metaDesc: '查看 FateAura 服务条款、会员价格、取消规则和免责声明。',
    navHome: '首页',
    navAbout: '关于',
    navPricing: '会员价格',
    navTerms: '服务条款',
    heading: '服务条款',
    backHome: '返回首页',
    sections: [
      {
        title: '1. 服务概述',
        paragraphs: [
          'FateAura 是一个提供塔罗解读、直觉指引、互动占卜体验、账户功能和会员访问权限的在线平台。',
          'FateAura 的解读内容仅用于娱乐、个人反思和自我探索。',
        ],
      },
      {
        title: '2. 仅供参考',
        paragraphs: [
          'FateAura 的解读内容不构成医疗、法律、财务、心理或其他专业建议。',
          '请不要使用 FateAura 咨询或预测健康、生育、法律、失踪、赌博、博彩、彩票或类似高风险问题。',
          '如果你的情况涉及人身安全、健康、法律权利、财务风险或失踪人员，请联系专业人士、紧急服务或合适的现实求助渠道。',
          '部分解读可能由 AI 生成或辅助生成。面对重要决定时，请结合现实信息，并在必要时寻求专业人士帮助。',
        ],
      },
      {
        title: '3. 账户与使用',
        paragraphs: [
          '当您创建和使用 FateAura 账户时，您需要妥善保管登录信息，并对账户下发生的活动负责。',
          '您不得滥用、攻击、干扰或破坏本网站及服务，也不得将 FateAura 用于违法或不当用途。',
        ],
      },
      {
        title: '4. 会员价格、续费与取消',
        paragraphs: [
          'FateAura 提供付费会员订阅：Monthly / 月度会员为 $9.90 / 月，Quarterly / 季度会员为 $23.90 / 3 个月，Annual / 年度会员为 $86.90 / 年。',
          '订阅会自动续费，除非您取消订阅。您可以随时取消；取消后，当前已付账期内的会员权益仍会保留。',
          '价格会在公开会员价格页展示，用户注册前即可查看，并会在付款完成前的结账页面再次展示。',
          '如有账单、订阅或退款相关问题，请联系 support@fateaura.com。',
        ],
      },
      {
        title: '5. 服务变更与中断',
        paragraphs: [
          '随着产品发展，FateAura 可能会更新、修改、暂停或移除部分页面、功能、内容或服务。',
          '我们会尽力保持服务稳定，但不保证在维护、网络异常、第三方服务问题或其他不可控情况下始终不中断。',
        ],
      },
      {
        title: '6. 内容与版权',
        paragraphs: [
          '除非另有说明，本网站中的页面设计、文字内容、解读文本、图片及相关材料归 FateAura 或相应权利人所有。',
          '未经授权，不得复制、转载、修改、传播或用于商业用途。',
        ],
      },
      {
        title: '7. 隐私与联系',
        paragraphs: [
          '我们重视用户隐私，并会尽力保护您的账户信息和使用记录。',
          '有关数据收集、使用和保护的更多内容，请阅读我们的隐私政策。',
          '如有问题、合作、反馈或账单支持需求，请联系 support@fateaura.com。',
        ],
      },
      {
        title: '8. 条款更新',
        paragraphs: [
          'FateAura 可能会不时更新这些条款。',
          '更新后的条款将在本网站公布，并自公布后生效。',
        ],
      },
    ],
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
            <nav className="flex items-center gap-4 sm:gap-8">
              <Link href="/" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                {texts.navHome}
              </Link>
              <Link href="/about" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                {texts.navAbout}
              </Link>
              <Link href="/membership" className="text-white/80 text-sm font-medium hover:text-primary transition-colors">
                {texts.navPricing}
              </Link>
              <span className="text-primary text-sm font-medium" aria-current="page">
                {texts.navTerms}
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
                {texts.sections.map((section, index) => (
                  <SectionCard
                    key={section.title}
                    title={section.title}
                    className={index === 3 ? 'border-primary/35 bg-primary/[0.08]' : ''}
                  >
                    {section.paragraphs.map((paragraph) => (
                      paragraph.includes('Privacy Policy') || paragraph.includes('隐私政策') ? (
                        <p key={paragraph}>
                          {isEn ? 'For more details about data collection, use, and protection, please read our ' : '有关数据收集、使用和保护的更多内容，请阅读我们的'}
                          <Link href="/privacy" className="text-primary hover:text-secondary mx-1 underline underline-offset-2">
                            {isEn ? 'Privacy Policy' : '隐私政策'}
                          </Link>
                          {isEn ? '.' : '。'}
                        </p>
                      ) : (
                        <p key={paragraph}>{paragraph}</p>
                      )
                    ))}
                  </SectionCard>
                ))}
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
