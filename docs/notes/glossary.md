# 用語対訳表（ja → en）

サイト（`site/`）と各リポジトリの README を英語にするときの対訳です。英語の用語は S1000D 仕様書が使う語をそのまま使います（用語の採用は翻訳ではないので D-03 には触れません）。このスタック固有の語は右の列で固定し、ページごとに揺らさないでください。

## S1000D の用語（仕様書の語をそのまま使う）

| 日本語 | 英語 | 備考 |
|---|---|---|
| データモジュール | data module | 略すときは DM |
| データモジュールコード | data module code (DMC) | 初出で括弧付き、以後 DMC |
| 識別・状態部 | identification and status section | `identAndStatusSection` |
| 内容部 | content section | `content` |
| パブリケーションモジュール | publication module (PM) | |
| CSDB（共通ソースデータベース） | common source database (CSDB) | 初出で括弧付き、以後 CSDB |
| ビジネスルール | business rules | |
| BREX（ビジネスルール交換） | BREX (Business Rules Exchange) | 各ページの初出はこの形（D-01） |
| 既定 BREX | default BREX | S1000D が配布するもの |
| 構造ルール | structure object rule | `structureObjectRule` |
| 文脈ルール / 文脈に依らないルール | context rules / non-context rules | |
| 許可値 | allowed value | `objectValue` |
| 重大度 | severity level | `brSeverityLevel` |
| 適用性 | applicability | |
| 適用性文 | applicability statement | `applic` |
| 適用性リポジトリ | applicability repository | |
| ACT / CCT / PCT | applicability cross-reference table (ACT) / condition cross-reference table (CCT) / product cross-reference table (PCT) | 初出で括弧付き |
| 製品属性 / 条件 | product attribute / condition | |
| 情報コード | information code | |
| モデル識別コード | model identification code (MIC) | |
| システム差異コード | system difference code | |
| SNS（システム番号） | standard numbering system (SNS) | |
| 発行番号 / 作業中番号 | issue number / in-work number | |
| 発行日 | issue date | |
| 機密区分 | security classification | |
| 品質保証（未検証 / 第 1 検証 / 第 2 検証） | quality assurance (unverified / first verification / second verification) | |
| ICN | information control number (ICN) | |
| 図 | illustration | S1000D では figure より illustration が通例 |
| IETP / IETM | interactive electronic technical publication (IETP) / interactive electronic technical manual (IETM) | |
| 仕様書 | the S1000D specification | 「Issue 7」は Issue 7 のまま |
| 配布物 | the S1000D distribution (downloaded package) | 文脈で the downloaded package |
| 公式サンプル | official samples (Bike Samples) | |
| 利用条件 | terms of use | 仕様書冒頭の条件 |
| 版 | issue | Issue 7、Issue 4.2 |
| XML スキーマ | XML schema (XSD) | |

## このスタック固有の用語

| 日本語 | 英語 | 備考 |
|---|---|---|
| 道具の束ね | a set of tools | 「bundle」は使わない |
| 部品 | component | リポジトリ単位 |
| 構成表 | stack manifest (`stack.json`) | |
| 学習サイト | documentation site | |
| 段階 1〜4 | stage 1–4 | phase は使わない |
| 照合（BREX に） | check (against BREX) | 動詞 check、名詞 BREX check |
| 検証（XSD による） | validate / validation | |
| 検証状態 | verification status | `verification` |
| 参照の解決 / 参照切れ | reference resolution / broken reference | |
| 違反 | violation | |
| 手動確認の項目 | manual checks | `manualChecks` |
| 判定（適用性の） | evaluation | 3 値は applicable / notApplicable / undetermined のまま |
| 構造として読む | read as structure | |
| 共有ライブラリ | shared library | |
| 共通データモデル | common data model | |
| 体験型マニュアル | experiential manual | パッケージ名 experiential-manual-model に合わせる |
| 作成ツール / 閲覧ソフト | authoring tool / viewer | |
| 軽い Web 形式 | lightweight web format | |
| ユースケース | use case | |
| このスタックでは | In this stack | 節の見出しも同じ |
| 公式・認定（と読ませない） | official / certified | 自分には使わない（D-02） |
| 個人プロジェクト | personal project | |

## 定型文

| 用途 | 英語 |
|---|---|
| 商標注記（各ページ・各 README） | This is a personal project and is not affiliated with ASD (Aerospace, Security and Defence Industries Association of Europe). S1000D® is a registered trademark of ASD. |
| 配布物の非同梱 | The S1000D specification, XML schemas, default BREX and official samples are not included in any package or repository, because their terms of use do not grant redistribution. Obtain them from s1000d.org and point the `S1000D_SPEC_DIR` environment variable at the extracted folder. |
| README の言語切替 | `**English** \| [日本語](./README.ja.md)` / `[English](./README.md) \| **日本語**` |
