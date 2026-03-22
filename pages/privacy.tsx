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

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>隐私政策 - FateAura</title>
        <meta name="description" content="FateAura 隐私与数据保护说明。" />
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
                关于
              </Link>
            </nav>
          </header>

          <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 [text-shadow:0_0_40px_rgba(127,19,236,0.2)]">
                隐私政策
              </h1>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-7 sm:py-8 text-white/75 text-sm sm:text-[15px] leading-relaxed space-y-4">
                <p>
                  我们重视你的隐私与数据安全。本页将对 FateAura
                  如何收集、使用与保护你的信息作出说明；完整条文正在根据产品功能持续修订，修订后将在此更新。
                </p>
                <p>
                  在现行原则下：我们会尽力保护账户信息与必要的使用记录，不会在未获你同意的情况下将可识别你身份的信息出售给第三方。使用本服务即表示你理解并同意我们按合法、正当、必要的方式处理与服务提供相关的数据。
                </p>
                <p>
                  若你对隐私有任何疑问，欢迎通过
                  <a
                    href="mailto:sephiroth.wang@foxmail.com"
                    className="text-primary hover:text-secondary mx-1 underline underline-offset-2 break-all"
                  >
                    sephiroth.wang@foxmail.com
                  </a>
                  与我们联系。
                </p>
              </div>
              <div className="mt-10 text-center sm:text-left">
                <Link href="/about" className="text-sm text-white/50 hover:text-primary transition-colors">
                  ← 返回关于 FateAura
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
