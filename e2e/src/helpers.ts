/**
 * テストの共通部品: 一時 CSDB、採番の規則、下書き、モードごとの BREX の参照。
 * 既定モードは自作の BREX 2 層（fixtures/csdb-base）、spec モードは本物の既定 BREX を brexDmRef にする。
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { FIXTURES, SPEC_MODE, specDir } from './harness.js';

// ---------------------------------------------------------------------------
// 一時フォルダー
// ---------------------------------------------------------------------------

const tmpDirs: string[] = [];

/** 一時フォルダーを作る。afterAll で cleanupTmp() を呼ぶと消す（E2E_KEEP_TMP=1 なら残す） */
export function tmp(prefix = 'e2e'): string {
  const d = mkdtempSync(join(tmpdir(), `s1000d-${prefix}-`));
  tmpDirs.push(d);
  return d;
}

export function cleanupTmp(): void {
  if (process.env.E2E_KEEP_TMP === '1') {
    process.stderr.write(`[e2e] 一時フォルダーを残した:\n${tmpDirs.join('\n')}\n`);
    return;
  }
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// BREX と CSDB の雛形
// ---------------------------------------------------------------------------

export interface DmCodeParts {
  modelIdentCode: string;
  systemDiffCode: string;
  systemCode: string;
  subSystemCode: string;
  subSubSystemCode: string;
  assyCode: string;
  disassyCode: string;
  disassyCodeVariant: string;
  infoCode: string;
  infoCodeVariant: string;
  itemLocationCode: string;
}

/** 自作のプロジェクト BREX（fixtures/csdb-base）の DMC */
export const OWN_BREX: DmCodeParts = {
  modelIdentCode: 'KENBAIKI',
  systemDiffCode: 'A',
  systemCode: '00',
  subSystemCode: '0',
  subSubSystemCode: '0',
  assyCode: '00',
  disassyCode: '00',
  disassyCodeVariant: 'A',
  infoCode: '022',
  infoCodeVariant: 'A',
  itemLocationCode: 'D',
};

/** ファイル名 DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML から DMC の部品を読む */
export function dmcPartsOf(fileName: string): DmCodeParts | undefined {
  const m =
    /^DMC-([A-Z0-9]{2,14})-([A-Z0-9]{1,4})-([A-Z0-9]{2,3})-([A-Z0-9])([A-Z0-9])-([A-Z0-9]{2,4})-([A-Z0-9]{2})([A-Z0-9]{1,3})-([A-Z0-9]{3})([A-Z0-9])-([A-Z0-9])_/i.exec(
      fileName,
    );
  if (!m) return undefined;
  return {
    modelIdentCode: m[1],
    systemDiffCode: m[2],
    systemCode: m[3],
    subSystemCode: m[4],
    subSubSystemCode: m[5],
    assyCode: m[6],
    disassyCode: m[7],
    disassyCodeVariant: m[8],
    infoCode: m[9],
    infoCodeVariant: m[10],
    itemLocationCode: m[11],
  };
}

function walk(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, found);
    else found.push(p);
  }
  return found;
}

/** spec モードの既定 BREX（S1000D の 04-10-0301-00A-022A-D）のパス */
export function findDefaultBrexFile(): string | undefined {
  return walk(specDir()).find((p) =>
    /\/DMC-S1000D-[A-Z0-9]+-04-10-0301-00A-022A-D_[^/]*\.XML$/i.test(p),
  );
}

/** このモードで DM が参照する BREX の DMC。既定モードは自作の KENBAIKI、spec モードは既定 BREX */
export function brexDmRef(): DmCodeParts {
  if (!SPEC_MODE) return OWN_BREX;
  const f = findDefaultBrexFile();
  const parts = f ? dmcPartsOf(f.split('/').pop()!) : undefined;
  if (!parts) throw new Error(`既定 BREX が ${specDir()} の下に見つからない`);
  return parts;
}

/** 空の CSDB を作る。既定モードは自作の BREX 2 層を置く。spec モードは空（既定 BREX は S1000D_SPEC_DIR の下にある） */
export function newCsdb(prefix = 'csdb'): string {
  const dir = tmp(prefix);
  if (!SPEC_MODE) cpSync(join(FIXTURES, 'csdb-base'), dir, { recursive: true });
  return dir;
}

/** 書き込み先の CSDB と、BREX を探すフォルダー。spec モードは既定 BREX のフォルダーも加える */
export function csdbDirsFor(csdb: string): string[] {
  if (!SPEC_MODE) return [csdb];
  const f = findDefaultBrexFile();
  return f ? [csdb, dirname(f)] : [csdb];
}

// ---------------------------------------------------------------------------
// 採番の規則・下書き
// ---------------------------------------------------------------------------

