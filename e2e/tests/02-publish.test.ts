/**
 * シナリオ 2: 下書き → DM（Skill: s1000d-publish）
 *
 * writer build_data_module → fixes[] の several を apply_fixes で選んで直す → write: true →
 * write-conflict → overwrite。書いた DM は verify verify_data_module で確かめる。
 *
 * 自作 BREX（fixtures/csdb-base）の規則を前提にするので、既定モードだけで動かす。
 *   KB-00001 責任企業は K0002 だけ                 → 違反の修正は 1 つ（exact）
 *   KB-00003 機密区分は 01 / 02 / 03               → 違反の修正は 3 つ（several）
 *   KB-00002 情報コードは 022・040・130・411 と 500~599 → 違反の修正は単一値 4 つと範囲 1 つ（several）
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SPEC_MODE, startStack, ls, type Stack } from '../src/harness.js';
import { allocation, cleanupTmp, descriptDraft, newCsdb } from '../src/helpers.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

let stack: Stack;
const csdb = newCsdb('s2');

beforeAll(async () => {
  stack = await startStack();
});
afterAll(async () => {
  await stack?.close();
  cleanupTmp();
});

/** 応答の fixes[] から、規則 ID（source の末尾）で修正を探す */
const fixOf = (data: any, ruleId: string) =>
  data.fixes.find((f: any) => String(f.source).endsWith(ruleId));
/** 候補 1 つを、apply_fixes の選択（location と候補の action・target・value の写し）にする */
const selectionOf = (fix: any, cand: any, value: string = cand.value) => ({
  location: fix.location,
  action: cand.action,
  target: cand.target,
  value,
});

