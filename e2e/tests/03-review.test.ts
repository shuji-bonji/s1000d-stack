/**
 * シナリオ 3: レビュー（Skill: s1000d-review）
 *
 * reader read_data_module（outline）→ verify suggest_fixes → brex check_against_brex（手動確認の取り決め）→
 * writer create_comment（write: true）→ COM-….XML ができる → verify verify_data_module でその comment を確かめる →
 * seqNumber を省くと次の番号になる。
 * レビュー対象の DM は、シナリオ 1 と同じく体験型マニュアルの変換（write: true）で作る。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SPEC_MODE, startStack, ls, type Stack } from '../src/harness.js';
import { brexDmRef, cleanupTmp, convertArgs, csdbDirsFor, JA, newCsdb } from '../src/helpers.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

let stack: Stack;
const csdb = newCsdb('s3');
const DMC = 'KENBAIKI-A-10-20-00-00A-520A-D'; // 画面 scr-top の手順 DM
const dmPath = () => join(csdb, `DMC-${DMC}_001-00_JA-JP.XML`);

/** create_comment の引数。対象は refs の DM。発信者の住所・機密区分・言語・BREX は省略できない */
const commentArgs = (over: Record<string, unknown> = {}) => ({
  refs: [{ kind: 'dmRef', code: DMC }],
  commentType: 'q',
  commentPriorityCode: 'cp01',
  title: '手順 1 の確認',
  paragraphs: ['R-1: 「乗換案内から購入」を押す手順に、押したあとの画面の説明が無い。'],
  originator: { enterpriseName: 'Kenbaiki Works', address: { city: 'Tokyo', country: 'Japan' } },
  senderIdent: 'K0001',
  modelIdentCode: 'KENBAIKI',
  securityClassification: '01',
  language: JA,
  brexDmRef: brexDmRef(),
  issueDate: '2026-10-28',
  yearOfDataIssue: 2026,
  csdbDirs: csdbDirsFor(csdb),
  ...over,
});

beforeAll(async () => {
  stack = await startStack();
  const r = await stack.call('convert_manual', convertArgs(csdb, { write: true }));
  expect(r.data.summary.written, 'レビュー対象の準備（convert_manual）').toBe(10);
});
afterAll(async () => {
  await stack?.close();
  cleanupTmp();
});

