// @ts-check
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { defineConfig } from 'astro/config';
import starlightThemeRapide from 'starlight-theme-rapide';

// GitHub Pages（https://shuji-bonji.github.io/s1000d-stack/）で公開する前提の設定。
// ローカルで `npm run dev` するときも同じ base で動く。
export default defineConfig({
  site: 'https://shuji-bonji.github.io',
  base: '/s1000d-stack',
  integrations: [
    // astro-mermaid は starlight より前に置く（README の指示）
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'S1000D Stack',
      // ロゴは C 案（六角形 = CSDB、3 段 = データモジュール、外の点 = LLM に結果だけを渡す）。
      // A 案（S のモノグラム）は S2000M などへ広げたときに合わないため不採用（D-21）。
      // 元ファイルは src/assets/logo/ にあり、public/favicon.svg は favicon-c.svg と同じ内容。
      logo: {
        light: './src/assets/logo/c-light.svg',
        dark: './src/assets/logo/c-dark.svg',
        alt: 'S1000D Stack',
      },
      favicon: '/favicon.svg',
      description:
        'LLM が S1000D® の技術文書を読み、BREX（ビジネスルール）に沿って検査・作成するための MCP サーバー・ライブラリ・Skill と、体験型マニュアルの作成ツール・閲覧ソフトの学習サイト',
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
      },
      // hub が Private だった段階 1 では公開済みの s1000d-core に向けていた。
      // サイトは hub を Public にした時点（D-16）で公開されるので、hub に向ける
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/shuji-bonji/s1000d-stack',
        },
      ],
      sidebar: [
        {
          label: 'ガイド',
          items: [
            { label: 'S1000D Stack とは', slug: 'guide/overview' },
            { label: '導入手順', slug: 'guide/getting-started' },
            { label: '全体構成と進み方', slug: 'guide/architecture' },
            { label: '仕様書の扱いと商標', slug: 'guide/license' },
          ],
        },
        {
          label: 'S1000D を知る',
          items: [
            { label: 'IETM と S1000D', slug: 'guide/ietm-and-s1000d' },
            { label: 'データモジュールと DMC', slug: 'guide/data-module-and-dmc' },
            { label: 'BREX（ビジネスルール交換）', slug: 'guide/brex' },
            { label: '適用性（どの製品に当てはまるか）', slug: 'guide/applicability' },
          ],
        },
        {
          label: 'MCP サーバー',
          items: [
            { label: 's1000d-brex-mcp', slug: 'mcp/brex-mcp' },
            { label: 's1000d-verify-mcp', slug: 'mcp/verify-mcp' },
            { label: 's1000d-reader-mcp', slug: 'mcp/reader-mcp' },
          ],
        },
        {
          label: 'ライブラリ',
          items: [{ label: 's1000d-core', slug: 'lib/s1000d-core' }],
        },
        {
          label: 'ユースケース',
          items: [{ label: '3 つの使い方（見取り図）', slug: 'use-cases' }],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      pagination: true,
      plugins: [starlightThemeRapide()],
    }),
  ],
});
