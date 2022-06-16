import { Html, Head, Main, NextScript } from 'next/document';

const FONT_URL_PREFIX = 'https://with-backed-site-fonts.s3.amazonaws.com';
// can defer loading of oblique/bold variants, but we'll want these right away
const preloadFonts = ['GT-Maru-Regular', 'GT-Maru-Mono-Regular'];

function FontLinks() {
  return (
    <>
      {preloadFonts.map((f) => (
        <link
          key={f}
          rel="preload"
          href={`${FONT_URL_PREFIX}/${f}.woff`}
          as="font"
          type="font/woff"
        />
      ))}
    </>
  );
}

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <FontLinks />
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
