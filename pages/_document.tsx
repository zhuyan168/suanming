import Document, { Html, Head, Main, NextScript, type DocumentContext, type DocumentInitialProps } from 'next/document'

type MyDocumentProps = DocumentInitialProps & {
  locale?: string
}

export default function MyDocument({ locale = 'en' }: MyDocumentProps) {
  return (
    <Html lang={locale} className="dark">
      <Head>
        {/* 全局字体和图标 */}
      </Head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1361599962602343&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<MyDocumentProps> => {
  const initialProps = await Document.getInitialProps(ctx)
  return {
    ...initialProps,
    locale: ctx.locale || ctx.defaultLocale || 'en',
  }
}

