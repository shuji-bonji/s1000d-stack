// 2 つの版の xml_schema_flat/ を比べ、要素名と属性名の差を XSD ごとに数える（Issue #14、2026-11-28）。
//   node scripts/experiments/xsd-name-diff.mjs <古い版の xml_schema_flat> <新しい版の xml_schema_flat> [xsd 名...]
// 名前の集合だけを比べる。内容モデル（子の順序・出現回数）と型の違いは見ない。
// 出力は要素名・属性名と件数だけ（XSD の注釈の文章は出さない）。
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [a, b, ...only] = process.argv.slice(2);
const names = (dir, f) => {
  const p = join(dir, f);
  if (!existsSync(p)) return undefined;
  const x = readFileSync(p, 'utf8');
  const pick = (re) => new Set([...x.matchAll(re)].map((m) => m[1]));
  return {
    elements: pick(/<xs:element\b[^>]*\bname="([^"]+)"/g),
    attributes: pick(/<xs:attribute\b[^>]*\b(?:name|ref)="([^"]+)"/g),
  };
};
const files = [...new Set([...readdirSync(a), ...readdirSync(b)])]
  .filter((f) => f.endsWith('.xsd') && (only.length === 0 || only.includes(f.replace(/\.xsd$/, ''))))
  .sort();
const diff = (x, y) => [...x].filter((n) => !y.has(n)).sort();
const out = {};
for (const f of files) {
  const A = names(a, f);
  const B = names(b, f);
  if (!A || !B) {
    out[f] = A ? 'only in old' : 'only in new';
    continue;
  }
  out[f] = {
    elements: { old: A.elements.size, new: B.elements.size, onlyOld: diff(A.elements, B.elements), onlyNew: diff(B.elements, A.elements) },
    attributes: { old: A.attributes.size, new: B.attributes.size, onlyOld: diff(A.attributes, B.attributes), onlyNew: diff(B.attributes, A.attributes) },
  };
}
console.log(JSON.stringify(out, null, 1));
