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
      // D-22: ルートは英語、日本語は /ja/。一次執筆は日本語（ja/ 配下）で、英語は翻訳。
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
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
          label: 'Guide',
          translations: { ja: 'ガイド' },
          items: [
            { label: 'What S1000D Stack is', translations: { ja: 'S1000D Stack とは' }, slug: 'guide/overview' },
            { label: 'Getting started', translations: { ja: '導入手順' }, slug: 'guide/getting-started' },
            { label: 'Architecture and stages', translations: { ja: '全体構成と進み方' }, slug: 'guide/architecture' },
            { label: 'Embedding in a CSDB product', translations: { ja: 'CSDB 製品への組み込み' }, slug: 'guide/embedding' },
            { label: 'Specification files and trademarks', translations: { ja: '仕様書の扱いと商標' }, slug: 'guide/license' },
          ],
        },
        {
          label: 'Understanding S1000D',
          translations: { ja: 'S1000D を知る' },
          items: [
            { label: 'IETM and S1000D', translations: { ja: 'IETM と S1000D' }, slug: 'guide/ietm-and-s1000d' },
            { label: 'Data modules and the DMC', translations: { ja: 'データモジュールと DMC' }, slug: 'guide/data-module-and-dmc' },
            { label: 'BREX (Business Rules Exchange)', translations: { ja: 'BREX（ビジネスルール交換）' }, slug: 'guide/brex' },
            { label: 'Applicability', translations: { ja: '適用性（どの製品に当てはまるか）' }, slug: 'guide/applicability' },
          ],
        },
        {
          label: 'MCP servers',
          translations: { ja: 'MCP サーバー' },
          items: [
            { label: 's1000d-brex-mcp', slug: 'mcp/brex-mcp' },
            { label: 's1000d-verify-mcp', slug: 'mcp/verify-mcp' },
            { label: 's1000d-reader-mcp', slug: 'mcp/reader-mcp' },
            { label: 's1000d-writer-mcp', slug: 'mcp/writer-mcp' },
          ],
        },
        {
          label: 'Libraries',
          translations: { ja: 'ライブラリ' },
          items: [{ label: 's1000d-core', slug: 'lib/s1000d-core' }],
        },
        {
          label: 'Use cases',
          translations: { ja: 'ユースケース' },
          items: [{ label: 'Three ways to use it', translations: { ja: '3 つの使い方（見取り図）' }, slug: 'use-cases' }],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      pagination: true,
      plugins: [starlightThemeRapide()],
    }),
  ],
});
