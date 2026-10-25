#!/usr/bin/env node
/**
 * stack.json を実測から生成し、CI では npm と突き合わせる。
 * houki-hub / pdf-agent-stack の scripts/generate-stack.mjs と同じ設計（2026-10-24 に移植）。
 *
 * **正典は npm**（公開されている版）。ローカルの git tag / package.json は
 * 「手元が公開版より進んでいないか」を見るための参考値でしかない。
 * CI にはローカルの clone が無いので、**照合は npm だけで完結する**ように分けてある。
 *
 *   node scripts/generate-stack.mjs            # 生成（手元）
 *   node scripts/generate-stack.mjs --check    # 照合のみ（CI）。ずれていれば exit 1
 *   node scripts/generate-stack.mjs --readme   # README.md の表を差し替え
 *   node scripts/generate-stack.mjs --root /path/to/s1000d-stack
 *
 * 依存なし（Node 20+）。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const ROOT = resolve(value('root', join(HERE, '..')));
const STACK_FILE = join(ROOT, 'stack.json');
const README_FILE = join(ROOT, 'README.md');

/**
 * 構成の台帳 —— **ここだけが手で書く場所**。
 *
 *   layer   役割
 *             core          S1000D のデータを読む・照合する共有ライブラリ（全 MCP が依存）
 *             model         製品とエージェントが共有するデータモデル（S1000D に依存しない）
 *             mcp           LLM が呼ぶ処理（BREX の説明と照合、読み取り、検証、生成）
 *             procedure     LLM が読む手順（Skill）
 *             app           人が使う製品（作成ツール・閲覧ソフト）
 *             hub           本リポジトリ（構成表とサイト）
 *   form    配布形態 mcp-server / library / skill / app / site（「誰が起動するか」で決める）
 *   status  進み具合 released / developing / planned / concept
 *             released    = npm に公開済み。npm 照合の対象
 *             developing  = リポジトリで開発中。npm 未公開なので照合しない（ローカルの状態だけ記録する）
 *             planned     = 着手順が決まっている。ディレクトリも npm も無い
 *             concept     = 構想だけ。名前と束ねる単位を予約している段階
 */
