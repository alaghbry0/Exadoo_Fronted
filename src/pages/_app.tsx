import '../styles/globals.css';
import FooterNav from '../components/FooterNav';

function MyApp({ Component, pageProps }: { Component: React.ComponentType; pageProps: any }) {
  return (
    <>
      <Component {...pageProps} />
      <FooterNav />
    </>
  );
}

export default MyApp;
