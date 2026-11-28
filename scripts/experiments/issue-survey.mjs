// Issue 4.2 への対応（GitHub の Issue #14、DECISIONS の U-07）で使った実測のスクリプト（2026-11-28）。
// いまの brex・verify・reader の MCP を、配布物の Bike Sample Data Set にそのままかけ、
// 読めた件数と読めなかった所を数える。MCP の `dist/tools/handlers.js` を直接呼ぶ（引数と応答は MCP のツールと同じ）。
//
//   cd s1000d-stack   （mcp/ と lib/ をビルド済みにしておく）
//   S1000D_SPEC_DIR=specs/s1000d/issue-4.2 \
//   S1000D_CSDB_DIR="specs/s1000d/issue-4.2/bike-sample-data-set/Bike Data Set for Issue 4.2" \
//     node scripts/experiments/issue-survey.mjs [結果の JSON を書く先]
//
// 標準出力には集計だけを出す。ファイル名・ルール ID・要素名・件数だけで、配布物の文章は出さない（D-03）。
// 結果は docs/notes/issue-4.2-survey.md を参照。
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const spec = resolve(process.env.S1000D_SPEC_DIR ?? '');
const csdb = resolve(process.env.S1000D_CSDB_DIR ?? '');
process.env.S1000D_SPEC_DIR = spec;
process.env.S1000D_CSDB_DIR = csdb;

const load = async (p) => (await import(join(root, p))).toolHandlers;
const V = await load('mcp/s1000d-verify-mcp/dist/tools/handlers.js');
const R = await load('mcp/s1000d-reader-mcp/dist/tools/handlers.js');
const B = await load('mcp/s1000d-brex-mcp/dist/tools/handlers.js');
const core = await import(join(root, 'lib/s1000d-core/dist/index.js'));

const call = async (f, a) => {
  try {
    return await f(a);
  } catch (e) {
    return { _thrown: String(e?.message ?? e) };
  }
};
const inc = (o, k, n = 1) => ((o[k] = (o[k] ?? 0) + n), o);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** core の src/__fixtures__/text-coverage.ts と同じ数え方（本文のテキスト節点が、読み取りの結果に残っているか） */
function textCoverage(xml) {
  const content = core.readContentFromXml(xml);
  if (!content.structured) return undefined;
  const { document } = core.defaultXmlEngine.parse(xml);
  const haystack = norm(
    JSON.stringify([content.blocks, core.readApplicStatements(document)], (k, v) =>
      k === 'location' ? undefined : v,
    )
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\'),
  );
  const rootEl = core.defaultXmlEngine.selectNodes('/*/content', document)[0];
  if (!rootEl) return undefined;
  const r = { total: 0, lost: 0, lostSilent: 0, lostByParent: {} };
  const reported = new Set(Object.keys(content.notReadElements));
  const walk = (el, known = false) => {
    const under = known || reported.has(el.nodeName);
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 3) {
        const t = norm(n.nodeValue ?? '');
        if (!t) continue;
        r.total++;
        if (!haystack.includes(t)) {
          r.lost++;
          if (!under) r.lostSilent++;
          // 「親の親の親/親の親/親」の要素名ごとに数える
          const up = (n, k) => (k === 0 || !n?.parentNode?.nodeName ? [] : [...up(n.parentNode, k - 1), n.nodeName]);
          inc(r.lostByParent, up(el, 4).join('/'));
        }
      } else if (n.nodeType === 1) walk(n, under);
    }
  };
  walk(rootEl);
  return r;
}

// CSDB のフォルダーの下を、サブフォルダーも含めて見る（Issue 4.0 の Bike data set は、DM と図が別のフォルダーにある）
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const files = walk(csdb).sort();
const S = {
  specDir: spec,
  csdbDir: csdb,
  schemaDirs: (await call(V.list_schemas, {})).schemaDirs?.map((d) => ({
    issue: d.issue,
    xsdCount: d.xsdCount,
  })),
  files: { total: files.length, byKind: {} },
  thrown: [],
  schema: { byState: {}, bySchemaName: {}, byIssue: {}, invalid: [] },
  brex: { byState: {}, layers: {}, violationsByRule: {}, unresolved: {}, skippedRules: {} },
  references: { byState: {}, checked: 0, unresolved: [] },
  reader: {
    dm: 0,
    issueSeen: {},
    bySchemaName: {},
    identAndStatusFields: {},
    unknownElements: {},
    notReadElements: {},
    coverage: { measured: 0, total: 0, lost: 0, lostSilent: 0, clean: 0, lostByParent: {}, unreadable: [] },
  },
  pm: [],
  icn: [],
  lists: [],
  applicability: { withAct: 0, statements: 0, thrown: 0 },
  brexMcp: { passed: {}, layers: {} },
};
const note = (tool, f, r) => r?._thrown && S.thrown.push({ tool, file: f, message: r._thrown });

