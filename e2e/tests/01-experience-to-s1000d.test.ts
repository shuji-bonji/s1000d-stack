/**
 * シナリオ 1: 体験型マニュアル → CSDB（Skill: experience-to-s1000d）
 *
 * writer convert_manual（書かずに確認 → 書く）→ verify verify_csdb → reader で読む →
 * DML を置いて verify reconcile_dml → reader list_data_modules（dml）の集計が verify と一致する。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  SERVER_NAMES,
  SPEC_MODE,
  TARGET,
  serverEntry,
  specDir,
  startStack,
  ls,
  type Stack,
} from '../src/harness.js';
import {
  cleanupTmp,
  convertArgs,
  csdbDirsFor,
  dmFiles,
  newCsdb,
  placeDml,
  MANUAL_PATH,
} from '../src/helpers.js';

let stack: Stack;
const csdb = newCsdb('s1');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dry: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wet: any;

/** fixtures/dml の DML が指す DM（変換で必ず作られる） */
const LISTED_FOUND = 'KENBAIKI-A-10-20-00-00A-040A-D';
const LISTED_OTHER_ISSUE = 'KENBAIKI-A-10-20-00-00A-130A-D';
const LISTED_MISSING = 'KENBAIKI-A-99-00-00-00A-040A-D';

beforeAll(async () => {
  stack = await startStack();
});
afterAll(async () => {
  await stack?.close();
  cleanupTmp();
});

describe('起動', () => {
  it('4 本のサーバーが stdio のプロセスとして起動し、期待するツールを持つ（対象と版をログに出す）', () => {
    const expected = {
      brex: ['check_against_brex', 'explain_brex', 'list_notations', 'lookup_sns', 'lookup_value'],
      verify: [
        'check_references',
        'list_schemas',
        'reconcile_dml',
        'suggest_fixes',
        'validate_schema',
        'verify_csdb',
        'verify_data_module',
      ],
      reader: [
        'describe_applicability',
        'list_data_modules',
        'read_data_module',
        'read_icn_metadata',
        'read_publication_module',
        'resolve_reference',
      ],
      writer: [
        'apply_fixes',
        'apply_segments',
        'build_data_module',
        'convert_manual',
        'create_comment',
        'extract_segments',
      ],
    };
    for (const n of SERVER_NAMES) {
      expect([...stack.servers[n].tools].sort(), n).toEqual(expected[n]);
      // 対象どおりの場所から起動している
      expect(serverEntry(n)).toContain(
        TARGET === 'local' ? '/mcp/' : '/node_modules/@shuji-bonji/',
      );
    }
    const versions = SERVER_NAMES.map((n) => `${n} ${stack.servers[n].version}`).join(', ');
    process.stderr.write(
      `[e2e] E2E_TARGET=${TARGET} / ${SPEC_MODE ? 'spec' : '既定'}モード / S1000D_SPEC_DIR=${specDir()} / ${versions}\n`,
    );
  });
});

