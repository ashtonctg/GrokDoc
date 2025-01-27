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

        <link rel="icon" href="/xai_white.png" type="image/png" />
        
        <title>GrokDoc</title>
        <meta
          name="description"
          content="GrokDoc: Your AI-powered doctor for symptom analysis, treatment plans, and health insights."
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;