const REGISTRY = [
  // ── 公開済み ────────────────────────────────────────────────
  { name: 's1000d-core',      dir: 'lib/s1000d-core',      npm: '@shuji-bonji/s1000d-core',      layer: 'core', form: 'library',    status: 'released',   public: true,
    note: 'DMC・ICN・PMC の分解、識別・状態部の読み取り、BREX の読み取りと照合（連鎖・層別）、XSD 検証（SchemaValidator、実装は libxml2-wasm のサブパス）、参照の解決、適用性の 3 値評価、本文（descript / proced / process / fault / pm）の共通の形への読み取り、検証状態 VerificationStatus。全 MCP が依存' },

  // ── 開発中（リポジトリはある。npm 未公開。段階 2 が揃った時点で公開、D-16）────
  { name: 's1000d-brex-mcp',  dir: 'mcp/s1000d-brex-mcp',  npm: '@shuji-bonji/s1000d-brex-mcp',  layer: 'mcp',  form: 'mcp-server', status: 'developing', public: false,
    note: 'BREX を LLM が読み、データモジュールを BREX に照合する。explain_brex / lookup_sns / lookup_value / list_notations / check_against_brex の 5 tools。段階 1 の成果物' },
  { name: 's1000d-verify-mcp', dir: 'mcp/s1000d-verify-mcp', npm: '@shuji-bonji/s1000d-verify-mcp', layer: 'mcp', form: 'mcp-server', status: 'developing', public: false,
    note: '段階 2。利用者が入手した公式 XSD による検証 ＋ BREX 照合（core を呼ぶ）＋ 参照の解決を 1 つの検証状態にまとめる。verify_data_module / validate_schema / check_references / verify_csdb / list_schemas の 5 tools' },
  { name: 's1000d-reader-mcp', dir: 'mcp/s1000d-reader-mcp', npm: '@shuji-bonji/s1000d-reader-mcp', layer: 'mcp', form: 'mcp-server', status: 'developing', public: false,
    note: '段階 2。データモジュールの本文を構造化して返す、参照の解決、適用性の判定（式は LLM に渡さない）。応答に検証状態を含める。list_data_modules / read_data_module / read_publication_module / resolve_reference / describe_applicability / read_icn_metadata の 6 tools' },
  { name: 'experiential-manual-model', dir: 'lib/experiential-manual-model', npm: '@shuji-bonji/experiential-manual-model', layer: 'model', form: 'library', status: 'developing', public: false,
    note: '段階 2。体験型マニュアルの共通データモデル（型・JSON Schema・検査・2021 年の作品 JSON からの変換）。S1000D に依存しない。名前は U-04 で確定' },
  { name: 's1000d-stack',     dir: '.',                    npm: null,                            layer: 'hub',  form: 'site',       status: 'developing', public: false,
    note: '本リポジトリ。site/ に Astro Starlight の学習サイト（GitHub Pages で公開予定）' },

  // ── 予定・構想（ディレクトリも npm も無い。照合はしない）──────────
  { name: 's1000d-writer-mcp', dir: 'mcp/s1000d-writer-mcp', npm: '@shuji-bonji/s1000d-writer-mcp', layer: 'mcp', form: 'mcp-server', status: 'planned', public: false,
    note: '段階 3。共通データモデルからデータモジュール・パブリケーションモジュールを生成する。S1000D との変換関数はここに置く' },
  { name: 's1000d-skills',     dir: 'skill/',                npm: null,                             layer: 'procedure', form: 'skill',  status: 'concept', public: false,
    note: '段階 3。experience-to-s1000d / s1000d-publish / s1000d-review の 3 つ。リポジトリ名の規則は U-09' },
  { name: 'manual-editor',     dir: 'app/manual-editor',     npm: null,                             layer: 'app',  form: 'app',        status: 'concept', public: false,
    note: '段階 3。体験型マニュアルの作成ツール。製品名は未定（U-05）。AI が無くても動く' },
  { name: 'manual-viewer',     dir: 'app/manual-viewer',     npm: null,                             layer: 'app',  form: 'app',        status: 'concept', public: false,
    note: '段階 4。閲覧ソフト（WebMCP 対応）。製品名は未定（U-05）' },
];

/** 外部にあり、この束ねの配下に置かないもの（参照だけ残す） */
const EXTERNAL = [
  { name: 'S1000D 配布物（s1000d.org）', layer: 'source', form: 'data', public: false, note: '仕様書 PDF・XSD・既定 BREX・公式サンプル。利用条件により再配布できないため、利用者が入手して S1000D_SPEC_DIR で指定する' },
  { name: 'i2oss/s1000d-mcp', layer: 'mcp', form: 'mcp-server', public: true, note: 'Python の S1000D MCP（自作サブセット XSD、参照・適用性）。依存しない。参照・適用性の実装の参考' },
  { name: 'Zenn Book「IETM入門 — 概念から S1000D まで」', layer: 'learning', form: 'book', public: true, note: '概念の入門はこちら。サイトはこのスタックの利用者向けの説明に絞る' },
];

const sh = (cmd, cmdArgs, opts = {}) => {
  try {
    return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60_000, ...opts }).trim();
  } catch {
    return null;
  }
};

const npmVersion = (pkg) => (pkg ? sh('npm', ['view', pkg, 'version']) : null);

function localState(entry) {
  const dir = join(ROOT, entry.dir);
  if (!existsSync(dir)) return { present: false, version: null, tag: null, dirty: null };
  let version = null;
  for (const file of ['package.json', 'plugin.json', '.claude-plugin/plugin.json']) {
    const p = join(dir, file);
    if (!existsSync(p)) continue;
    try {
      version = JSON.parse(readFileSync(p, 'utf8')).version ?? null;
      if (version) break;
    } catch {
      /* 壊れていれば次を試す */
    }
  }
  const tag = sh('git', ['-C', dir, 'describe', '--tags', '--abbrev=0']);
  const status = sh('git', ['-C', dir, 'status', '--porcelain']);
  const unpushed = sh('git', ['-C', dir, 'log', '--oneline', '@{u}..HEAD']);
  return {
    present: true,
    version,
    tag,
    dirty: status === null ? null : status.length > 0,
    unpushedCommits: unpushed === null ? null : unpushed ? unpushed.split('\n').length : 0,
  };
}

