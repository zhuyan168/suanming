// pages/_app.tsx
import type { AppProps } from "next/app";
import Script from "next/script";
import { appWithTranslation } from "next-i18next/pages";
import nextI18NextConfig from "../next-i18next.config";
import { GuestTrialProvider } from "../context/GuestTrialContext";
import GuestTrialBanner from "../components/guest-trial/GuestTrialBanner";

// ✅ 关键：全局 Tailwind 样式只需要在这里引入一次
import "../styles/globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GuestTrialProvider>
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
