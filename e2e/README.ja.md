# e2e — MCP サーバー 4 本の連携を、実際に起動して確かめる

[English](./README.md) | **日本語**

`s1000d-brex-mcp`・`s1000d-verify-mcp`・`s1000d-reader-mcp`・`s1000d-writer-mcp` を、stdio のプロセスとして 4 本とも起動し、4 つの Skill（experience-to-s1000d・s1000d-publish・s1000d-review・s1000d-translate）の手順を**機械でなぞって**、サーバーどうしの連携を確かめるテストです。各サーバーの単体テスト（InMemoryTransport）では見えない、次の点を見ます。

- writer が書いたファイルを、別のプロセスの verify と reader が同じように読めるか
- Skill が前提にしている応答の形・値（`fixes[]`、`appliedFixes[]`、`unapplied`、`error.code` など）が、実際の応答と合っているか
- 同じ DM に対する判定が、サーバーが違っても一致するか

> [!IMPORTANT]
> このテストは S1000D への準拠を判定しません。「サーバーが Skill の想定どおりに応答し、サーバー間で判定が一致する」ことだけを確かめます。S1000D® は ASD の登録商標で、このプロジェクトは ASD とは無関係です。仕様書・XSD・公式サンプルの中身はコミットしません（`S1000D_SPEC_TESTS=1` のとき、利用者が入手した配布物を実行時に読むだけです）。

## 実行方法

```sh
npm ci
npm test                 # 既定モード + npm の公開版
npm run test:spec        # S1000D_SPEC_TESTS=1（本物の XSD・既定 BREX）
npm run test:local       # E2E_TARGET=local（手元の作業コピー）
npm run typecheck
```

Node.js 22 以上が要ります。テストは `os.tmpdir()` の下に CSDB を作って書き込み、終わると消します（残すには `E2E_KEEP_TMP=1`）。利用者の `~/.config/s1000d-stack/config.json` と `S1000D_CSDB_DIR` はサーバーに渡しません（`S1000D_CONFIG` を存在しない場所に向けます）。

### 起動するサーバーの選び方（`E2E_TARGET`）

| 値 | 起動するもの |
|---|---|
| `npm`（既定） | `node_modules/@shuji-bonji/s1000d-*-mcp` の bin。`devDependencies` の版（brex ^0.4.0 / verify ^0.6.0 / reader ^0.7.0 / writer ^0.1.1）。CI はこちら |
| `local` | `../mcp/<名前>/dist/index.js`。先に各リポジトリで `npm run build` する |

起動時に、使った対象・モード・各サーバーの版を stderr に 1 行出します（`tests/01-…` の「起動」）。

### 2 つのモード

| モード | 指定 | XSD と BREX |
|---|---|---|
| 既定（CI 向け） | なし | `fixtures/spec/xml_schema_flat/`（自作の最小 XSD）と、`fixtures/csdb-base/` の自作 BREX 2 層。`S1000D_SPEC_DIR` は `fixtures/spec` を指す |
| spec | `S1000D_SPEC_TESTS=1` | Issue 7 の本物の XSD と既定 BREX。`S1000D_SPEC_DIR`（既定 `../specs/s1000d/issue-7`、このリポジトリの `specs/` にある配布物）を読む。シナリオ 2 と、自作 BREX の規則に頼る一部のテストは飛ばす |

spec モードでは、DM の `brexDmRef` が既定 BREX（`S1000D-J-04-10-0301-00A-022A-D`）を指し、そのフォルダーも `csdbDirs` に加えます。

## 自作の BREX（fixtures/csdb-base）

2 層です。どちらも自作で、S1000D の公式サンプルの複製ではありません。

| 層 | 規則 | 使いどころ |
|---|---|---|
| 組織 KBWORKS | KBW-00001 すべての DM は `brexDmRef` を持つ / KBW-00002 国コードは JP か US | 翻訳（en-US）が通り、fr-FR が違反になる |
| プロジェクト KENBAIKI | KB-00001 責任企業は `K0002` だけ（候補 1 つ = `exact`）/ KB-00002 情報コードは 022・040・130・411 と範囲 500~599（単一値 4 つと範囲 = `several`）/ KB-00003 機密区分は 01・02・03（`several`）/ KB-00100 非文脈ルール（手動確認） | `apply_fixes` の候補の照合、レビューの `manualChecks` |

## シナリオ

各 `it` の名前は、確かめることを日本語で書いています。