for (const p of files) {
  const f = basename(p);
  const kind = /\.xml$/i.test(f) ? f.split('-')[0].toUpperCase() : `ICN(${f.split('.').pop().toUpperCase()})`;
  inc(S.files.byKind, kind);
  if (!/\.xml$/i.test(f)) continue;

  // 検証（XSD・BREX・参照）
  const isList = /^(DML|DDN)-/i.test(f);
  const v = await call(isList ? V.validate_schema : V.verify_data_module, { path: p });
  note('verify', f, v);
  const ver = v.verification ?? v;
  const sch = ver.schema ?? {};
  inc(S.schema.byState, sch.state ?? 'none');
  inc(S.schema.bySchemaName, ver.target?.schemaName ?? '?');
  inc(S.schema.byIssue, `doc ${ver.target?.issue ?? '?'} / xsd ${sch.issue ?? '?'}`);
  if (sch.state !== 'valid')
    S.schema.invalid.push({
      file: f,
      schemaName: ver.target?.schemaName,
      state: sch.state,
      errorCount: sch.errorCount,
      reason: sch.reason,
      // XSD の違反の文（要素名・属性名と位置。配布物の文章ではない）を、先頭の 3 件だけ
      errors: (v.schema?.errors ?? v.errors ?? []).slice(0, 3).map((e) => String(e.message ?? e).replace(/\s+/g, ' ').slice(0, 200)),
    });
  if (v.brex) {
    inc(S.brex.byState, ver.brex?.state ?? 'none');
    inc(S.brex.layers, String(v.brex.layers?.length ?? 0));
    for (const u of v.brex.unresolvedBrex ?? []) inc(S.brex.unresolved, JSON.stringify(u.dmCode ?? u));
    for (const l of v.brex.layers ?? []) {
      const name = `${l.brex?.dmCode}_${l.brex?.issueInfo?.issueNumber}-${l.brex?.issueInfo?.inWork}`;
      for (const x of l.violations ?? []) inc((S.brex.violationsByRule[name] ??= {}), `${x.ruleId} (${x.kind})`);
      for (const x of l.skipped ?? []) inc((S.brex.skippedRules[name] ??= {}), x.ruleId ?? '?');
    }
  }
  if (v.references) {
    inc(S.references.byState, ver.references?.state ?? 'none');
    S.references.checked += ver.references?.checked ?? 0;
    for (const u of v.references.unresolved ?? [])
      S.references.unresolved.push({ file: f, kind: u.kind, target: u.target ?? u.code ?? u.ref, state: u.state });
  }

  if (/^DMC-/i.test(f)) {
    const r = await call(R.read_data_module, { path: p, section: 'all', verify: 'none', maxNodes: 100000 });
    note('read_data_module', f, r);
    S.reader.dm++;
    inc(S.reader.issueSeen, r.target?.issue ?? 'none');
    const name = r.target?.schemaName ?? '?';
    const e = (S.reader.bySchemaName[name] ??= { count: 0, structured: 0, kind: r.content?.kind });
    e.count++;
    if (r.content?.structured) e.structured++;
    for (const [k, val] of Object.entries(r.identAndStatus ?? {}))
      if (val !== undefined && val !== null && val !== '') inc(S.reader.identAndStatusFields, k);
    for (const [k, n] of Object.entries(r.content?.unknownElements ?? {})) inc(S.reader.unknownElements, k, n);
    for (const [k, n] of Object.entries(r.content?.notReadElements ?? {})) inc(S.reader.notReadElements, k, n);
    let c;
    try {
      c = textCoverage(readFileSync(p, 'utf8'));
    } catch (e) {
      // XML として読めない文書（MCP のツールも同じ理由で断る。上の thrown に入る）
      S.reader.coverage.unreadable.push({ file: f, message: String(e?.message ?? e).slice(0, 160) });
    }
    if (c) {
      const C = S.reader.coverage;
      C.measured++;
      C.total += c.total;
      C.lost += c.lost;
      C.lostSilent += c.lostSilent;
      if (c.lost === 0) C.clean++;
      for (const [k, n] of Object.entries(c.lostByParent)) inc(C.lostByParent, k, n);
    }
    const a = await call(R.describe_applicability, { path: p });
    if (a._thrown) S.applicability.thrown++;
    else {
      if (a.act) S.applicability.withAct++;
      S.applicability.statements += a.statements?.length ?? 0;
    }
    const b = await call(B.check_against_brex, { path: p });
    note('check_against_brex', f, b);
    inc(S.brexMcp.passed, String(b.passed));
    for (const l of b.layers ?? []) inc(S.brexMcp.layers, l.brex);
  } else if (/^PMC-/i.test(f)) {
    const r = await call(R.read_publication_module, { path: p, verify: 'none' });
    note('read_publication_module', f, r);
    const count = (es) => (es ?? []).reduce((n, x) => n + 1 + count(x.entries ?? x.children), 0);
    S.pm.push({ file: f, title: !!r.identAndStatus?.pmTitle, entries: count(r.entries) });
  } else if (/^IMF-/i.test(f)) {
    const r = await call(R.read_icn_metadata, { path: p });
    note('read_icn_metadata', f, r);
    S.icn.push({ file: f, icn: r.icn, items: r.items?.length });
  } else if (isList) {
    const r = await call(V.reconcile_dml, { path: p });
    note('reconcile_dml', f, r);
    for (const l of r.lists ?? [])
      S.lists.push({ file: f, kind: l.kind, count: l.entryCount ?? l.itemCount, counts: l.counts, notListed: l.notListedCount });
  }
}
const ex = await call(B.explain_brex, { limit: 1 });
// explain_brex が既定として選んだ BREX（DMC と版だけ。commonInfo は配布物の文章なので出さない）
S.defaultBrex = ex._thrown
  ? { thrown: ex._thrown }
  : { dmc: ex.brex?.dmc, issue: ex.brex?.issue, counts: ex.brex?.counts };

if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(S, null, 1));
console.log(JSON.stringify(S, null, 1));
