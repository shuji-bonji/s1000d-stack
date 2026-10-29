/**
 * シナリオ 5: 一致
 *
 * 同じ DM を別々のサーバーに通して、同じ結果になることを確かめる。
 *   - brex check_against_brex と verify verify_data_module の BREX の違反（件数・規則 ID）
 *   - writer が返す verification と、書いたファイルを verify に通した結果（schema.state・brex.violationCount ほか）
 *   - writer が書いたものを、すでに動いている verify と reader が見られること（索引の鮮度）
 */
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SPEC_MODE, startStack, type Stack } from '../src/harness.js';
import {
  allocation,
  cleanupTmp,
  convertArgs,
  csdbDirsFor,
  descriptDraft,
  newCsdb,
} from '../src/helpers.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

let stack: Stack;

beforeAll(async () => {
  stack = await startStack();
});
afterAll(async () => {
  await stack?.close();
  cleanupTmp();
});

/** brex の check_against_brex の応答から、違反の規則 ID を層をまたいで集める */
const brexRuleIds = (data: any): string[] =>
  data.layers.flatMap((l: any) => l.violations.map((v: any) => v.ruleId)).sort();
/** verify の verify_data_module の応答（詳細）から、違反の規則 ID を集める */
const verifyRuleIds = (data: any): string[] =>
  data.brex.layers.flatMap((l: any) => l.violations.map((v: any) => v.ruleId)).sort();
/** 比べる項目だけを取り出す */
const summary = (v: any) => ({
  schema: v.schema.state,
  brex: v.brex.state,
  violationCount: v.brex.violationCount,
  references: v.references.state,
});

describe('シナリオ 5: brex と verify の BREX 判定が一致する', () => {
  const csdb = newCsdb('s5a');
  let cleanPath: string;
  let dirtyPath: string;
  let cleanBuild: any;
  let dirtyBuild: any;

  beforeAll(async () => {
    const common = { csdbDirs: csdbDirsFor(csdb), write: true };
    cleanBuild = (
      await stack.call('build_data_module', {
        ...common,
        draft: descriptDraft(),
        allocation: allocation(),
      })
    ).data;
    cleanPath = cleanBuild.written[0];
    if (!SPEC_MODE) {
      // BREX 違反を 2 件残す: 責任企業 K0001（KB-00001）と機密区分 09（KB-00003）。maxFixRounds: 0 で自動修正を止める
      dirtyBuild = (
        await stack.call('build_data_module', {
          ...common,
          draft: descriptDraft({
            sourceId: 'topic-dirty',
            responsiblePartnerCompany: 'K0001',
            securityClassification: '09',
          }),
          allocation: allocation({ ledger: cleanBuild.ledger }),
          maxFixRounds: 0,
        })
      ).data;
      dirtyPath = dirtyBuild.written[0];
    }
  });

  it('違反のない DM: どちらも違反 0 で、層（BREX の連鎖）も同じ', async () => {
    const dirs = csdbDirsFor(csdb);
    const b = await stack.call('check_against_brex', { path: cleanPath, csdbDirs: dirs });
    const v = await stack.call('verify_data_module', { path: cleanPath, csdbDirs: dirs });
    expect(b.isError).toBe(false);
    expect(v.isError).toBe(false);
    expect(b.data.passed).toBe(true);
    expect(brexRuleIds(b.data)).toEqual([]);
    expect(v.data.verification.brex.violationCount).toBe(0);
    expect(v.data.verification.brex.layers).toBe(b.data.layers.length);
    expect(b.data.layers.length).toBe(SPEC_MODE ? 1 : 2); // 自作は KENBAIKI → KBWORKS の 2 層、spec は既定 BREX だけ
  });

  it.skipIf(SPEC_MODE)('違反のある DM: 件数・規則 ID・層ごとの件数が一致する', async () => {
    const dirs = csdbDirsFor(csdb);
    const b = await stack.call('check_against_brex', { path: dirtyPath, csdbDirs: dirs });
    const v = await stack.call('verify_data_module', { path: dirtyPath, csdbDirs: dirs });
    const total = b.data.layers.reduce((n: number, l: any) => n + l.violationCount, 0);
    expect(total).toBe(2);
    expect(v.data.verification.brex.violationCount).toBe(total);
    expect(b.data.passed).toBe(false);
    expect(brexRuleIds(b.data)).toEqual(['KB-00001', 'KB-00003']);
    expect(verifyRuleIds(v.data)).toEqual(brexRuleIds(b.data));
    // 層ごと（プロジェクト → 組織）の件数も同じ
    expect(v.data.brex.layers.map((l: any) => l.violationCount)).toEqual(
      b.data.layers.map((l: any) => l.violationCount),
    );
    // xml で渡しても同じ（path と xml で判定が変わらない）
    const byXml = await stack.call('check_against_brex', { xml: dirtyBuild.xml, csdbDirs: dirs });
    expect(brexRuleIds(byXml.data)).toEqual(brexRuleIds(b.data));
  });
});