/** 一致の判定。「ずれ」と「まだ測っていない」を混ぜない */
function consistencyOf(entry, npmVer, local) {
  if (entry.status === 'developing') return { status: 'developing', detail: 'npm 未公開（開発中）。照合対象外' };
  if (entry.status !== 'released') return { status: 'not_started', detail: `${entry.status}（未着手のため照合対象外）` };
  if (!entry.npm) return { status: 'not_published', detail: 'npm 未公開のため照合対象外' };
  if (npmVer === null) return { status: 'not_measured', detail: 'npm view が応答しなかった' };
  if (!local.present) return { status: 'npm_only', detail: `npm ${npmVer}（ローカル未確認）` };
  if (local.version === null) return { status: 'not_measured', detail: 'ローカルの version を読めなかった' };
  if (local.version === npmVer) return { status: 'match', detail: `${npmVer}` };
  return { status: 'drift', detail: `npm ${npmVer} ≠ local ${local.version}` };
}

function build() {
  const repos = REGISTRY.map((entry) => {
    const measured = entry.status === 'released' || entry.status === 'developing';
    const npmVer = entry.status === 'released' ? npmVersion(entry.npm) : null;
    const local = measured ? localState(entry) : { present: false };
    return {
      name: entry.name,
      dir: entry.dir,
      npm: entry.npm,
      layer: entry.layer,
      form: entry.form,
      status: entry.status,
      public: entry.public,
      ...(entry.note ? { note: entry.note } : {}),
      published: npmVer,
      local: local.present ? { version: local.version, tag: local.tag, dirty: local.dirty, unpushedCommits: local.unpushedCommits } : null,
      consistency: consistencyOf(entry, npmVer, local),
    };
  });
  return {
    $comment: [
      's1000d-stack の構成表。**手で書くのは scripts/generate-stack.mjs の REGISTRY だけ**。',
      '版は実測（npm view / ローカルの package.json・git tag）で、推測は書かない。',
      '正典は npm（published）。local は「手元が公開版より進んでいないか」の参考値。',
      'layer = 役割 / form = 配布形態（誰が起動するか）/ status = released・developing・planned・concept。',
      'developing はリポジトリで開発中で npm 未公開。planned / concept はディレクトリも npm も無い。',
    ],
    generatedAt: new Date().toISOString(),
    generatedBy: 'scripts/generate-stack.mjs',
    npmScope: '@shuji-bonji',
    repos,
    external: EXTERNAL,
  };
}

const LABEL = {
  match: '一致', drift: '⚠ ずれ', not_measured: '未測定', npm_only: 'npm のみ', not_published: '未公開', not_started: '未着手', developing: '開発中',
};

function printSummary(stack) {
  const w = (s, n) => String(s ?? '—').padEnd(n, ' ');
  console.log(`# stack.json（${stack.generatedAt}）\n`);
  console.log(`  ${w('リポジトリ', 20)} ${w('layer', 10)} ${w('form', 12)} ${w('status', 11)} ${w('npm', 9)} ${w('local', 9)} 照合`);
  for (const r of stack.repos) {
    console.log(`  ${w(r.name, 20)} ${w(r.layer, 10)} ${w(r.form, 12)} ${w(r.status, 11)} ${w(r.published, 9)} ${w(r.local?.version, 9)} ${LABEL[r.consistency.status]}`);
  }
  const drift = stack.repos.filter((r) => r.consistency.status === 'drift');
  const unmeasured = stack.repos.filter((r) => r.consistency.status === 'not_measured');
  const dirty = stack.repos.filter((r) => r.local?.dirty);
  const unpushed = stack.repos.filter((r) => r.local?.unpushedCommits > 0);
  console.log();
  for (const r of drift) console.log(`  ⚠ ${r.name}: ${r.consistency.detail}`);
  if (unmeasured.length) console.log(`  ・未測定 ${unmeasured.length} 件（指標に数えない）`);
  if (dirty.length) console.log(`  ・未コミットの変更: ${dirty.map((r) => r.name).join(', ')}`);
  if (unpushed.length) console.log(`  ・未 push: ${unpushed.map((r) => `${r.name}(${r.local.unpushedCommits})`).join(', ')}`);
}

