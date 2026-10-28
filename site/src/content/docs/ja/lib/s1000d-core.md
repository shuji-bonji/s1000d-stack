---
title: s1000d-core（ライブラリ）
description: 全 MCP が共有する TypeScript ライブラリ @shuji-bonji/s1000d-core の機能と設計を説明します。
---

`@shuji-bonji/s1000d-core` は、S1000D のデータモジュールを読み、BREX に照合するための TypeScript ライブラリです。`s1000d-brex-mcp` をはじめ、このスタックの MCP サーバーはすべてこのライブラリを使います。S1000D との対応を 1 か所に集め、MCP ごとに別々の解釈をしないためです。

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

## 設計上の判断

### XML は @xmldom/xmldom、XPath は fontoxpath

BREX の `objectPath` は XPath で書かれ、既定 BREX には `descendant-or-self::` や `not(…)` を多用した式が並びます。Issue 7 の既定 BREX 274 件を調べたところ、1 件が XPath 2.0 の構文（`for … return some … satisfies`）で、XPath 1.0 だけのエンジンでは評価できませんでした。そのため XPath 3.1 を実装する `fontoxpath` を採用し、DOM には `@xmldom/xmldom` を使っています。両方を `XmlEngine` インターフェースの後ろに置き、差し替えられるようにしています。

実装で踏んだ点を 2 つ記録しておきます。`fontoxpath` は属性を選ぶと節点ではなく文字列を返すので、違反箇所の行番号を保つには先に節点集合として評価する必要があります。`@xmldom/xmldom` 0.9 は致命的な構文エラーを例外で投げるので、エンジン側で捕まえて揃えています。

### 照合処理はライブラリに置く

BREX の照合は `s1000d-brex-mcp`（段階 1）と `s1000d-verify-mcp`（段階 2）の両方が使います。同じ処理を 2 つの MCP に別々に書くと結果が食い違うので、照合処理はこのライブラリに置き、MCP は呼ぶだけにしています。

### XSD 検証は libxml2-wasm、実装はサブパスに

XSD 検証は `libxml2-wasm` で行います。`xmllint-wasm` と比べ、Issue 7 の XSD 33 本と Bike Samples 106 件で判定が同じで、コンパイル済みの検証器を使い回せるため約 30 倍速かったからです。`xs:import` の解決に使う API が試験的な扱い（`@alpha`）なので、`XmlEngine` と同じく `SchemaValidator` インターフェースの後ろに置き、実装はサブパス `@shuji-bonji/s1000d-core/xsd-libxml2` から読み込みます。`libxml2-wasm` は任意の peerDependency なので、XSD 検証を使わない `s1000d-brex-mcp` は入れずに済みます。

### 修正の候補はライブラリが決める

修正提案（`suggestFixes`）は、違反ごとに「何を」「どこで」「どの値に」直せばよいかの候補を返します。候補は BREX のルール、XSD の定義、CSDB の索引、文書の中の id、ACT・CCT・PCT から決定論的に決め、点数は付けず、確からしさを `exact` / `several` / `none` の 3 段階で表します。LLM に許可値や参照先を考え出させず、候補の中から選んで説明する役に限るためです。適用性の評価や準拠の判定と同じく、確かめられることはライブラリが行い、文章にすることだけを LLM に任せます。

### CSDB の置き場所は差し替えられる

このライブラリは既定で「フォルダーの中の `DMC-….XML`」を CSDB と見なします（`CsdbIndex.fromDirs`）。製品の CSDB はデータベースや API なので、CSDB オブジェクトの一覧（`list()`）と中身の取得（`readText()`）を `CsdbSource` インターフェースに集め、`XmlEngine` / `SchemaValidator` と同じ形で差し替えられるようにしています（0.5.0）。索引は `CsdbIndex.fromSource(source)` で作り、他のデータモジュール（ACT・CCT・PCT、BREX の連鎖、参照先）は索引の `read()` から読みます。インターフェースは同期です。参照の解決や修正候補の決定が同期関数で、非同期にするとそれらの API を変えることになるためで、非同期にしか読めない置き場所は先に読み込んで `MemoryCsdbSource` に渡します。書き戻しは段階 3 の writer で足します。

### 配布物は含めない、テストは自作データで

S1000D の仕様書・XSD・既定 BREX・公式サンプルは再配布できないため、パッケージにもリポジトリにも含めていません。CI で動くテストは自作のデータ（架空の指定席券売機 `KENBAIKI` の説明データモジュールと、2 層の自作 BREX）だけを使います。配布物を使うテストは `S1000D_SPEC_TESTS=1` を付けたときだけ動き、利用者が入手した配布物を `S1000D_SPEC_DIR` から読みます。

### 配布物の中の不整合に備える

配布物のデータ辞書には、ファイル名の DMC と中身の DMC が一致しない見本があります。素朴に探すと「J を探す → 中身が X のファイルが返る → X の親は J」という循環に入り、1 つのデータモジュールの照合に 2 分以上かかりました。連鎖のたどり方は訪れた参照を記録し、解決器は中身の DMC が参照と一致するファイルを優先するようにして、配布物のサンプル 117 件（Bike Samples 106 を含む）の照合を約 10 秒に収めています。

## 公開と版

npm への公開は、`v*` の tag を push したときに GitHub Actions が Trusted Publisher（OIDC）で行います。0.x の間、`^0.1.0` のような依存は minor をまたぎません。このライブラリの minor を上げたときは、MCP 側の依存範囲も上げて公開し直します。
