import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* إضافة polyfills للمتصفحات القديمة */}
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/core-js/3.26.1/minified.min.js"
            integrity="sha512-RqdD54GLt5uUUw4lOGkvT/uEKpoEoy8KPX8gNB9h04667+zx82yGbVPNAc7YIa8YjFy4HrXWGMui/jTUuKb7w=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // إضافة polyfills يدوياً للمتصفحات القديمة جداً
                if (!window.Promise) {
                  document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.2.8/es6-promise.min.js"><\\/script>');
                }
                if (!window.fetch) {
                  document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/3.6.2/fetch.min.js"><\\/script>');
                }
                if (!window.URL || typeof window.URL !== 'function') {
                  document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/url-polyfill/1.1.12/url-polyfill.min.js"><\\/script>');
                }
              `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;