const STATUS_JA = { released: '公開済み', developing: '開発中', planned: '予定', concept: '構想' };

function renderReadmeTable(stack) {
  const row = (r) => {
    const ver = r.published ?? r.local?.version ?? '—';
    const npm = r.npm && r.status === 'released' ? `\`${r.npm}\`` : '—';
    const link = r.public ? `[${r.name}](https://github.com/shuji-bonji/${r.name})` : r.name;
    return `| ${link} | ${r.layer} | ${r.form} | ${STATUS_JA[r.status]} | ${ver} | ${npm} |`;
  };
  const rows = stack.repos.filter((r) => r.layer !== 'hub').map(row);
  return [
    '<!-- stack:begin — scripts/generate-stack.mjs が生成。手で編集しない -->',
    '',
    `> 版は実測（${stack.generatedAt.slice(0, 10)} 時点の \`npm view\`）。`,
    '',
    '| リポジトリ | 役割 | 配布形態 | 状態 | 版 | npm |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '<!-- stack:end -->',
  ].join('\n');
}

function updateReadme(stack) {
  if (!existsSync(README_FILE)) {
    console.log(`\n  README.md が無いので表だけ出力します:\n`);
    console.log(renderReadmeTable(stack));
    return;
  }
  const src = readFileSync(README_FILE, 'utf8');
  const begin = src.indexOf('<!-- stack:begin');
  const end = src.indexOf('<!-- stack:end -->');
  if (begin < 0 || end < 0) {
    console.log('\n  README.md に <!-- stack:begin --> / <!-- stack:end --> が無いので差し替えません。');
    console.log(renderReadmeTable(stack));
    return;
  }
  writeFileSync(README_FILE, src.slice(0, begin) + renderReadmeTable(stack) + src.slice(end + '<!-- stack:end -->'.length));
  console.log(`\n  README.md の表を更新しました`);
}

if (flag('check')) {
  if (!existsSync(STACK_FILE)) {
    console.error(`stack.json がありません: ${STACK_FILE}`);
    process.exit(2);
  }
  const stack = JSON.parse(readFileSync(STACK_FILE, 'utf8'));
  const problems = [];
  let checked = 0;
  for (const r of stack.repos) {
    if (!r.npm || r.status !== 'released') continue;
    const now = npmVersion(r.npm);
    if (now === null) {
      problems.push({ kind: 'not_measured', name: r.name, detail: 'npm view が応答しなかった' });
      continue;
    }
    checked += 1;
    if (now !== r.published) problems.push({ kind: 'drift', name: r.name, detail: `stack.json ${r.published} ≠ npm ${now}` });
  }
  const drift = problems.filter((p) => p.kind === 'drift');
  const unmeasured = problems.filter((p) => p.kind === 'not_measured');
  console.log(`# stack.json 照合（npm ${checked} 件）`);
  for (const p of problems) console.log(`  ${p.kind === 'drift' ? '⚠' : '・'} ${p.name}: ${p.detail}`);
  if (unmeasured.length) {
    console.log(`\n  判定不能 ${unmeasured.length} 件 — 指標を信用しない`);
    process.exit(2);
  }
  if (drift.length) {
    console.log(`\n  ずれ ${drift.length} 件 — \`node scripts/generate-stack.mjs --readme\` で更新すること`);
    process.exit(1);
  }
  console.log('\n  すべて一致');
  process.exit(0);
}

const stack = build();
writeFileSync(STACK_FILE, `${JSON.stringify(stack, null, 2)}\n`);
printSummary(stack);
console.log(`\n  書き出し: ${STACK_FILE}`);
if (flag('readme')) updateReadme(stack);
