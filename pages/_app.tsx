// pages/_app.tsx
import type { AppProps } from "next/app";
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
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/card-back.png`;

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
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
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

        <meta property="og:type" content="website" key="og:type" />
        <meta property="og:site_name" content="FateAura" key="og:site_name" />
        <meta property="og:title" content={DEFAULT_TITLE} key="og:title" />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} key="og:description" />
        <meta property="og:url" content={canonicalUrl} key="og:url" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} key="og:image" />

        <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
        <meta name="twitter:title" content={DEFAULT_TITLE} key="twitter:title" />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} key="twitter:description" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} key="twitter:image" />
      </Head>

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
    </GuestTrialProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
