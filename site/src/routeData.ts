import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// og:image と twitter:image を言語ごとに出し分ける。
// og:title・og:description・og:locale・og:url・twitter:card と hreflang は Starlight が出力するので、ここでは足さない。
// og:image は絶対 URL でなければ SNS 側に無視されるため、site と base を含めて組み立てる。
// 画像は 2400 × 1260 px（1200 × 630 の 2 倍）。比率 1.91:1 で X・Facebook・Slack などに共通で使う。
const SITE = 'https://shuji-bonji.github.io/s1000d-stack/';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  // locale は URL 上の言語。ルート（英語）は undefined、日本語は 'ja'
  const image = `${SITE}images/${route.locale === 'ja' ? 'og-image-ja.png' : 'og-image.png'}`;

  route.head.push(
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '2400' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '1260' } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: 'S1000D Stack' } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
    { tag: 'meta', attrs: { name: 'twitter:creator', content: '@shuji_bonji' } },
  );
});
