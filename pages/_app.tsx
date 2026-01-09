// pages/_app.tsx
import type { AppProps } from "next/app";

// ✅ 关键：全局 Tailwind 样式只需要在这里引入一次
import "../styles/globals.css"; 
// ↑ 如果这个路径不对，下面我教你怎么确认

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

