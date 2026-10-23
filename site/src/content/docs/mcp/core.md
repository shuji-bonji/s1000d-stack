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

### 配布物は含めない、テストは自作データで

S1000D の仕様書・XSD・既定 BREX・公式サンプルは再配布できないため、パッケージにもリポジトリにも含めていません。CI で動くテストは自作のデータ（架空の指定席券売機 `KENBAIKI` の説明データモジュールと、2 層の自作 BREX）だけを使います。配布物を使うテストは `S1000D_SPEC_TESTS=1` を付けたときだけ動き、利用者が入手した配布物を `S1000D_SPEC_DIR` から読みます。

### 配布物の中の不整合に備える

配布物のデータ辞書には、ファイル名の DMC と中身の DMC が一致しない見本があります。素朴に探すと「J を探す → 中身が X のファイルが返る → X の親は J」という循環に入り、1 つのデータモジュールの照合に 2 分以上かかりました。連鎖のたどり方は訪れた参照を記録し、解決器は中身の DMC が参照と一致するファイルを優先するようにして、Bike Samples 117 件の照合を約 10 秒に収めています。

## 公開と版

npm への公開は、`v*` の tag を push したときに GitHub Actions が Trusted Publisher（OIDC）で行います。0.x の間、`^0.1.0` のような依存は minor をまたぎません。このライブラリの minor を上げたときは、MCP 側の依存範囲も上げて公開し直します。