/** 採番の規則。情報コードの値はこのプロジェクトの試作用で、意味を持たせていない */
export function allocation(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    modelIdentCode: 'KENBAIKI',
    systemDiffCode: 'A',
    rules: {
      sns: { systemCode: '10', subSystemCode: '2', subSubSystemCode: '0', assyCode: '00' },
      infoCodeByKind: {
        descript: { infoCode: '040', infoCodeVariant: 'A' },
        proced: { infoCode: '520', infoCodeVariant: 'A' },
        process: { infoCode: '130', infoCodeVariant: 'A' },
        fault: { infoCode: '411', infoCodeVariant: 'A' },
      },
      itemLocationCode: 'D',
    },
    icn: { cageCode: 'K0001', next: 1 },
    brexDmRef: brexDmRef(),
    ...over,
  };
}

export const JA = { languageIsoCode: 'ja', countryIsoCode: 'JP' };
export const EN_US = { languageIsoCode: 'en', countryIsoCode: 'US' };

/** 自作 BREX が責任企業に要求する本社コード（KB-00001）。違反させたいときは K0001 を渡す */
export const HQ = 'K0002';

/** 説明 DM の下書き。既定は自作 BREX に違反しない値 */
export function descriptDraft(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    sourceId: 'topic-overview',
    kind: 'descript',
    language: JA,
    title: { techName: '指定席券売機', infoName: '説明' },
    securityClassification: '01',
    responsiblePartnerCompany: HQ,
    originator: HQ,
    applic: { displayText: 'すべて' },
    issueDate: '2026-10-28',
    body: [
      { kind: 'para', text: '指定席券売機は、きっぷの購入と予約の受け取りができる機械である。' },
      {
        kind: 'section',
        children: [{ kind: 'para', text: '初期画面には 2 つのボタンがある。' }],
      },
    ],
    ...over,
  };
}

/** 手順 DM の下書き。1 つ目の手順が説明 DM への参照（dmRef）を持つので、抽出した文に {1} が付く */
export function procedDraft(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    sourceId: 'procedure-open-door',
    kind: 'proced',
    language: JA,
    title: { techName: '指定席券売機', infoName: '前面扉を開ける' },
    securityClassification: '01',
    responsiblePartnerCompany: HQ,
    originator: HQ,
    applic: { displayText: 'すべて' },
    issueDate: '2026-10-28',
    body: [
      { kind: 'requirements', children: [{ kind: 'para', text: '電源が入っていること' }] },
      {
        kind: 'step',
        title: '扉を開ける',
        text: '保守鍵で前面扉を開ける。詳しくは次を見る。',
        refs: [{ kind: 'dmRef', target: 'KENBAIKI-A-10-20-00-00A-040A-D', title: '指定席券売機' }],
        children: [
          {
            kind: 'admonition',
            level: 'caution',
            children: [{ kind: 'para', text: '手を挟まないように注意する。' }],
          },
          { kind: 'step', text: '鍵を右に回す。' },
          { kind: 'step', text: '取っ手を引く。' },
        ],
      },
      { kind: 'requirements', children: [{ kind: 'para', text: '扉が閉まっていること' }] },
    ],
    ...over,
  };
}

// ---------------------------------------------------------------------------
// 体験型マニュアル
// ---------------------------------------------------------------------------

export const MANUAL_PATH = join(FIXTURES, 'manual', 'kenbaiki.manual.json');

/** マニュアルの素材（Asset.source.path）の代わりの小さなファイルを置いたフォルダーを作る */
export function dummyAssets(): string {
  const dir = tmp('assets');
  const manual = JSON.parse(readFileSync(MANUAL_PATH, 'utf8')) as {
    assets: { id: string; source: { path: string } }[];
  };
  for (const a of manual.assets) {
    const p = join(dir, a.source.path);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, `dummy ${a.id}`);
  }
  return dir;
}

/** convert_manual の引数。情報コードの値は試作用 */
export function convertArgs(
  csdb: string,
  over: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    manualPath: MANUAL_PATH,
    allocation: allocation(),
    securityClassification: '01',
    responsiblePartnerCompany: HQ,
    assetBaseDir: dummyAssets(),
    csdbDirs: csdbDirsFor(csdb),
    ...over,
  };
}

/** fixtures/dml の DML を CSDB に置く（置いたパスを返す） */
export function placeDml(csdb: string): string {
  const name = 'DML-KENBAIKI-K0001-S-2026-00001_001-00.XML';
  const to = join(csdb, name);
  copyFileSync(join(FIXTURES, 'dml', name), to);
  return to;
}

/** 一覧: DMC- で始まる DM のファイル名 */
export function dmFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => /^DMC-/.test(f))
    .sort();
}
