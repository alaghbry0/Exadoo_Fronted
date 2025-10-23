// _document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* Basic Meta Tags */}
        <meta name="description" content="منصة إكسادوا للتداول والتحليلات المالية" />
        <meta name="keywords" content="تداول، فوركس، تحليلات مالية، إشارات تداول، أكاديمية تداول" />
        <meta name="author" content="Exaado" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Exaado" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Exaado" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0084FF" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Exaado - منصة التداول والتعليم" />
        <meta property="og:description" content="منصة شاملة للتداول والتعليم المالي" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:locale" content="ar_SA" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Exaado - منصة التداول والتعليم" />
        <meta name="twitter:description" content="منصة شاملة للتداول والتعليم المالي" />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Telegram Web App */}
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