describe('シナリオ 1: 体験型マニュアル → CSDB', () => {
  it('convert_manual（write: false）は DM 9 件・PM 1 件を組み立て、全件 schema valid・BREX 違反 0・参照解決で、何も書かない', async () => {
    const before = ls(csdb);
    const r = await stack.call('convert_manual', convertArgs(csdb, { write: false }));
    expect(r.isError).toBe(false);
    expect(r.data.error).toBeUndefined();
    dry = r.data;
    // 説明 1 ＋ 画面遷移のプロセス 1 ＋ 画面 4 ＋ 手順 1 ＋ 故障探求 1 ＋ 用語集 1 ＝ DM 9、PM 1
    expect(r.data.summary).toMatchObject({
      dataModules: 9,
      publicationModules: 1,
      failedToBuild: 0,
      brexViolationCount: 0,
      unresolvedReferenceCount: 0,
      written: 0,
    });
    // verification はファイルごとに付く。集計だけでなく 1 件ずつ見る
    const all = [...r.data.dataModules, r.data.publicationModule];
    expect(all).toHaveLength(10);
    for (const d of all) {
      expect(d.verification.schema.state, d.fileName).toBe('valid');
      expect(d.verification.brex, d.fileName).toMatchObject({ state: 'passed', violationCount: 0 });
      expect(d.verification.references.state, d.fileName).toBe('resolved');
    }
    expect(ls(csdb)).toEqual(before); // write: false では何も書かない
  });

  it('write: true で一時 CSDB に DM 9 件・PM 1 件・素材 6 件を書く。台帳（ledger）が返る', async () => {
    const r = await stack.call('convert_manual', convertArgs(csdb, { write: true }));
    expect(r.isError).toBe(false);
    wet = r.data;
    expect(r.data.summary.written).toBe(10);
    const files = ls(csdb);
    expect(files.filter((f) => f.startsWith('PMC-'))).toHaveLength(1);
    expect(files.filter((f) => f.startsWith('ICN-'))).toHaveLength(6);
    // 書いた DM の DMC は書かずに確認したときと同じ（採番は決まっている）
    const codes = (x: typeof dry) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      x.dataModules.map((d: any) => d.dmCode).sort();
    expect(codes(r.data)).toEqual(codes(dry));
    expect(Object.keys(r.data.ledger).length).toBeGreaterThanOrEqual(9);
    // DML の行が指す DMC は、変換で実際に作られる
    expect(codes(r.data)).toEqual(expect.arrayContaining([LISTED_FOUND, LISTED_OTHER_ISSUE]));
    expect(codes(r.data)).not.toContain(LISTED_MISSING);
  });

  it('verify_csdb は書いた全件を schema valid・BREX 違反 0・参照切れ 0 と判定する', async () => {
    // reader と verify は CSDB の索引を最初の呼び出しで作る。DML は先に置いておく（reconcile_dml のため）
    placeDml(csdb);
    // spec モードは brexDmRef が指す既定 BREX のフォルダーも CSDB に含める（無いと brexDmRef が未解決になる）。その BREX 1 件も検証の対象になる
    const r = await stack.call('verify_csdb', { csdbDirs: csdbDirsFor(csdb) });
    expect(r.isError).toBe(false);
    const dms = dmFiles(csdb).length; // 9 件 ＋（既定モードは）自作の BREX 2 層
    const pms = ls(csdb).filter((f) => f.startsWith('PMC-')).length;
    expect(dms).toBe(SPEC_MODE ? 9 : 11);
    const mine = (
      r.data.results as { path: string; verification: Record<string, { state: string }> }[]
    ).filter((x) => x.path.startsWith(csdb));
    expect(mine).toHaveLength(dms + pms);
    for (const x of mine) {
      const name = x.path.split('/').pop();
      expect(x.verification.schema.state, name).toBe('valid');
      expect(x.verification.brex.state, name).toBe('passed');
      expect(x.verification.references.state, name).toBe('resolved');
    }
    // 集計は、既定モードなら CSDB の全件と一致する（spec モードは既定 BREX 自身が 1 件加わり、それは自分の規則に 1 件違反する）
    expect(r.data.totals).toMatchObject({
      schemaInvalid: 0,
      schemaNotFound: 0,
      brexIncomplete: 0,
      referencesUnresolved: 0,
      unreadable: 0,
      ...(SPEC_MODE
        ? {}
        : { objects: dms + pms, schemaValid: dms + pms, brexViolations: 0, brexPassed: dms + pms }),
    });
  });

  it('reader list_data_modules で書いた DM が見え、read_data_module（outline）で題名と構造が読める', async () => {
    const list = await stack.call('list_data_modules', { csdbDirs: [csdb] });
    expect(list.isError).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = list.data.objects as any[];
    const listed = rows.map((o) => o.dmc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of wet.dataModules as any[]) expect(listed, d.dmCode).toContain(d.dmCode);
    const overview = rows.find((o) => o.dmc === LISTED_FOUND);
    expect(overview).toMatchObject({
      schemaName: 'descript',
      infoName: '券売機の概要',
      language: { languageIsoCode: 'ja', countryIsoCode: 'JP' },
    });
    const manual = JSON.parse(readFileSync(MANUAL_PATH, 'utf8')) as { title: string };
    expect(overview.techName).toBe(manual.title);

    // outline: 画面の DM（手順）の見出し・手順番号・最初の文
    const screen = await stack.call('read_data_module', {
      csdbDirs: [csdb],
      dmc: 'KENBAIKI-A-10-20-00-00A-520A-D',
      section: 'outline',
    });
    expect(screen.isError).toBe(false);
    expect(screen.data.target.dmCode.infoCode).toBe('520');
    expect(screen.data.securityClassification.dataModule).toBe('01');
    expect(screen.data.verification.schema.state).toBe('valid');
    const step = screen.data.content.outline.find((n: { kind: string }) => n.kind === 'step');
    expect(step).toMatchObject({ title: 'STEP1', number: '1' });
    expect(step.firstSentence).toContain('乗換案内から購入');
  });

  it('DML がある CSDB での reconcile_dml: found・issue-mismatch・not-found・notListed が期待どおりの件数になる', async () => {
    const r = await stack.call('reconcile_dml', { csdbDirs: [csdb] });
    expect(r.isError).toBe(false);
    expect(r.data.listCount).toBe(1);
    const dml = r.data.lists[0];
    expect(dml).toMatchObject({
      kind: 'dml',
      dmlCode: 'KENBAIKI-K0001-S-2026-00001',
      entryCount: 4,
    });
    // 4 行: 版が一致 ＋ 版違い ＋ 存在しない DMC ＋ プロジェクトの BREX（既定モードは found、spec モードは CSDB に無い）
    expect(dml.counts).toEqual({
      found: SPEC_MODE ? 1 : 2,
      'issue-mismatch': 1,
      'not-found': SPEC_MODE ? 2 : 1,
      'not-checked': 0,
    });
    // 既定では found の行は省かれる
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dml.entries.map((e: any) => [e.state, e.target]),
    ).toEqual(
      expect.arrayContaining([
        ['issue-mismatch', LISTED_OTHER_ISSUE],
        ['not-found', LISTED_MISSING],
      ]),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mismatch = dml.entries.find((e: any) => e.state === 'issue-mismatch');
    expect(mismatch.listedIssueInfo).toEqual({ issueNumber: '002', inWork: '00' });
    expect(mismatch.foundIssueInfo).toEqual({ issueNumber: '001', inWork: '00' });
    // DML に載っていない DM・PM: 作った 9 DM ＋ PM 1 のうち、DML が指す 040（found）と 130（版違い）を除く 8 件
    expect(dml.notListedCount).toBe(8);
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dml.notListed.map((o: any) => o.target),
    ).not.toContain(LISTED_FOUND);
    // includeFound: true なら found の行も返る
    const withFound = await stack.call('reconcile_dml', { csdbDirs: [csdb], includeFound: true });
    expect(withFound.data.lists[0].entries).toHaveLength(4);
  });

  it('reader list_data_modules（include: dml）の reconciliation は、verify reconcile_dml と同じ件数になる', async () => {
    const rec = (await stack.call('reconcile_dml', { csdbDirs: [csdb] })).data.lists[0];
    const list = await stack.call('list_data_modules', { csdbDirs: [csdb], include: ['dml'] });
    expect(list.isError).toBe(false);
    expect(list.data.objects).toHaveLength(1);
    const row = list.data.objects[0];
    expect(row).toMatchObject({ kind: 'dml', dmlCode: rec.dmlCode, entryCount: rec.entryCount });
    expect(row.reconciliation).toEqual({ ...rec.counts, notListed: rec.notListedCount });
  });
});
