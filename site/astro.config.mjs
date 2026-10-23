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
      description:
        'LLM が S1000D® の技術文書を読み、BREX（ビジネスルール）に沿って検査・作成するための MCP サーバー・ライブラリ・Skill と、体験型マニュアルの作成ツール・閲覧ソフトの学習サイト',
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/shuji-bonji/s1000d-core',
        },
      ],
      sidebar: [
        { label: 'はじめに', slug: 'guide/getting-started' },
        {
          label: 'S1000D を知る',
          items: [
            { label: 'IETM と S1000D', slug: 'guide/ietm-and-s1000d' },
            {
              label: 'データモジュールと DMC',
              slug: 'guide/data-module-and-dmc',
            },
            { label: 'BREX（ビジネスルール交換）', slug: 'guide/brex' },
          ],
        },
        {
          label: 'MCP サーバー',
          items: [
            { label: 's1000d-brex-mcp', slug: 'mcp/brex-mcp' },
            { label: 's1000d-core（ライブラリ）', slug: 'mcp/core' },
          ],
        },
        {
          label: 'このプロジェクトについて',
          items: [
            { label: '構成と進み方', slug: 'about/stack' },
            { label: '仕様書の扱いと商標', slug: 'about/license' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      pagination: true,
      plugins: [starlightThemeRapide()],
    }),
  ],
});