| ファイル | Skill | 確かめること |
|---|---|---|
| `tests/01-experience-to-s1000d.test.ts` | experience-to-s1000d | `convert_manual`（`write: false` で DM 9・PM 1、全件 valid/passed/resolved → `write: true` で書く）→ `verify_csdb` が全件 valid・違反 0 → reader で一覧と outline → **DML がある CSDB での `reconcile_dml`**（found・issue-mismatch・not-found・notListed）→ reader `list_data_modules`（`include: dml`）の `reconciliation` が verify と同じ件数 |
| `tests/02-publish.test.ts` | s1000d-publish | `build_data_module` で `exact` が `appliedFixes[]` に出る / `several` が `fixes[]` に残る → **`apply_fixes`** に候補の 1 つを渡すと `applied` に入り違反が消える → 候補の外は `candidate-not-offered` → 範囲外は `value-not-allowed` → `write: true` → 2 回目は `write-conflict` → `overwrite: true` → 版を決めなければ次の版 → 違反を残して書いた DM を `apply_fixes`（`path`・`write: true`）でその場で直す。自作 BREX が前提なので既定モードだけ |
| `tests/03-review.test.ts` | s1000d-review | reader outline → `suggest_fixes`（`csdbDirs` なしなら参照はすべて `no-csdb`）→ brex `check_against_brex` の `manualChecks` → **`create_comment`**（`write: true`）で `COM-….XML` → verify で comment が schema valid・BREX passed → `seqNumber` を省くと次の番号 |
| `tests/04-translate.test.ts` | s1000d-translate | `extract_segments` → `[EN] ` を付けた訳で **`apply_segments`**（en-US、`write: true`）→ `_EN-US.XML`・DMC は同じ・reader で訳文 → `write-conflict` と `overwrite` → `placeholder-mismatch`・`unknown-id` → 構造を変えた DM に古い `skeletonHash` で **`skeleton-mismatch`**（書かない）→ 取り出し直せば適用できる |
| `tests/05-consistency.test.ts` | （横断） | brex `check_against_brex` と verify `verify_data_module` の違反（件数・規則 ID・層）が一致 / writer の `verification` と、書いたファイルを verify に通した結果が一致（`build_data_module`・`convert_manual` の全 10 件・`create_comment`）/ **writer が後から書いたものを、動いている verify と reader が見られるか**（索引の鮮度）/ `allocation.brexDmRef` を省いたとき |

## 今の結果と、落ちているテスト

`npm test`（既定・npm）は 43 件中 38 件が通り、4 件が**意図して落ちたまま**です。サーバーの不具合と思われる挙動を、期待値を緩めず、`it.fails` や `it.todo` にもせずに残しています。サーバーが直ったら通ります。

| テスト | 疑い |
|---|---|
| 05「reader list_data_modules は、先に一覧を取った後に writer が書いた DM を返す」 | verify と reader が CSDB の索引をフォルダーの組み合わせごとに 1 回だけ作って持ち続け、あとから増えたファイルが見えない |
| 05「verify verify_csdb は、先に一度検証した後に writer が書いた DM も数える」 | 同上 |
| 05「verify check_references は、先に索引を作った後に writer が書いた DM への dmRef を解決する」 | 同上 |
| 05「既定 BREX も無いとき、brexDmRef は書かれず、BREX を 1 層も評価していないのに brex.state: passed とは言わない」 | `brexDmRef` が無く BREX を 1 層も評価していないのに `brex.state: "passed"`（`layers: 0`） |

詳しい再現手順は、これらのテストの本体に書いてあります。

## 構成

```
e2e/
├── package.json  package-lock.json  tsconfig.json  vitest.config.ts  .prettierrc
├── src/
│   ├── harness.ts     # 4 本を stdio で起動して束ねる。call(tool, args) は JSON を parse して { isError, data, text } を返す
│   └── helpers.ts     # 一時 CSDB、採番の規則、下書き、モードごとの brexDmRef
├── fixtures/          # 自作のデータだけ
│   ├── csdb-base/     # 自作 BREX 2 層（各テストが一時 CSDB にコピーする）
│   ├── dml/           # シナリオ 1 で作る DM を指す DML（1 行は版違い、1 行は存在しない DMC）
│   ├── manual/        # 体験型マニュアルの見本（券売機）
│   └── spec/xml_schema_flat/   # 自作の最小 XSD（識別・状態部と内容部があることだけを確かめる）
└── tests/             # 01〜05
```

テストファイルごとにサーバー 4 本を起動し直し、ファイルは直列に実行します（`vitest.config.ts` の `fileParallelism: false`）。`testTimeout` は 120 秒です。

> [!NOTE]
> verify と reader は、同じ `csdbDirs` に対する索引を最初の呼び出しで作ります。このため、シナリオ 1 は DML を置いてから初めて verify と reader を呼び、シナリオ 5 の一致の確認はテストごとに新しい CSDB を使います。

## CI

`.github/workflows/e2e.yml`（リポジトリルート）が、手動実行と週 1 回（月曜 06:17 JST）に `e2e/` で `npm ci && npm test`（`E2E_TARGET=npm`）を実行します。spec モードと local は、配布物と未公開のビルドが要るので回しません。
