import type { AppProps } from 'next/app';
import '../styles/globals.css';
import FooterNav from '../components/FooterNav';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <FooterNav />
    </>
  );
}

export default MyApp;
