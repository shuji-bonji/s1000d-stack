#!/usr/bin/env node
// ja（site/src/content/docs/ja/）と en（site/src/content/docs/ 直下）のページの構造が一致するかを数える。
// 使い方: node scripts/check-i18n.mjs   （site/ で実行。差があれば終了コード 1）
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DOCS = new URL('../src/content/docs/', import.meta.url).pathname;
const JA = join(DOCS, 'ja');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(name)) out.push(p);
  }
  return out;
}

function stats(text) {
  const body = text.startsWith('---') ? text.split('---').slice(2).join('---') : text;
  const code = body.match(/```[\s\S]*?```/g) ?? [];
  const nocode = body.replace(/```[\s\S]*?```/g, '');
  const count = (re) => (nocode.match(re) ?? []).length;
  return {
    h2: count(/^## /gm),
    h3: count(/^### /gm),
    tables: count(/^\| --- /gm),
    rows: count(/^\|(?! ---)/gm),
    mermaid: code.filter((c) => c.startsWith('```mermaid')).length,
    code: code.length,
    admon: count(/^:::\w+/gm),
    bullets: count(/^\s*[-*] /gm),
    links: count(/\]\(/g),
  };
}

let bad = 0;
for (const ja of walk(JA).sort()) {
  const rel = relative(JA, ja);
  const en = join(DOCS, rel);
  if (!existsSync(en)) {
    console.log(`MISSING ${rel}（英語版が無い）`);
    bad++;
    continue;
  }
  const a = stats(readFileSync(ja, 'utf8'));
  const enText = readFileSync(en, 'utf8');
  const b = stats(enText);
  const diff = Object.keys(a).filter((k) => a[k] !== b[k]);
  if (diff.length) {
    bad++;
    console.log(`DIFF ${rel}: ` + diff.map((k) => `${k} ja=${a[k]} en=${b[k]}`).join(', '));
  } else {
    console.log(`ok   ${rel}`);
  }
  if (enText.includes('/s1000d-stack/ja/')) {
    console.log(`     ${rel}: 英語版に /ja/ へのリンクが残っている`);
    bad++;
  }
  if (/[぀-ヿ一-鿿]/.test(enText.replace(/IETM入門[^)\]]*/g, ''))) {
    console.log(`     ${rel}: 英語版に日本語が残っている`);
    bad++;
  }
}
for (const en of walk(DOCS)) {
  const rel = relative(DOCS, en);
  if (rel.startsWith('ja/')) continue;
  if (!existsSync(join(JA, rel))) {
    console.log(`MISSING ja/${rel}（日本語版が無い）`);
    bad++;
  }
}
process.exit(bad ? 1 : 0);
