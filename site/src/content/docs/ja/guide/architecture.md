---
title: 全体構成
description: s1000d-stack を構成する共有ライブラリ・MCP サーバー・Skill と、それぞれを何に使うか、そしてこれらを使う製品との関係を説明します。
---

s1000d-stack は、共有ライブラリ・MCP サーバー・Skill の 3 種類の部品からなります。共有ライブラリが S1000D の処理（読み取り・検証・組み立て）を持ち、MCP サーバーがその処理を LLM から呼べるツールにし、Skill がツールを呼ぶ順番と利用者に確かめることを LLM に伝えます。人が使う製品（体験型マニュアルの作成ツール・閲覧部品と、CSDB を表示する IETM / IETP の閲覧ソフト）は、これらの部品を使う別のプロジェクトで作ります。製品は AI が無くても動きます。

```mermaid
flowchart TB
  U(["利用者"]) -->|依頼| LLM(["LLM（Claude など）"])
  SK["Skill<br/>experience-to-s1000d・s1000d-publish<br/>s1000d-review・s1000d-translate"] -. 手順を伝える .-> LLM
  LLM -->|ツールを呼ぶ| Mcp
  subgraph Mcp["MCP サーバー"]
    BREX["s1000d-brex-mcp"]
    V["s1000d-verify-mcp"]
    R["s1000d-reader-mcp"]
    W["s1000d-writer-mcp"]
  end
  subgraph Lib["共有ライブラリ"]
    CORE["s1000d-core"]
    MODEL["experiential-manual-model"]
  end
  subgraph Products["製品（別プロジェクト。AI が無くても動く）"]
    XM["体験型マニュアル<br/>作成ツール・閲覧部品"]
    IETP["IETM / IETP<br/>CSDB の閲覧ソフト"]
  end
  BREX --> CORE
  V --> CORE
  R --> CORE
  W --> CORE
  W --> MODEL
  XM --> MODEL
  IETP --> CORE
```

