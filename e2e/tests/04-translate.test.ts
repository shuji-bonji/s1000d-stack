/**
 * シナリオ 4: 翻訳（Skill: s1000d-translate）
 *
 * writer extract_segments → 全文に "[EN] " を付けた訳（プレースホルダーは保つ）で apply_segments（en-US）→
 * write: true で _EN-US.XML ができる（DMC は同じ）→ reader で読むと訳文 →
 * プレースホルダーを欠いた文は unapplied（placeholder-mismatch）→
 * 元の DM の構造が変わっていると skeleton-mismatch。
 * 翻訳の質は見ない（xcomet・DeepL は使わない）。LLM の代わりに機械的な訳を使うだけ。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SPEC_MODE, startStack, ls, type Stack } from '../src/harness.js';
import {
  allocation,
  cleanupTmp,
  csdbDirsFor,
  descriptDraft,
  EN_US,
  newCsdb,
  procedDraft,
} from '../src/helpers.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

let stack: Stack;
const csdb = newCsdb('s4');
const SRC_NAME = 'DMC-KENBAIKI-A-10-20-00-00A-520A-D_001-00_JA-JP.XML';
const EN_NAME = 'DMC-KENBAIKI-A-10-20-00-00A-520A-D_001-00_EN-US.XML';
const srcPath = () => join(csdb, SRC_NAME);
const enPath = () => join(csdb, EN_NAME);

let extracted: any; // extract_segments の応答
let ledger: Record<string, string>;
let icnNext: number;

/** 訳の代わり: 全文に "[EN] " を付ける（{n} と {{ }} はそのまま） */
const translate = (segments: { id: string; text: string }[]) =>
  segments.map((s) => ({ id: s.id, text: `[EN] ${s.text}` }));

const applyArgs = (segments: unknown[], over: Record<string, unknown> = {}) => ({
  path: srcPath(),
  skeletonHash: extracted.skeletonHash,
  segments,
  language: EN_US,
  csdbDirs: csdbDirsFor(csdb),
  ...over,
});

beforeAll(async () => {
  stack = await startStack();
  // 参照先の説明 DM と、それを参照する手順 DM を CSDB に書く（手順の文に {1} が付く）
  const common = { csdbDirs: csdbDirsFor(csdb), write: true };
  const d = await stack.call('build_data_module', {
    ...common,
    draft: descriptDraft({ issueInfo: { issueNumber: '001', inWork: '00' } }),
    allocation: allocation(),
  });
  expect(d.data.written, '準備: 説明 DM').toHaveLength(1);
  const p = await stack.call('build_data_module', {
    ...common,
    draft: procedDraft({ issueInfo: { issueNumber: '001', inWork: '00' } }),
    allocation: allocation({
      ledger: d.data.ledger,
      icn: { cageCode: 'K0001', next: d.data.icnNext },
    }),
  });
  expect(p.data.written, '準備: 手順 DM').toEqual([srcPath()]);
  ledger = p.data.ledger;
  icnNext = p.data.icnNext;
});
afterAll(async () => {
  await stack?.close();
  cleanupTmp();
});