describe('シナリオ 3: レビュー', () => {
  it('reader read_data_module（outline）で機密区分・大きさ・見出しを読む', async () => {
    const r = await stack.call('read_data_module', {
      path: dmPath(),
      csdbDirs: [csdb],
      section: 'outline',
    });
    expect(r.isError).toBe(false);
    expect(r.data.securityClassification.dataModule).toBe('01');
    expect(r.data.content.size.nodes).toBeGreaterThan(0);
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.content.outline.length).toBeGreaterThan(0);
  });

  it('verify suggest_fixes: 作りたての DM は XSD valid・BREX passed・指摘 0', async () => {
    const r = await stack.call('suggest_fixes', { path: dmPath(), csdbDirs: csdbDirsFor(csdb) });
    expect(r.isError).toBe(false);
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.verification.brex.state).toBe('passed');
    expect(r.data.verification.references.state).toBe('resolved');
    expect(r.data.fixCount).toBe(0);
    expect(r.data.fixes).toEqual([]);
  });

  it('csdbDirs を渡さない suggest_fixes は、参照がすべて no-csdb（confidence: none）で返る。DM の指摘ではない', async () => {
    const r = await stack.call('suggest_fixes', { path: dmPath() });
    expect(r.isError).toBe(false);
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.verification.references.state).toBe('unresolved');
    expect(r.data.fixCount).toBeGreaterThan(0);
    for (const f of r.data.fixes) {
      expect(f.kind).toBe('reference');
      expect(f.problem).toBe('No CSDB folders were given to search');
      expect(f.confidence).toBe('none');
    }
    // 自作 BREX は CSDB の中にあるので、csdbDirs が無いと探せず、合格とは言わない（spec モードは既定 BREX が S1000D_SPEC_DIR の下で見つかる）
    if (!SPEC_MODE) expect(r.data.verification.brex.state).toBe('incomplete');
  });

  it.skipIf(SPEC_MODE)(
    'brex check_against_brex: 機械で判定できない取り決め（nonContextRules）が manualChecks で返る',
    async () => {
      const r = await stack.call('check_against_brex', { path: dmPath(), csdbDirs: [csdb] });
      expect(r.isError).toBe(false);
      expect(r.data.passed).toBe(true);
      expect(r.data.layers.map((l: any) => l.brex)).toEqual([
        'KENBAIKI-A-00-00-00-00A-022A-D',
        'KBWORKS-A-00-00-00-00A-022A-D',
      ]);
      expect(r.data.layers[0].manualChecks).toHaveLength(1);
      expect(r.data.layers[0].manualChecks[0].ruleId).toBe('KB-00100');
      // verify 側の集計も同じ件数を持つ
      const v = await stack.call('verify_data_module', { path: dmPath(), csdbDirs: [csdb] });
      expect(v.data.verification.brex.manualChecks).toBe(1);
    },
  );

  it('create_comment（write: false）は XML を組み立てて検証するだけで、書かない', async () => {
    const before = ls(csdb);
    const r = await stack.call('create_comment', commentArgs());
    expect(r.isError).toBe(false);
    expect(r.data.error).toBeUndefined();
    expect(r.data.commentCode).toBe('KENBAIKI-K0001-2026-00001-Q');
    expect(r.data.fileName).toMatch(/^COM-KENBAIKI-K0001-2026-00001-Q/);
    expect(r.data.xml).toContain('<comment');
    expect(r.data.xml).toContain('<dmRefGroup>'); // refs の DM（DMC は属性に分解される）
    expect(r.data.xml).toContain('systemCode="10" subSystemCode="2"');
    expect(r.data.xml).toContain('infoCode="520"');
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.verification.brex.state).toBe('passed');
    expect(r.data.written).toEqual([]);
    expect(ls(csdb)).toEqual(before);
  });

  it('create_comment（write: true）で一時 CSDB に COM-….XML ができ、verify_data_module で schema valid・BREX passed', async () => {
    const r = await stack.call('create_comment', commentArgs({ write: true }));
    expect(r.isError).toBe(false);
    expect(r.data.written).toHaveLength(1);
    const path = r.data.written[0] as string;
    expect(path.startsWith(csdb)).toBe(true);
    expect(existsSync(path)).toBe(true);
    expect(path.split('/').pop()).toMatch(/^COM-KENBAIKI-K0001-2026-00001-Q.*\.XML$/);
    expect(readFileSync(path, 'utf8')).toBe(r.data.xml);
    expect(readFileSync(path, 'utf8')).toContain('R-1:');

    // 書いたファイルを別のサーバー（verify）が読んで確かめる
    const v = await stack.call('verify_data_module', { path, csdbDirs: csdbDirsFor(csdb) });
    expect(v.isError).toBe(false);
    expect(v.data.verification.target.schemaName).toBe('comment');
    expect(v.data.verification.schema.state).toBe('valid');
    expect(v.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });
    expect(v.data.verification.references.state).toBe('resolved'); // refs の DM が CSDB にある
    // create_comment の応答の verification と同じ
    expect(v.data.verification.schema.state).toBe(r.data.verification.schema.state);
    expect(v.data.verification.brex.state).toBe(r.data.verification.brex.state);
  });

  it('seqNumber を省いてもう 1 件作ると、CSDB の次の番号（00002）になる', async () => {
    const second = await stack.call(
      'create_comment',
      commentArgs({ title: '手順 2 の確認', write: true }),
    );
    expect(second.data.commentCode).toBe('KENBAIKI-K0001-2026-00002-Q');
    expect(second.data.written).toHaveLength(1);
    const coms = ls(csdb).filter((f) => f.startsWith('COM-'));
    expect(coms).toHaveLength(2);
    // 明示した seqNumber は尊重する
    const explicit = await stack.call('create_comment', commentArgs({ seqNumber: '00009' }));
    expect(explicit.data.commentCode).toBe('KENBAIKI-K0001-2026-00009-Q');
  });
});
