---
title: s1000d-core（ライブラリ）
description: 全 MCP が共有する TypeScript ライブラリ @shuji-bonji/s1000d-core の機能と設計を説明します。
---

`@shuji-bonji/s1000d-core` は、S1000D のデータモジュールを読み、BREX に照合し、組み立てるための TypeScript ライブラリです。`s1000d-brex-mcp` をはじめ、このスタックの MCP サーバーはすべてこのライブラリを使います。S1000D との対応を 1 か所に集め、MCP ごとに別々の解釈をしないためです。

[GitHub](https://github.com/shuji-bonji/s1000d-core) / [npm](https://www.npmjs.com/package/@shuji-bonji/s1000d-core)

```sh
npm install @shuji-bonji/s1000d-core
```

## できること

| 機能 | 関数 |
| --- | --- |
| DMC の分解・組み立て（学習コード付きも可） | `parseDmc` / `formatDmc` / `sameDmc` / `isBrexDmc` |
| DMC のファイル名（発行情報・言語・拡張子）の分解・組み立て | `parseDmcFileName` / `formatDmcFileName` |
| ICN（MIC 基準・CAGE 基準）の分解・組み立て | `parseIcn` / `formatIcn` / `parseIcnFileName` |
| `xsi:noNamespaceSchemaLocation` からスキーマ名と版を推定 | `parseSchemaLocation` |
| 識別・状態部の読み取り | `readDataModuleInfo` / `readIdentAndStatus` / `readDmRef` |
| BREX の読み取りと SNS 検索 | `readBrex` / `allRules` / `lookupSns` |
| BREX への照合（1 層・複数層・連鎖） | `checkAgainstBrexLayer` / `checkAgainstBrexLayers` / `checkAgainstBrexChain` / `resolveBrexChain` |
| フォルダーを CSDB と見なす解決器 | `listDataModules` / `findDataModule` / `createDirectoryBrexResolver` |
| XML の読み取りと XPath の評価 | `XmlEngine` / `defaultXmlEngine` |
| BREX の指定（パス・DMC・省略＝既定 BREX）から 1 つを決める | `locateBrex` / `findDefaultBrex` |
| XSD の探索と検証（実装はサブパス `xsd-libxml2`） | `findSchemaDirs` / `locateXsd` / `SchemaValidator` / `Libxml2SchemaValidator` |
| 参照（`dmRef` / `pmRef` / ICN / `internalRef` / `applicRefId`）の収集と解決 | `collectReferences` / `resolveReferences` / `CsdbIndex` |
| 適用性（ACT・CCT・PCT の読み取り、`assert` / `evaluate` の 3 値評価） | `readAct` / `readCct` / `readPct` / `ApplicEvaluator` |
| 本文（descript / proced / process / fault / pm）の共通の形への読み取り | `readContent` / `readContentFromXml` |
| 1 件の検証（整形式・XSD・BREX・参照）をまとめた検証状態 | `verifyDataModule` / `VerificationStatus` |
| 検証の結果と、判定できない適用性からの修正候補 | `suggestFixes` / `findUndeterminedApplicability` / `findApplicTables` |
| CSDB の置き場所の差し替え（既定はフォルダー） | `CsdbSource` / `DirectoryCsdbSource` / `MemoryCsdbSource` / `CsdbIndex.fromSource` |
| DML（データモジュールリスト）・DDN（納入票）の読み取りと CSDB との照合 | `readDml` / `readDdn` / `reconcileDml` / `reconcileDdn` |
| 下書き（`DraftDataModule`）からのデータモジュールの組み立てと、DMC・ICN・PMC の採番 | `buildDataModule` / `buildContent` / `allocateDmc` / `allocateIcn` / `allocatePmc` |
| 修正候補の文書への適用（候補と一致する選択だけ） | `applyFix` / `applyFixes` |
| 書き込める CSDB の置き場所 | `WritableCsdbSource` / `isWritableCsdbSource` |
| コメントデータモジュールの組み立て | `buildComment` |
| 翻訳向けの文の取り出しと差し戻し | `extractSegments` / `applySegments` |

```ts
import { readFileSync } from 'node:fs';
import { checkAgainstBrexChain, createDirectoryBrexResolver } from '@shuji-bonji/s1000d-core';

const resolve = createDirectoryBrexResolver([process.env.S1000D_SPEC_DIR!, './csdb']);
const report = await checkAgainstBrexChain(readFileSync('./csdb/DMC-….XML', 'utf8'), resolve);

console.log(report.passed, report.unresolved);
for (const layer of report.layers) {
  console.log(layer.brex.title, layer.violations.length, layer.manualChecks.length);
}
```

## 書く側の機能

0.8.0 で、データモジュールを書く側の処理を足しました。[s1000d-writer-mcp](/s1000d-stack/ja/mcp/writer-mcp/) がこれを呼びます。既存の API は変えていません。LLM に XML を書かせないために、入力は構造化した下書きに限り、XML はこのライブラリが組み立てます。

```ts
import { CsdbIndex, applyFixes, buildDataModule, suggestFixes, verifyDataModule } from '@shuji-bonji/s1000d-core';

const csdb = CsdbIndex.fromDirs(['./csdb']);

// 下書きと採番の規則から XML を組み立てる（LLM は XML を書かない）
const built = buildDataModule(draft, allocation, { index: csdb, specDirs: [process.env.S1000D_SPEC_DIR!] });
console.log(built.fileName, built.dmCode, built.ledger, built.icnNext);

// 検証し、候補が 1 つに決まる修正（exact）だけを適用する
const result = await verifyDataModule(built.xml, { schema: { validator, schemaDirs }, brex: { resolver }, references: { csdb } });
const fixes = suggestFixes(result, { xml: built.xml, csdb });
const exact = fixes.filter((f) => f.confidence === 'exact').map((fix) => ({ fix, candidate: fix.candidates[0]! }));
const applied = applyFixes(built.xml, exact, { offered: fixes });
console.log(applied.appliedCount, applied.results.filter((r) => !r.applied).map((r) => r.reason));
```

### 下書き（`DraftDataModule`）

`buildDataModule(draft, allocation, options)` は、`DraftDataModule` から識別・状態部と内容部の XML を組み立てます。種類は descript / proced / process / fault / pm の 5 つで、内容部は `buildContent` が組み立てます。下書きの本文 `DraftNode` は、`readContent` が返す `ContentNode` と同じ語彙の部分集合です。読んだ木をそのまま書き戻せることを、往復のテストで固定しています。

XSD 検証の前に入力の形を検査し、誤りは `DraftInputError` で返します。この検査は XSD 検証の代わりではありません。proced と fault で必須の前提・事後条件のうち入力に無い項目は、「なし」を表す要素で埋めます。`qualityAssurance` は検証していないことを表す `unverified` にします。補った内容は結果の `notes` に書きます。入力の JSON Schema は `@shuji-bonji/s1000d-core/schema/draft.schema.json` で配布しており、MCP のツールの入力スキーマにそのまま使えます。

### 採番（`Allocation`）

`allocateDmc` / `allocateIcn` / `allocatePmc` が、`Allocation`（モデル識別コード・SNS・種類ごとの情報コード `rules.infoCodeByKind`・CAGE コード）と台帳 `ledger` から番号を決めます。同じ `sourceId` には同じ DMC を返します。台帳は入力で受け取って返すので、ライブラリは状態を持ちません。

情報コードの既定はありません。`infoCodeByKind` は必須で、省略は入力の誤りです。情報コードの意味はプロジェクトが決めるもので、このライブラリは値を決めないからです。

### 修正の適用（`applyFix`）

`applyFix` / `applyFixes` は、`suggestFixes` が返した候補（`replace` / `remove` / `add` / `retarget`）を DOM で文書に適用します。`verify` か `offered` を渡すと、候補を計算し直して場所と候補が一致するか照合し、一致しない選択は `candidate-not-offered` で適用しません。`range` と `pattern` の候補は、値が範囲や正規表現に合うかを `matchesRange` / `matchesPattern` で確かめます。`add` で要素を足す位置は、XSD の子要素の順序（`XsdIndex`）から決めます。XML 宣言と DOCTYPE（ICN の `ENTITY` / `NOTATION` 宣言）は保ちます。開始タグの中の空白だけは 1 つに揃います。

### 書き込める置き場所（`WritableCsdbSource`）

`CsdbSource` を広げたインターフェースで、`writeText` と `writeBytes`（ICN の原本など文字列でないファイル）を持ちます。`DirectoryCsdbSource`（最初のフォルダーに書く）と `MemoryCsdbSource` が実装しています。同じ名前のファイルがあるときは `CsdbWriteConflictError` を投げ、`overwrite` を渡したときだけ上書きします。`CsdbSource` と同じく同期で、非同期にしか書けない製品は、組み立てた XML を受け取って自分で書きます。

### コメントデータモジュール（`buildComment`）

`buildComment` は、`comment.xsd` の構造に沿ってコメントデータモジュールを組み立てます。`commentType`・`commentPriorityCode`・`responseType`・`issueType` は列挙のまま書き、意味は付けません。`seqNumber` を省くと、CSDB の同じモデル・送り手・年の次の番号になります。検証では、BREX の連鎖をパブリケーションモジュールとコメントでもたどるようになりました（`readBrexDmRefOf`）。

### 翻訳向けの文（`extractSegments` / `applySegments`）

`extractSegments` は、人が読む文（題名・段落・手順・警告・表のセル・図の題）だけを `Segment[]` として返します。インライン要素は `{1}` `{2}` の記号にし、`skeletonHash` も返します。`applySegments` は、`skeletonHash` で骨組みが同じことを確かめてから訳文を戻し、`language` だけ違うデータモジュールを返します。骨組みが違えば `SkeletonMismatchError` で止まります。翻訳そのものは行いません。

## 設計上の判断

### XML は @xmldom/xmldom、XPath は fontoxpath

BREX の `objectPath` は XPath で書かれ、既定 BREX には `descendant-or-self::` や `not(…)` を多用した式が並びます。Issue 7 の既定 BREX 274 件を調べたところ、1 件が XPath 2.0 の構文（`for … return some … satisfies`）で、XPath 1.0 だけのエンジンでは評価できませんでした。そのため XPath 3.1 を実装する `fontoxpath` を採用し、DOM には `@xmldom/xmldom` を使っています。両方を `XmlEngine` インターフェースの後ろに置き、差し替えられるようにしています。

実装で踏んだ点を 2 つ記録しておきます。`fontoxpath` は属性を選ぶと節点ではなく文字列を返すので、違反箇所の行番号を保つには先に節点集合として評価する必要があります。`@xmldom/xmldom` 0.9 は致命的な構文エラーを例外で投げるので、エンジン側で捕まえて揃えています。

### 照合処理はライブラリに置く

BREX の照合は `s1000d-brex-mcp`（段階 1）と `s1000d-verify-mcp`（段階 2）の両方が使います。同じ処理を 2 つの MCP に別々に書くと結果が食い違うので、照合処理はこのライブラリに置き、MCP は呼ぶだけにしています。

### XSD 検証は libxml2-wasm、実装はサブパスに

XSD 検証は `libxml2-wasm` で行います。`xmllint-wasm` と比べ、Issue 7 の XSD 33 本と Bike Samples 106 件で判定が同じで、コンパイル済みの検証器を使い回せるため約 30 倍速かったからです。`xs:import` の解決に使う API が試験的な扱い（`@alpha`）なので、`XmlEngine` と同じく `SchemaValidator` インターフェースの後ろに置き、実装はサブパス `@shuji-bonji/s1000d-core/xsd-libxml2` から読み込みます。`libxml2-wasm` は任意の peerDependency なので、XSD 検証を使わない `s1000d-brex-mcp` は入れずに済みます。

### 修正の候補はライブラリが決める

修正提案（`suggestFixes`）は、違反ごとに「何を」「どこで」「どの値に」直せばよいかの候補を返します。候補は BREX のルール、XSD の定義、CSDB の索引、文書の中の id、ACT・CCT・PCT から決定論的に決め、点数は付けず、確からしさを `exact` / `several` / `none` の 3 段階で表します。LLM に許可値や参照先を考え出させず、候補の中から選んで説明する役に限るためです。適用性の評価や準拠の判定と同じく、確かめられることはライブラリが行い、文章にすることだけを LLM に任せます。選ばれた候補を文書に当てる処理（`applyFix`）も、候補と照合してから適用するので、候補の外の値は入りません。

### CSDB の置き場所は差し替えられる

このライブラリは既定で「フォルダーの中の `DMC-….XML`」を CSDB と見なします（`CsdbIndex.fromDirs`）。製品の CSDB はデータベースや API なので、CSDB オブジェクトの一覧（`list()`）と中身の取得（`readText()`）を `CsdbSource` インターフェースに集め、`XmlEngine` / `SchemaValidator` と同じ形で差し替えられるようにしています（0.5.0）。索引は `CsdbIndex.fromSource(source)` で作り、他のデータモジュール（ACT・CCT・PCT、BREX の連鎖、参照先）は索引の `read()` から読みます。インターフェースは同期です。参照の解決や修正候補の決定が同期関数で、非同期にするとそれらの API を変えることになるためで、非同期にしか読めない置き場所は先に読み込んで `MemoryCsdbSource` に渡します。書き込みは `WritableCsdbSource`（0.8.0）で足しました。

### 配布物は含めない、テストは自作データで

S1000D の仕様書・XSD・既定 BREX・公式サンプルは再配布できないため、パッケージにもリポジトリにも含めていません。CI で動くテストは自作のデータ（架空の指定席券売機 `KENBAIKI` の説明データモジュールと、2 層の自作 BREX）だけを使います。配布物を使うテストは `S1000D_SPEC_TESTS=1` を付けたときだけ動き、利用者が入手した配布物を `S1000D_SPEC_DIR` から読みます。

### 配布物の中の不整合に備える

配布物のデータ辞書には、ファイル名の DMC と中身の DMC が一致しない見本があります。素朴に探すと「J を探す → 中身が X のファイルが返る → X の親は J」という循環に入り、1 つのデータモジュールの照合に 2 分以上かかりました。連鎖のたどり方は訪れた参照を記録し、解決器は中身の DMC が参照と一致するファイルを優先するようにして、配布物のサンプル 117 件（Bike Samples 106 を含む）の照合を約 10 秒に収めています。

## 公開と版

現在の版は 0.8.0 です。

npm への公開は、`v*` の tag を push したときに GitHub Actions が Trusted Publisher（OIDC）で行います。0.x の間、`^0.1.0` のような依存は minor をまたぎません。このライブラリの minor を上げたときは、MCP 側の依存範囲も上げて公開し直します。
