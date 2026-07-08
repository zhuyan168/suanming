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
import ReadingFunnelTracker from "../components/ReadingFunnelTracker";

// ✅ 关键：全局 Tailwind 样式只需要在这里引入一次
import "../styles/globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = "1361599962602343";
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

function MetaPixelPageViews() {
  const router = useRouter();

  useEffect(() => {
    const trackPageView = () => {
      const fbq = (window as typeof window & {
        fbq?: (action: string, event: string) => void;
      }).fbq;
      fbq?.("track", "PageView");
    };

    router.events.on("routeChangeComplete", trackPageView);
    return () => router.events.off("routeChangeComplete", trackPageView);
  }, [router.events]);

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
        <link rel="shortcut icon" href="/favicon.png?v=20260707" type="image/png" />
        <link rel="icon" href="/favicon.png?v=20260707" type="image/png" sizes="64x64" />
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

      <Script id="microsoft-clarity" strategy="lazyOnload">
        {`
          window.setTimeout(function() {
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x8up694z1y");
          }, 5000);
        `}
      </Script>

      <Script id="meta-pixel" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
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
      <MetaPixelPageViews />
      <PageTitleBrandGuard />
      <ReadingFunnelTracker />
      <GlobalHomeButton />
    </GuestTrialProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