describe.skipIf(SPEC_MODE)('シナリオ 2: 下書き → DM', () => {
  // 責任企業 K0001（exact の修正）と機密区分 09（several の修正）に違反する下書き
  const violating = () =>
    descriptDraft({ responsiblePartnerCompany: 'K0001', securityClassification: '09' });
  const build = (extra: Record<string, unknown> = {}) =>
    stack.call('build_data_module', {
      draft: violating(),
      allocation: allocation(),
      csdbDirs: [csdb],
      ...extra,
    });

  it('exact の候補は自動で適用されて appliedFixes[] に出る（責任企業 K0001 → K0002）', async () => {
    const r = await build();
    expect(r.isError).toBe(false);
    expect(r.data.error).toBeUndefined();
    expect(r.data.appliedFixes).toHaveLength(1);
    expect(r.data.appliedFixes[0]).toMatchObject({
      kind: 'brex-value',
      action: 'replace',
      value: 'K0002',
      changed: { before: 'K0001', after: 'K0002' },
    });
    expect(r.data.xml).toContain('<responsiblePartnerCompany enterpriseCode="K0002"');
    expect(r.data.xml).not.toContain('enterpriseCode="K0001"');
  });

  it('several の候補は自動で適用されず fixes[] に残る（機密区分 09 → 01 / 02 / 03）', async () => {
    const r = await build();
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.verification.brex).toMatchObject({ state: 'violations', violationCount: 1 });
    const fix = fixOf(r.data, 'KB-00003');
    expect(fix).toMatchObject({ kind: 'brex-value', confidence: 'several' });
    expect(fix.candidates.map((c: any) => c.value).sort()).toEqual(['01', '02', '03']);
    expect(r.data.xml).toContain('securityClassification="09"'); // サーバーは候補を選ばない
    expect(r.data.byConfidence).toMatchObject({ several: 1 });
  });

  it('apply_fixes に候補の 1 つを渡すと applied に入り、再検証で違反が消える', async () => {
    const built = await build();
    const fix = fixOf(built.data, 'KB-00003');
    const cand = fix.candidates.find((c: any) => c.value === '02');
    const r = await stack.call('apply_fixes', {
      xml: built.data.xml,
      csdbDirs: [csdb],
      selections: [selectionOf(fix, cand)],
    });
    expect(r.isError).toBe(false);
    expect(r.data.appliedCount).toBe(1);
    expect(r.data.rejected).toEqual([]);
    expect(r.data.applied[0].changed).toMatchObject({ before: '09', after: '02' });
    expect(r.data.xml).toContain('securityClassification="02"');
    // 再検証: BREX の違反は 0、残る修正に KB-00003 は無い
    expect(r.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });
    expect((r.data.fixes ?? []).filter((f: any) => String(f.source).endsWith('KB-00003'))).toEqual(
      [],
    );
    expect(r.data.verification.schema.state).toBe('valid');
  });

  it('候補の外の値は rejected になる（理由 candidate-not-offered）。XML は変わらない', async () => {
    const built = await build();
    const fix = fixOf(built.data, 'KB-00003');
    const cand = fix.candidates[0];
    const r = await stack.call('apply_fixes', {
      xml: built.data.xml,
      csdbDirs: [csdb],
      selections: [selectionOf(fix, cand, '05')],
    });
    expect(r.data.appliedCount).toBe(0);
    expect(r.data.rejected).toHaveLength(1);
    expect(r.data.rejected[0].reason).toBe('candidate-not-offered');
    expect(r.data.xml).toContain('securityClassification="09"');
    expect(r.data.xml).not.toContain('"05"');
  });

  it('範囲の候補（500~599）は、範囲に合う値だけを適用する。外れた値は value-not-allowed', async () => {
    // 情報コード 041 は KB-00002 の許可値（022・040・130・411 と範囲 500~599）に無い
    const built = await stack.call('build_data_module', {
      draft: descriptDraft({ sourceId: 'range-case' }),
      allocation: allocation({
        rules: {
          sns: { systemCode: '10', subSystemCode: '2', subSubSystemCode: '0', assyCode: '00' },
          infoCodeByKind: { descript: { infoCode: '041', infoCodeVariant: 'A' } },
          itemLocationCode: 'D',
        },
      }),
      csdbDirs: [csdb],
    });
    const fix = fixOf(built.data, 'KB-00002');
    expect(fix.confidence).toBe('several');
    const range = fix.candidates.find((c: any) => c.valueForm === 'range');
    expect(range).toBeDefined();
    expect(fix.candidates.filter((c: any) => (c.valueForm ?? 'single') === 'single')).toHaveLength(
      4,
    );

    const out = await stack.call('apply_fixes', {
      xml: built.data.xml,
      csdbDirs: [csdb],
      selections: [selectionOf(fix, range, '600')],
    });
    expect(out.data.appliedCount).toBe(0);
    expect(out.data.rejected[0].reason).toBe('value-not-allowed');

    const inside = await stack.call('apply_fixes', {
      xml: built.data.xml,
      csdbDirs: [csdb],
      selections: [selectionOf(fix, range, '510')],
    });
    expect(inside.data.appliedCount).toBe(1);
    expect(inside.data.applied[0].changed).toMatchObject({ before: '041', after: '510' });
    expect(inside.data.xml).toContain('infoCode="510"');
  });

  describe('書き込み', () => {
    // 違反のない下書き。版を決めて、同じ名前のファイルを作り直せるようにする
    const clean = () => descriptDraft({ issueInfo: { issueNumber: '001', inWork: '00' } });
    const fileName = 'DMC-KENBAIKI-A-10-20-00-00A-040A-D_001-00_JA-JP.XML';
    const target = () => join(csdb, fileName);
    let ledger: Record<string, string>;

    it('write: false では何も書かない。write: true で最初の csdbDirs に DMC-….XML を書く', async () => {
      const dry = await stack.call('build_data_module', {
        draft: clean(),
        allocation: allocation(),
        csdbDirs: [csdb],
      });
      expect(dry.data.fileName).toBe(fileName);
      expect(dry.data.written).toEqual([]);
      expect(existsSync(target())).toBe(false);
      expect(dry.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });

      const wet = await stack.call('build_data_module', {
        draft: clean(),
        allocation: allocation(),
        csdbDirs: [csdb],
        write: true,
      });
      expect(wet.data.written).toEqual([target()]);
      expect(readFileSync(target(), 'utf8')).toBe(wet.data.xml);
      ledger = wet.data.ledger;
    });

    it('書いた DM を verify_data_module に通すと、build の verification と同じ結果になる', async () => {
      const v = await stack.call('verify_data_module', { path: target(), csdbDirs: [csdb] });
      expect(v.isError).toBe(false);
      const ver = v.data.verification;
      expect(ver.schema.state).toBe('valid');
      expect(ver.brex).toMatchObject({ state: 'passed', violationCount: 0 });
      expect(ver.references.state).toBe('resolved');
    });

    it('同じものをもう一度 write: true で書くと write-conflict。何も変わらない', async () => {
      const before = readFileSync(target(), 'utf8');
      const again = await stack.call('build_data_module', {
        draft: clean(),
        allocation: allocation({ ledger }),
        csdbDirs: [csdb],
        write: true,
      });
      expect(again.data.written).toEqual([]);
      expect(again.data.writeSkipped.reason).toBe('write-conflict');
      expect(readFileSync(target(), 'utf8')).toBe(before);
    });

    it('overwrite: true なら上書きできる', async () => {
      const over = await stack.call('build_data_module', {
        draft: descriptDraft({
          issueInfo: { issueNumber: '001', inWork: '00' },
          body: [{ kind: 'para', text: '上書きした本文。' }],
        }),
        allocation: allocation({ ledger }),
        csdbDirs: [csdb],
        write: true,
        overwrite: true,
      });
      expect(over.data.written).toEqual([target()]);
      expect(readFileSync(target(), 'utf8')).toContain('上書きした本文。');
    });

    it('版を決めなければ、CSDB にある版の次（002-00）に書く', async () => {
      const next = await stack.call('build_data_module', {
        draft: descriptDraft(),
        allocation: allocation({ ledger }),
        csdbDirs: [csdb],
        write: true,
      });
      expect(next.data.issueInfo).toEqual({ issueNumber: '002', inWork: '00' });
      expect(ls(csdb)).toContain('DMC-KENBAIKI-A-10-20-00-00A-040A-D_002-00_JA-JP.XML');
    });

    it('違反を残したまま書いた DM を、apply_fixes（path・write: true）でその場で直し、verify で違反 0 を確かめる', async () => {
      const wrote = await stack.call('build_data_module', {
        draft: descriptDraft({ sourceId: 'topic-fix-in-place', securityClassification: '09' }),
        allocation: allocation({ ledger }),
        csdbDirs: [csdb],
        write: true,
      });
      expect(wrote.data.written).toHaveLength(1); // BREX 違反は書き込みを止めない（止めるのは schema-invalid）
      const path = wrote.data.written[0] as string;
      const before = await stack.call('verify_data_module', { path, csdbDirs: [csdb] });
      expect(before.data.verification.brex).toMatchObject({
        state: 'violations',
        violationCount: 1,
      });

      const fix = fixOf(wrote.data, 'KB-00003');
      const cand = fix.candidates.find((c: any) => c.value === '03');
      const fixed = await stack.call('apply_fixes', {
        path,
        csdbDirs: [csdb],
        selections: [selectionOf(fix, cand)],
        write: true,
      });
      expect(fixed.data.written).toEqual([path]);
      expect(readFileSync(path, 'utf8')).toContain('securityClassification="03"');

      const after = await stack.call('verify_data_module', { path, csdbDirs: [csdb] });
      expect(after.data.verification.schema.state).toBe('valid');
      expect(after.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });
    });
  });
});
