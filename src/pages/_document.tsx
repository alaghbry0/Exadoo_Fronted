// _document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta name="description" content="منصة إكسادوا للتداول والتحليلات المالية" />
        {/* viewport moved to _app.tsx or next.config.ts */}
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
          defer
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}