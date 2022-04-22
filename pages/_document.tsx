import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="preload"
          href="/fonts/maru/GT-Maru-Regular-Trial.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/maru/GT-Maru-Light-Trial.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/maru/GT-Maru-Mono-Regular-Trial.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/maru/GT-Maru-Mono-Regular-Oblique-Trial.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/maru/GT-Maru-Mono-Bold-Trial.woff2"
          as="font"
          type="font/woff2"
        />
        <script
          defer
          type="text/javascript"
          src="https://api.pirsch.io/pirsch.js"
          id="pirschjs"
          key="pirschjs"
          data-code={process.env.NEXT_PUBLIC_PIRSCH_CODE}></script>
        <script
          defer
          type="text/javascript"
          src="https://api.pirsch.io/pirsch-events.js"
          id="pirscheventsjs"
          key="pirscheventsjs"
          data-code={process.env.NEXT_PUBLIC_PIRSCH_CODE}></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
