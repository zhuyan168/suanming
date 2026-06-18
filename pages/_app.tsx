// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { appWithTranslation } from "next-i18next/pages";
import nextI18NextConfig from "../next-i18next.config";
import { GuestTrialProvider } from "../context/GuestTrialContext";
import GuestTrialBanner from "../components/guest-trial/GuestTrialBanner";

// ✅ 关键：全局 Tailwind 样式只需要在这里引入一次
import "../styles/globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fateaura.com").replace(/\/$/, "");
const DEFAULT_TITLE = "FateAura - Tarot Readings & Intuitive Guidance";
const DEFAULT_DESCRIPTION =
  "Ask what is on your mind and receive thoughtful tarot guidance for love, career, money, decisions, and life's turning points.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function shouldNoIndex(pathname: string): boolean {
  return [
    "/account",
    "/history",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/change-password",
    "/auth",
    "/annual-fortune",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function GlobalHomeButton() {
  const router = useRouter();
  const cleanPath = router.asPath.split("?")[0].split("#")[0] || "/";
  const isHomePage = router.pathname === "/" || cleanPath === "/" || cleanPath === "/zh";
  const isEn = router.locale === "en";

  if (isHomePage) return null;

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      aria-label={isEn ? "Back to home" : "返回首页"}
      title={isEn ? "Back to home" : "返回首页"}
      className="fixed bottom-5 left-4 z-[9997] inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-[#151326]/90 px-4 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(0,0,0,0.32)] backdrop-blur-md transition-colors hover:border-primary/50 hover:bg-[#1f1934] sm:bottom-6 sm:left-6"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden>
        home
      </span>
      <span className="hidden sm:inline">{isEn ? "Home" : "首页"}</span>
    </button>
  );
}

function PageTitleBrandGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const applyBrandTitle = () => {
      const currentTitle = document.title.trim();
      if (!currentTitle) {
        document.title = DEFAULT_TITLE;
        return;
      }

      if (/fateaura/i.test(currentTitle)) return;
      document.title = `${currentTitle} | FateAura`;
    };

    applyBrandTitle();
    const timer = window.setTimeout(applyBrandTitle, 0);
    const titleElement = document.querySelector("title");
    const observer = titleElement
      ? new MutationObserver(applyBrandTitle)
      : null;

    observer?.observe(titleElement as HTMLTitleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [router.asPath]);

  return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const cleanPath = router.asPath.split("?")[0].split("#")[0] || "/";
  const canonicalPath = cleanPath === "/" ? "" : cleanPath;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const robotsContent = shouldNoIndex(router.pathname) ? "noindex, nofollow" : "index, follow";

  return (
    <GuestTrialProvider>
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={DEFAULT_DESCRIPTION} key="description" />
        <meta name="robots" content={robotsContent} key="robots" />
        <link rel="canonical" href={canonicalUrl} key="canonical" />
        <link rel="shortcut icon" href="/favicon.ico?v=20260617" />
        <link rel="icon" href="/favicon.png?v=20260614" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260614" />

        <meta property="og:type" content="website" key="og:type" />
        <meta property="og:site_name" content="FateAura" key="og:site_name" />
        <meta property="og:title" content={DEFAULT_TITLE} key="og:title" />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} key="og:description" />
        <meta property="og:url" content={canonicalUrl} key="og:url" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} key="og:image" />
        <meta property="og:image:type" content="image/png" key="og:image:type" />
        <meta property="og:image:width" content="1200" key="og:image:width" />
        <meta property="og:image:height" content="630" key="og:image:height" />

        <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
        <meta name="twitter:title" content={DEFAULT_TITLE} key="twitter:title" />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} key="twitter:description" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} key="twitter:image" />
      </Head>

      <Script
        src="https://plausible.io/js/pa-LgxI65kqy0AEp-XDiJnWA.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-analytics" strategy="afterInteractive">
        {`
          window.plausible = window.plausible || function(){(plausible.q = plausible.q || []).push(arguments)};
          plausible.init = plausible.init || function(i){plausible.o = i || {}};
          plausible.init();
        `}
      </Script>

      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "x8up694z1y");
        `}
      </Script>

      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      <GuestTrialBanner />
      <Component {...pageProps} />
      <PageTitleBrandGuard />
      <GlobalHomeButton />
    </GuestTrialProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
