// s1000d-core を直接呼んで、配布物のサンプルの CSDB を測る（Issue #23・#24・#25、2026-11-28）。
// issue-survey.mjs は MCP（公開済みの core を読み込む）を呼ぶ。こちらは lib/s1000d-core/dist を使うので、
// core を公開する前に、直した結果を確かめられる。
//   node scripts/experiments/core-survey.mjs <S1000D_SPEC_DIR> <CSDB のフォルダー>
// 出力はファイル名・要素名・件数だけ（D-03）。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const core = await import(join(root, 'lib/s1000d-core/dist/index.js'));
const { Libxml2SchemaValidator } = await import(join(root, 'lib/s1000d-core/dist/xsd-libxml2.js'));
const [spec, csdb] = process.argv.slice(2).map((p) => resolve(p));
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const inc = (o, k, n = 1) => ((o[k] = (o[k] ?? 0) + n), o);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const schemaDirs = core.findSchemaDirs([spec]);
const validator = new Libxml2SchemaValidator();
const S = {
  schemaDirs: schemaDirs.map((d) => ({
    issue: d.issue,
    dir: d.dir.slice(spec.length + 1),
    xsdCount: d.xsdCount,
    alsoAt: d.alsoAt?.map((p) => p.slice(spec.length + 1)),
  })),
  defaultBrex: (() => {
    const f = core.findDefaultBrex([spec]);
    return f ? `${basename(f.path)}` : undefined;
  })(),
  xml: 0,
  bom: 0,
  unreadable: [],
  schema: {},
  xsdUsed: {},
  otherCandidates: {},
  coverage: { measured: 0, total: 0, lost: 0, lostSilent: 0, clean: 0, lostByParent: {} },
  refs: { documents: 0, entries: 0, withTitle: 0 },
};
for (const p of walk(csdb).filter((p) => /\.xml$/i.test(p)).sort()) {
  const xml = readFileSync(p, 'utf8');
  S.xml++;
  if (xml.charCodeAt(0) === 0xfeff) S.bom++;
  let v;
  try {
    v = await core.verifyDataModule(xml, { path: p, schema: { schemaDirs, validator } });
  } catch (e) {
    S.unreadable.push({ file: basename(p), message: String(e?.message ?? e).slice(0, 120) });
    continue;
  }
  if (!v.status.wellFormed) {
    S.unreadable.push({ file: basename(p), message: 'not well-formed' });
    continue;
  }
  inc(S.schema, v.status.schema.state);
  const loc = v.schema?.locate;
  if (loc?.ok) {
    inc(S.xsdUsed, `${loc.issue} ${loc.schemaDir.dir.slice(spec.length + 1)}`);
    for (const o of loc.otherCandidates ?? []) inc(S.otherCandidates, o.dir.slice(spec.length + 1));
  } else if (loc) inc(S.xsdUsed, `(${loc.reason})`);
  if (!/^DMC-/i.test(basename(p))) continue;
  const content = core.readContentFromXml(xml);
  if (content.refs) {
    S.refs.documents++;
    S.refs.entries += content.refs.length;
    S.refs.withTitle += content.refs.filter((r) => r.title).length;
  }
  if (!content.structured) continue;
  const { document } = core.defaultXmlEngine.parse(xml);
  const hay = norm(
    JSON.stringify([content.blocks, content.refs, core.readApplicStatements(document)], (k, x) =>
      k === 'location' ? undefined : x,
    )
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\'),
  );
  const rootEl = core.defaultXmlEngine.selectNodes('/*/content', document)[0];
  if (!rootEl) continue;
  const reported = new Set(Object.keys(content.notReadElements));
  const C = S.coverage;
  let lost = 0;
  const visit = (el, known = false) => {
    const under = known || reported.has(el.nodeName);
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 3) {
        const t = norm(n.nodeValue ?? '');
        if (!t) continue;
        C.total++;
        if (!hay.includes(t)) {
          lost++;
          C.lost++;
          if (!under) C.lostSilent++;
          inc(C.lostByParent, `${el.parentNode?.nodeName ?? ''}/${el.nodeName}`);
        }
      } else if (n.nodeType === 1) visit(n, under);
    }
  };
  visit(rootEl);
  C.measured++;
  if (lost === 0) C.clean++;
}
validator.dispose();
console.log(JSON.stringify(S, null, 1));