describe('シナリオ 4: 翻訳', () => {
  it('extract_segments は人が読む文だけを、プレースホルダー {n} 付きで取り出し、skeletonHash を返す', async () => {
    const r = await stack.call('extract_segments', { path: srcPath() });
    expect(r.isError).toBe(false);
    extracted = r.data;
    expect(r.data.dmCode).toBe('KENBAIKI-A-10-20-00-00A-520A-D');
    expect(r.data.language).toEqual({ languageIsoCode: 'ja', countryIsoCode: 'JP' });
    expect(r.data.skeletonHash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.data.counts.total).toBe(r.data.segments.length);
    const ids = r.data.segments.map((s: any) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    // dmRef を持つ手順の文は {1} を持つ。元の文の末尾に {1} が付く
    const withPh = r.data.segments.filter((s: any) => s.placeholders?.length);
    expect(withPh.length).toBeGreaterThanOrEqual(1);
    expect(withPh[0].text).toContain('{1}');
    expect(withPh[0].placeholders[0]).toMatchObject({ index: 1, element: 'dmRef' });
    expect(r.data.counts.step).toBeGreaterThanOrEqual(3);
    expect(r.data.counts.admonition).toBeGreaterThanOrEqual(1);
  });

  it('全文を訳して apply_segments（write: false）。DMC は同じで言語だけ en-US になり、検証される', async () => {
    const before = ls(csdb);
    const r = await stack.call('apply_segments', applyArgs(translate(extracted.segments)));
    expect(r.isError).toBe(false);
    expect(r.data.error).toBeUndefined();
    expect(r.data.applied).toBe(extracted.segments.length);
    expect(r.data.unapplied).toEqual([]);
    expect(r.data.fileName).toBe(EN_NAME);
    expect(r.data.xml).toContain('languageIsoCode="en" countryIsoCode="US"');
    expect(r.data.xml).toContain('[EN] 保守鍵で前面扉を開ける');
    expect(r.data.verification.schema.state).toBe('valid');
    expect(r.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });
    expect(r.data.written).toEqual([]);
    expect(ls(csdb)).toEqual(before);
  });

  it('write: true で _EN-US.XML ができる。DMC は同じで、reader で読むと訳文になっている', async () => {
    const r = await stack.call(
      'apply_segments',
      applyArgs(translate(extracted.segments), { write: true }),
    );
    expect(r.data.written).toEqual([enPath()]);
    expect(existsSync(enPath())).toBe(true);
    expect(existsSync(srcPath())).toBe(true); // 元の日本語版は残る
    expect(readFileSync(enPath(), 'utf8')).toBe(r.data.xml);

    // reader: 言語は en-US、題名と本文は訳文
    const read = await stack.call('read_data_module', {
      path: enPath(),
      csdbDirs: csdbDirsFor(csdb),
      section: 'all',
    });
    expect(read.isError).toBe(false);
    expect(read.data.identAndStatus.language).toEqual({
      languageIsoCode: 'en',
      countryIsoCode: 'US',
    });
    expect(read.data.identAndStatus.techName).toBe('[EN] 指定席券売機');
    expect(read.data.identAndStatus.infoName).toBe('[EN] 前面扉を開ける');
    expect(read.data.target.dmCode).toEqual(
      (await stack.call('read_data_module', { path: srcPath(), section: 'identAndStatus' })).data
        .target.dmCode,
    );
    const body = JSON.stringify(read.data.content);
    expect(body).toContain('[EN] 鍵を右に回す。');
    expect(body).toContain('[EN] 手を挟まないように注意する。');

    // Skill は outline で「訳先の言語になっている」ことを見せるとしているが、outline の応答に language は無い
    // （target は dmCode・issueInfo・schemaName だけ）。見出しと最初の文の訳は outline で読める。言語は identAndStatus で読む
    const outline = await stack.call('read_data_module', {
      path: enPath(),
      csdbDirs: csdbDirsFor(csdb),
      section: 'outline',
    });
    expect(outline.data.target.language).toBeUndefined();
    const step = outline.data.content.outline.find((n: any) => n.kind === 'step');
    expect(step.title).toBe('[EN] 扉を開ける');

    // 書いたファイルを verify が確かめる。DMC が同じなので、日本語版と並んで CSDB に置ける
    const v = await stack.call('verify_data_module', {
      path: enPath(),
      csdbDirs: csdbDirsFor(csdb),
    });
    expect(v.data.verification.schema.state).toBe('valid');
    expect(v.data.verification.brex).toMatchObject({ state: 'passed', violationCount: 0 });
    expect(v.data.verification.references.state).toBe('resolved');
    const list = await stack.call('list_data_modules', {
      csdbDirs: [csdb],
      filter: { infoCode: '520' },
    });
    expect(
      list.data.objects
        .map((o: any) => `${o.dmc}/${o.language.languageIsoCode}-${o.language.countryIsoCode}`)
        .sort(),
    ).toEqual(['KENBAIKI-A-10-20-00-00A-520A-D/en-US', 'KENBAIKI-A-10-20-00-00A-520A-D/ja-JP']);
  });

  it('同じ名前の訳をもう一度 write: true で書くと write-conflict。overwrite: true で上書きできる', async () => {
    const again = await stack.call(
      'apply_segments',
      applyArgs(translate(extracted.segments), { write: true }),
    );
    expect(again.data.written).toEqual([]);
    expect(again.data.writeSkipped.reason).toBe('write-conflict');
    const over = await stack.call(
      'apply_segments',
      applyArgs(
        extracted.segments.map((s: any) => ({ id: s.id, text: `[EN2] ${s.text}` })),
        { write: true, overwrite: true },
      ),
    );
    expect(over.data.written).toEqual([enPath()]);
    expect(readFileSync(enPath(), 'utf8')).toContain('[EN2] 鍵を右に回す。');
  });

  it('プレースホルダー {1} を欠いた文・増やした文・未知の id は unapplied になり、その文は元の言語のまま残る', async () => {
    const withPh = extracted.segments.find((s: any) => s.placeholders?.length);
    const other = extracted.segments.find((s: any) => s.text === '鍵を右に回す。');
    const segments = translate(extracted.segments).map((s) => {
      if (s.id === withPh.id) return { id: s.id, text: '[EN] Open the front door with the key.' }; // {1} を落とした
      if (s.id === other.id) return { id: s.id, text: `[EN] ${other.text} {1}` }; // {1} を増やした
      return s;
    });
    segments.push({ id: 'no-such-segment', text: 'x' });
    const r = await stack.call('apply_segments', applyArgs(segments));
    expect(r.isError).toBe(false);
    const bad = Object.fromEntries(r.data.unapplied.map((u: any) => [u.id, u.reason]));
    expect(bad).toEqual({
      [withPh.id]: 'placeholder-mismatch',
      [other.id]: 'placeholder-mismatch',
      'no-such-segment': 'unknown-id',
    });
    expect(r.data.applied).toBe(extracted.segments.length - 2);
    // 適用されなかった文は元の日本語のまま
    expect(r.data.xml).toContain(withPh.text.replace('{1}', '').trim());
    expect(r.data.xml).not.toContain('Open the front door with the key.');
    expect(r.data.xml).toContain(other.text); // {1} を増やした文も、元の日本語のまま
    expect(r.data.xml).not.toContain(`[EN] ${other.text} {1}`);
    expect(r.data.xml).toContain('[EN] 取っ手を引く。'); // 他の文は訳が入る
  });

  it('元の DM の構造が変わっていると skeleton-mismatch で止まる（isError ではなく error.code）。書かない', async () => {
    // 文を変えるのではなく構造を変える: 同じ DM（同じ sourceId・版）に段落を 1 つ足した XML を writer に作らせる
    const changed = await stack.call('build_data_module', {
      draft: procedDraft({
        issueInfo: { issueNumber: '001', inWork: '00' },
        body: [
          ...(procedDraft().body as unknown[]),
          // 手順の後ろに表を 1 つ足す
          {
            kind: 'table',
            title: '部品',
            rows: [
              ['部品', '数'],
              ['保守鍵', '1'],
            ],
          },
        ],
      }),
      allocation: allocation({ ledger, icn: { cageCode: 'K0001', next: icnNext } }),
      csdbDirs: csdbDirsFor(csdb),
    });
    // 準備: 構造が変わった XML ができている（同じ DMC・同じ版）
    // proced に表を置けない場合は input-error になるので、そのときは段落を足す別の DM に替える
    expect(changed.data.error, JSON.stringify(changed.data.error)).toBeUndefined();
    expect(changed.data.fileName).toBe(SRC_NAME);

    const before = ls(csdb);
    const r = await stack.call('apply_segments', {
      xml: changed.data.xml,
      skeletonHash: extracted.skeletonHash, // 取り出したときのハッシュ（古い）
      segments: translate(extracted.segments),
      language: EN_US,
      csdbDirs: csdbDirsFor(csdb),
      write: true,
      overwrite: true,
    });
    expect(r.isError).toBe(false);
    expect(r.data.error.code).toBe('skeleton-mismatch');
    expect(r.data.error.expected).toBe(extracted.skeletonHash);
    expect(r.data.error.actual).toMatch(/^[0-9a-f]{64}$/);
    expect(r.data.error.actual).not.toBe(extracted.skeletonHash);
    expect(r.data.xml).toBeUndefined();
    expect(r.data.written ?? []).toEqual([]);
    expect(ls(csdb)).toEqual(before); // write: true でも何も書かない

    // Skill の手順どおり: 古いハッシュで再試行せず、取り出し直す。新しいハッシュなら適用できる
    const again = await stack.call('extract_segments', { xml: changed.data.xml });
    expect(again.data.skeletonHash).toBe(r.data.error.actual);
    const ok = await stack.call('apply_segments', {
      xml: changed.data.xml,
      skeletonHash: again.data.skeletonHash,
      segments: translate(again.data.segments),
      language: EN_US,
      csdbDirs: csdbDirsFor(csdb),
    });
    expect(ok.data.error).toBeUndefined();
    expect(ok.data.unapplied).toEqual([]);
    expect(ok.data.applied).toBe(again.data.segments.length);
  });
});

describe('シナリオ 4: 国コードの BREX（既定モードのみ）', () => {
  it.skipIf(SPEC_MODE)(
    '組織の BREX（KBW-00002）は国コードを JP と US に限る。fr-FR の訳は BREX 違反として返る',
    async () => {
      const r = await stack.call(
        'apply_segments',
        applyArgs(translate(extracted.segments), {
          language: { languageIsoCode: 'fr', countryIsoCode: 'FR' },
        }),
      );
      expect(r.data.verification.brex.state).toBe('violations');
      expect(r.data.verification.brex.violationCount).toBe(1);
      const fix = r.data.fixes.find((f: any) => String(f.source).endsWith('KBW-00002'));
      expect(fix.candidates.map((c: any) => c.value).sort()).toEqual(['JP', 'US']);
    },
  );
});