describe('シナリオ 5: writer の verification と、書いたファイルを verify に通した結果が一致する', () => {
  // verify と reader は CSDB の索引を最初の呼び出しで作って持ち続ける（下の「索引の鮮度」を参照）。
  // ここは一致だけを見たいので、テストごとに新しい CSDB を使い、書いたあとに初めて verify が読むようにする
  it('build_data_module（違反なし）', async () => {
    const csdb = newCsdb('s5b1');
    const dirs = csdbDirsFor(csdb);
    const built = (
      await stack.call('build_data_module', {
        draft: descriptDraft(),
        allocation: allocation(),
        csdbDirs: dirs,
        write: true,
      })
    ).data;
    const v = (await stack.call('verify_data_module', { path: built.written[0], csdbDirs: dirs }))
      .data;
    expect(summary(v.verification)).toEqual(summary(built.verification));
    expect(summary(built.verification)).toEqual({
      schema: 'valid',
      brex: 'passed',
      violationCount: 0,
      references: 'resolved',
    });
  });

  it.skipIf(SPEC_MODE)('build_data_module（BREX 違反が残る）', async () => {
    const csdb = newCsdb('s5b2');
    const dirs = csdbDirsFor(csdb);
    const built = (
      await stack.call('build_data_module', {
        draft: descriptDraft({ sourceId: 'topic-dirty', securityClassification: '09' }),
        allocation: allocation(),
        csdbDirs: dirs,
        write: true,
      })
    ).data;
    expect(built.verification.brex.violationCount).toBe(1);
    const v = (await stack.call('verify_data_module', { path: built.written[0], csdbDirs: dirs }))
      .data;
    expect(summary(v.verification)).toEqual(summary(built.verification));
  });

  it('convert_manual: 書いた DM 9 件と PM 1 件のどれも、verify に通した結果が writer の verification と同じ', async () => {
    const csdb = newCsdb('s5b3');
    const dirs = csdbDirsFor(csdb);
    const conv = (await stack.call('convert_manual', convertArgs(csdb, { write: true }))).data;
    expect(conv.summary.written).toBe(10);
    const rows: any[] = [...conv.dataModules, conv.publicationModule];
    expect(rows).toHaveLength(10);
    for (const row of rows) {
      const path = join(csdb, row.fileName);
      const v = (await stack.call('verify_data_module', { path, csdbDirs: dirs })).data;
      expect(summary(v.verification), row.fileName).toEqual(summary(row.verification));
    }
  });

  it('create_comment: 書いた comment を verify に通した結果が writer の verification と同じ', async () => {
    const csdb = newCsdb('s5b4');
    const dirs = csdbDirsFor(csdb);
    const built = (
      await stack.call('create_comment', {
        refs: [{ kind: 'dmRef', code: 'KENBAIKI-A-10-20-00-00A-040A-D' }],
        commentType: 'q',
        commentPriorityCode: 'cp01',
        title: '確認',
        paragraphs: ['一致の確認用'],
        originator: {
          enterpriseName: 'Kenbaiki Works',
          address: { city: 'Tokyo', country: 'Japan' },
        },
        senderIdent: 'K0001',
        modelIdentCode: 'KENBAIKI',
        securityClassification: '01',
        language: { languageIsoCode: 'ja', countryIsoCode: 'JP' },
        brexDmRef: allocation().brexDmRef,
        issueDate: '2026-10-28',
        yearOfDataIssue: 2026,
        csdbDirs: dirs,
        write: true,
      })
    ).data;
    const v = (await stack.call('verify_data_module', { path: built.written[0], csdbDirs: dirs }))
      .data;
    expect(summary(v.verification)).toEqual(summary(built.verification));
  });
});

/**
 * 長く動くサーバーの前提: 先に writer が書いたものを、すでに CSDB を一度読んだ verify と reader が見られること。
 * Skill はどれも「writer で書く → verify / reader で確かめる」を同じ csdbDirs で繰り返す。
 * verify と reader は CSDB の索引をフォルダーの組み合わせごとに 1 回だけ作って持ち続ける
 * （services/context.ts の csdbIndex。clearCaches は「テスト用」）ので、あとから増えたファイルが見えない疑いがある。
 */
