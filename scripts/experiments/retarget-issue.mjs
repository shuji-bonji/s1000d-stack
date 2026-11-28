// Issue 7 向けに作った DM・PM・コメントを、xsi:noNamespaceSchemaLocation の版だけ別の版に替えて、その版の XSD にかける
// （Issue #14、2026-11-28）。作る側（s1000d-core の buildDataModule など）の出力が、別の版でどこまで通るかを数える。
// ファイルは書き換えない。XML を文字列のまま validate_schema に渡す。
//   S1000D_SPEC_DIR=specs/s1000d/issue-4.2 node scripts/experiments/retarget-issue.mjs <CSDB のフォルダー> 4-2
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
process.env.S1000D_SPEC_DIR = resolve(process.env.S1000D_SPEC_DIR ?? '');
const V = (await import(join(root, 'mcp/s1000d-verify-mcp/dist/tools/handlers.js'))).toolHandlers;
const [dir, issue] = process.argv.slice(2);
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : /\.xml$/i.test(n) && out.push(p);
  }
  return out;
};
const result = { total: 0, valid: 0, invalid: 0, other: 0, byMessage: {}, files: [] };
for (const p of walk(resolve(dir)).sort()) {
  const src = readFileSync(p, 'utf8');
  if (!/S1000D_7\//.test(src)) continue;
  const xml = src.replace(/S1000D_7\//g, `S1000D_${issue}/`);
  let r;
  try {
    r = await V.validate_schema({ xml, maxErrors: 2000 });
  } catch (e) {
    r = { schema: { state: 'thrown', reason: String(e?.message ?? e) } };
  }
  const s = r.schema ?? r.verification?.schema ?? {};
  const errors = r.errors ?? r.schema?.errors ?? [];
  result.total++;
  if (s.state === 'valid') result.valid++;
  else if (s.state === 'invalid') result.invalid++;
  else result.other++;
  const msgs = {};
  for (const e of errors) {
    // 行番号を除き、要素名・属性名の入った文だけを残す
    const m = String(e.message ?? e).replace(/\s+/g, ' ').slice(0, 220);
    msgs[m] = (msgs[m] ?? 0) + 1;
    result.byMessage[m] = (result.byMessage[m] ?? 0) + 1;
  }
  if (s.state !== 'valid')
    result.files.push({ file: p.split('/').pop(), schema: r.target?.schemaName, state: s.state, errorCount: s.errorCount ?? errors.length, reason: s.reason });
}
console.log(JSON.stringify(result, null, 1));