各部品は独立したリポジトリで公開しています。このサイトを持つ hub リポジトリ [s1000d-stack](https://github.com/shuji-bonji/s1000d-stack) は、学習サイト（`site/`）、各部品の公開版を記録した構成表（`stack.json`）、計画と決定の記録（`docs/`）だけを持ちます。

## 共有ライブラリ

| ライブラリ | 何に使うか | 公開先 |
| --- | --- | --- |
| [s1000d-core](/s1000d-stack/ja/lib/s1000d-core/) | MCP サーバーが利用する共有ライブラリです。DMC・ICN の分解、識別・状態部の読み取り、BREX 照合、XSD 検証、参照の解決、適用性の評価、本文の読み取り、修正候補の決定、データモジュールの組み立て、修正の適用などの機能を提供します | [npm 0.8.1](https://www.npmjs.com/package/@shuji-bonji/s1000d-core) |
| [experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model) | 体験型マニュアル（画面を見ながら操作を体験して学ぶマニュアル）の共通データモデルです。型と JSON Schema、内容の検査、2021 年の作品からの変換を提供します。S1000D には依存しません | [npm 0.1.0](https://www.npmjs.com/package/@shuji-bonji/experiential-manual-model) |

## MCP サーバー

MCP サーバーは、LLM が呼び出せるツールを提供するプログラムです。4 つとも、データモジュールの XML や適用性の式を LLM に渡さず、判定の結果だけを返します。

| MCP サーバー | 何に使うか | ツール | 公開先 |
| --- | --- | --- | --- |
| [s1000d-brex-mcp](/s1000d-stack/ja/mcp/brex-mcp/) | 顧客やプロジェクトから渡された BREX（データモジュールの書き方の決まり）を読み解き、データモジュールがその決まりに従っているかを確かめます | 5 | [npm 0.4.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-brex-mcp) |
| [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/) | データモジュールが正しく書けているかを、公式の XML スキーマ（XSD）・BREX・参照先の有無でまとめて確かめ、直し方の候補を出します。データ管理リスト（DML、作るべきデータモジュールの一覧）との照合もします | 7 | [npm 0.6.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-verify-mcp) |
| [s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) | データモジュールの本文を、見出し・手順・警告・図の構造で LLM に渡します。参照先をたどり、どの製品に当てはまるか（適用性）を判定します | 6 | [npm 0.7.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-reader-mcp) |
| [s1000d-writer-mcp](/s1000d-stack/ja/mcp/writer-mcp/) | データモジュールを作ります。LLM が渡した下書きから、サーバーが XML を組み立てて検証します。体験型マニュアルの変換、修正の適用、コメントデータモジュールの作成、翻訳用の文の出し入れも行います | 6 | [npm 0.1.1](https://www.npmjs.com/package/@shuji-bonji/s1000d-writer-mcp) |

## Skill

Skill は、どの MCP サーバーをどの順番で呼び、途中で利用者に何を確かめるかを LLM（Claude）に伝える手順書です。組み立てや検証の処理は持たず、判定はすべて MCP サーバーの応答を根拠にします。4 つとも個人の marketplace [shuji-bonji/claude-plugins](https://github.com/shuji-bonji/claude-plugins) で 0.1.0 を公開しています。

| Skill | 何に使うか | 必須の MCP サーバー |
| --- | --- | --- |
| [experience-to-s1000d](/s1000d-stack/ja/skill/experience-to-s1000d/) | 体験型マニュアルの JSON を、S1000D の CSDB（データモジュール・パブリケーションモジュール・図）に変換し、CSDB 全体を検証します | writer・verify |
| [s1000d-publish](/s1000d-stack/ja/skill/s1000d-publish/) | 構造化した下書き（題名・段落・手順・警告・表）から、データモジュールを 1 件ずつ作り、検証して CSDB に入れます。DML に載っているかも確かめます | writer・verify |
| [s1000d-review](/s1000d-stack/ja/skill/s1000d-review/) | データモジュールを、検証結果・BREX の手動確認の項目・文章（用語集と書き方）の 3 つの観点でレビューし、選んだ指摘をコメントデータモジュールとして残します | reader・verify |
| [s1000d-translate](/s1000d-stack/ja/skill/s1000d-translate/) | データモジュールから文を取り出して LLM が訳し、xcomet で採点したうえで、同じ DMC で言語だけが違うデータモジュールに戻します | writer |

## 製品

| 製品 | 何に使うか | 状態 |
| --- | --- | --- |
| 体験型マニュアル | 画面や機器の操作を体験しながら学べるマニュアルを、画面の上で作る作成ツールと、他のサイトにも埋め込める閲覧部品（Web Components）。experiential-manual-model の JSON を読み書きし、保存した JSON は Skill experience-to-s1000d で S1000D に変換できます | 別プロジェクトで開発中（作成ツールは試作済み） |
| IETM / IETP | S1000D の CSDB を Web で表示する閲覧ソフト。パブリケーションモジュールの目次からデータモジュールをたどり、製品を選ぶと当てはまらない節が消え、各ページに版・検証状態・機密区分が出ます。s1000d-stack の reader・verify・適用性の処理をそのまま使います | 別プロジェクトで計画中 |

2 つの製品は 2026-11-07 に s1000d-stack から分け、別のプロジェクトとして進めています。製品の操作説明は、それぞれの製品のサイトに置きます。製品側で足りなかった処理は、s1000d-core と MCP サーバーに足します。

## 対象とする版

Issue 7 を基準に作っています。Issue 4.2・4.1・4.0 系（4.0・4.0.1・4.0.2）でも、それぞれの版の配布物を使って動くことを確かめています。国内外の実例は Issue 4 系に多いためです。データモジュールがどの版かは、`xsi:noNamespaceSchemaLocation` の URL から読みます。

| 版 | 読む・検証する（Bike のサンプルでの結果） | 作る（s1000d-writer-mcp の `issue`） |
| --- | --- | --- |
| Issue 7 | XML 118 件がすべて XSD で `valid` | 既定です（`issue` を省いたとき） |
| Issue 4.2 | XML 105 件がすべて XSD で `valid` | `"4.2"`。Issue 7 向けの下書きを、そのまま組み立てられます |
| Issue 4.1 | XML 103 件がすべて XSD で `valid` | `"4.1"`。プロセス DM の節には題名を書けません |
| Issue 4.0 系 | XML 195 件のうち 194 件が XSD で `valid` | `"4.0"` など。プロセス DM の節には題名を書けません。パブリケーションモジュールとコメントは、`brexDmRef` を書かずに組み立てます |

- **読む**: 4 つの版のどのサンプルでも、本文を構造として読むデータモジュール（説明・手順・プロセス・故障探求）のテキストを、1 つも落とさずに読めます。
- **検証する**: XSD と既定 BREX は、`S1000D_SPEC_DIR` に置いた配布物から探します。データモジュールと同じ版の配布物を指定してください。
- **作る**: その版の XSD に置けないと分かっているものが下書きにあるときは、その要素を省いて組み立てることはせず、`input-error` と下書きの中の位置を返します。
- **管理された内容の印**（`authorityName`・`authorityDocument`）は、Issue 4.0〜4.2 の属性です。下書きの節点の `authority` で書けます。Issue 7 では `controlAuthority` に置き換わっていて、こちらはまだ読み書きできません。
- Issue 4.0 の既定 BREX には、ルールの識別子がありません。違反は報告されますが、ルールの番号は付きません。
- Issue 5.0 と Issue 6 では、まだ動かしていません。S1000D リファレンスのページは、Issue 7 だけを扱っています。

:::note[設計上の決めごと]
判定をサーバーに置く理由と、LLM に XML を書かせないなどの決めごとは [設計方針](/s1000d-stack/ja/guide/design-principles/) にまとめています。決定の経緯と未決事項は、hub リポジトリの [docs/DECISIONS.md](https://github.com/shuji-bonji/s1000d-stack/blob/main/docs/DECISIONS.md) に番号付きで記録しています。
:::