describe('シナリオ 5: 索引の鮮度（writer が後から書いたものを、動いている verify と reader が見られる）', () => {
  it('reader list_data_modules は、先に一覧を取った後に writer が書いた DM を返す', async () => {
    const dirs = csdbDirsFor(newCsdb('s5c1'));
    const first = await stack.call('list_data_modules', { csdbDirs: dirs });
    const countBefore = first.data.page.total;
    const w = await stack.call('build_data_module', {
      draft: descriptDraft(),
      allocation: allocation(),
      csdbDirs: dirs,
      write: true,
    });
    expect(w.data.written).toHaveLength(1);
    const second = await stack.call('list_data_modules', { csdbDirs: dirs });
    expect(second.data.objects.map((o: any) => o.dmc)).toContain(w.data.dmCode);
    expect(second.data.page.total).toBe(countBefore + 1);
  });

  it('verify verify_csdb は、先に一度検証した後に writer が書いた DM も数える', async () => {
    const dirs = csdbDirsFor(newCsdb('s5c2'));
    const first = await stack.call('verify_csdb', { csdbDirs: dirs });
    const before = first.data.totals.objects;
    const w = await stack.call('build_data_module', {
      draft: descriptDraft(),
      allocation: allocation(),
      csdbDirs: dirs,
      write: true,
    });
    expect(w.data.written).toHaveLength(1);
    const second = await stack.call('verify_csdb', { csdbDirs: dirs });
    expect(second.data.totals.objects).toBe(before + 1);
  });

  it('verify check_references は、先に索引を作った後に writer が書いた DM への dmRef を解決する', async () => {
    const dirs = csdbDirsFor(newCsdb('s5c3'));
    const TARGET = 'KENBAIKI-A-10-20-00-00A-040A-D';
    // 参照する DM（まだ書かない）。DMC は参照先と重ならないよう、台帳で分解コードを進める
    const referrer = await stack.call('build_data_module', {
      draft: descriptDraft({
        sourceId: 'topic-referrer',
        body: [
          {
            kind: 'para',
            text: '詳しくは次を見る。',
            refs: [{ kind: 'dmRef', target: TARGET, title: '参照先' }],
          },
        ],
      }),
      allocation: allocation({ ledger: { 'topic-overview': TARGET } }),
      csdbDirs: dirs,
    });
    expect(referrer.data.dmCode).not.toBe(TARGET);
    // 参照先がまだ無い状態で一度検証して、verify に索引を作らせる
    const before = await stack.call('check_references', { xml: referrer.data.xml, csdbDirs: dirs });
    expect(before.data.references.unresolvedCount).toBe(1);
    // 参照先を書く
    const target = await stack.call('build_data_module', {
      draft: descriptDraft(),
      allocation: allocation(),
      csdbDirs: dirs,
      write: true,
    });
    expect(target.data.written).toHaveLength(1);
    expect(target.data.dmCode).toBe(TARGET);
    const after = await stack.call('check_references', { xml: referrer.data.xml, csdbDirs: dirs });
    expect(after.data.references.unresolvedCount).toBe(0);
  });
});

/**
 * allocation.brexDmRef を省いたとき（Skill の references/allocation.md は「省略すると、S1000D_SPEC_DIR にある既定 BREX」とする）。
 */
describe('シナリオ 5: allocation.brexDmRef を省いたとき', () => {
  const withoutBrexRef = () => {
    const a = allocation();
    delete a.brexDmRef;
    return a;
  };

  it.skipIf(!SPEC_MODE)(
    'S1000D_SPEC_DIR に既定 BREX があれば、それが brexDmRef に入り、BREX が評価される',
    async () => {
      const r = await stack.call('build_data_module', {
        draft: descriptDraft(),
        allocation: withoutBrexRef(),
        csdbDirs: csdbDirsFor(newCsdb('s5d1')),
      });
      expect(r.data.xml).toContain('modelIdentCode="S1000D" systemDiffCode="J"');
      expect(r.data.xml).toContain('infoCode="022"');
      expect(r.data.verification.brex.layers).toBe(1);
      expect(r.data.verification.brex.state).toBe('passed');
    },
  );

  it.skipIf(SPEC_MODE)(
    '既定 BREX も無いとき、brexDmRef は書かれず、BREX を 1 層も評価していないのに brex.state: passed とは言わない',
    async () => {
      const r = await stack.call('build_data_module', {
        draft: descriptDraft(),
        allocation: withoutBrexRef(),
        csdbDirs: csdbDirsFor(newCsdb('s5d2')),
      });
      expect(r.isError).toBe(false);
      expect(r.data.xml).not.toContain('<brexDmRef>'); // 注記に「brexDmRef element was omitted」とある
      expect(r.data._notes.join('\n')).toContain('brexDmRef element was omitted');
      // 評価した層が 0 なら、passed（機械で検査できるルールに違反なし）とは言えないはず
      const brex = r.data.verification.brex;
      expect({ layers: brex.layers, passed: brex.state === 'passed' }).not.toEqual({
        layers: 0,
        passed: true,
      });
    },
  );
});
