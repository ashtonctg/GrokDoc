import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/plt0qzc.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        <link
          rel="icon"
          media="(prefers-color-scheme: light)"
          href="/xai.png"
          type="image/png"
        />
        <link
          rel="icon"
          media="(prefers-color-scheme: dark)"
          href="/xai_white.png"
          type="image/png"
        />
        
        <title>GrokDoc</title>
        <meta
          name="description"
          content="Your AI Doctor powered by Grok"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;