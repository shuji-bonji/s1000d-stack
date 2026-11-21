# 続編の Zenn Book の引き継ぎ（2026-11-22 08:25 JST）

「S1000D入門」の続編を、別のチャットで書き始めるための文書です。方針は [DECISIONS.md](../DECISIONS.md) の D-36、サイトのリファレンスは D-37 と [design/site-reference.md](../design/site-reference.md) にあります。対応する Issue は s1000d-stack の #10 です。

> [!WARNING]
> 仕様書・スキーマ・公式サンプル（Bike Samples を含む）は載せません（D-03）。決まりは自分の言葉で書き、章と Para の番号を添えます。XML の例は、自作のデータ（券売機の CSDB など）だけを使います。

## 最初に読むもの

1. この文書
2. [DECISIONS.md](../DECISIONS.md) の D-36・D-37
3. [design/site-reference.md](../design/site-reference.md) の「3 つの置き場所」と「実装の結果」
4. [design/core-revision.md](../design/core-revision.md)（最初に書く章「改版する」の材料）
5. [notes/data-dictionary-survey.md](./data-dictionary-survey.md)（データ辞書の中身）

## 決まっていること

| 項目 | 内容 |
|---|---|
| 置き場所 | Zenn Book。リポジトリは `/Users/bonji/workspace/shuji-bonji/submissions/zenn-articles`、本は `books/` の下に新しいフォルダーを作る |
| 読者 | 「S1000D入門」を読み終えた人。データモジュールを作る人と、S1000D を処理するコードを書く人を分けない |
| 本に書くもの | S1000D の決まり、自作の DM の例、確かめる観点 |
| 本に書かないもの | 値の一覧、ツールの引数。サイトのリファレンスへのリンクにする |
| 公開の時期 | サイトのリファレンス（ブランチ `feature/site-reference`）は、本の完成と同時に `main` へマージして公開する（2026-11-22 に利用者が決めた） |

## 決まっていないこと

| 項目 | 状態 |
|---|---|
| 本の題名とフォルダー名（slug） | 未定。「S1000D入門」は `books/s1000d-intro` |
| 章立て | 下の案は提案で、利用者はまだ決めていない |
| コード例の言語 | 提案は TypeScript と `@shuji-bonji/s1000d-core`。ただし core の使い方の本にはせず、各章を「仕様の定め → 実装で起きること → core ではこうした」の順にする |
| 例に使う CSDB | 提案は券売機の CSDB（`convert_manual` の出力。公開できる） |

## 「S1000D入門」の章（続編が前提にする内容）

`books/s1000d-intro/config.yaml` の並びです。

| 番号 | ファイル | 題 |
|---|---|---|
| 01 | `what-is-s1000d` | S1000D とは何か |
| 02 | `history-and-organization` | 歴史と維持組織 |
| 03 | `core-concepts` | 中心概念 |
| 04 | `data-module-structure` | Data Module の基本構造 |
| 05 | `data-module-code` | Data Module Code の読み方 |
| 06 | `data-module-types` | 代表的な Data Module の種類 |
| 07 | `publication-and-ietp` | Publication Module と IETP |
| 08 | `brex` | BREX とビジネスルール |
| 09 | `s-series` | S シリーズとの関係 |
| 10 | `how-to-learn` | 入手方法と学習の進め方 |
| 11 | `issues-and-cautions` | 版の違いと注意点 |
| 12 | `why-now` | なぜ今 S1000D が注目されるのか |
| 13 | `package-notes` | 付録：入手したパッケージの観察記録 |
| 14 | `references-and-glossary` | 参考情報と用語集 |

## 章立ての案

入門の各章を読んだ人が、次に手を動かす内容の順に並べた案です。

| 続編の章 | 入門の対応章 | 中身 | 材料 |
|---|---|---|---|
| 1. 仕様パッケージを手元に置く | 10、13 | 同梱できない理由、`S1000D_SPEC_DIR` で利用者の手元を指す方式、`xml_schema_flat/` が 2 つあり片方は使えないこと | D-03、D-25、[background.md](./background.md) |
| 2. DMC とファイル名を解析する | 05 | DMC の分解、ファイル名の DMC と中身の DMC が一致しない見本があること | background.md |
| 3. DM を読む | 04、06 | 説明・手順・故障探求・プロセスの木の読み取り、読む側は未知の要素で落とさない方針 | D-31、[design/reader-mcp.md](../design/reader-mcp.md) |
| 4. XSD で検証する | 04 | `libxml2-wasm` を選んだ経緯、`xs:import` の解決 | [u08-xsd-validation.md](./u08-xsd-validation.md) |
| 5. BREX を評価する | 08 | `allowedObjectFlag` の 3 値、XPath の結果が節点集合と真偽値の両方になること、XSD の正規表現の変換、BREX の連鎖 | background.md の「BREX の章の読解結果」 |
| 6. 参照を解決する | 07 | `dmRef`・`internalRef`・`pmRef`・ICN、仕様書の章を指す参照を分けること | background.md |
| 7. 適用性を評価する | （入門に無い） | `applicRefId` の指す先が 2 通りあること、ACT・PCT | background.md |
| 8. DM を作る・直す | 04 | 読み書きを 3 つの経路に分けた理由、元の XML を保ったまま直す方法 | D-31、D-32、[design/core-structural-edit.md](../design/core-structural-edit.md) |
| 9. 改版する | 11 | `issueNumber` と `inWork`、`reasonForUpdate`、変更の印 | D-33〜D-35、[design/core-revision.md](../design/core-revision.md) |
| 10. CSDB をフォルダーと Git で持つ | （入門に無い） | DML との照合、納品前の確認 | D-26、[ietp-kickoff.md](./ietp-kickoff.md) |

各章の本文は「仕様の定め → 自作の DM での例 → 確かめ方」にし、章の末尾に「実装するときの注意」を置きます。作るだけの読者は、末尾を飛ばせます。文章の書き方（STE）と、内容を DM に分ける粒度は、深く書きません（実務の経験が無いため）。

## 最初に書く章: 「改版する」

9 章を最初に書く提案です。リンク先のリファレンスがすべてあり、材料が最も新しいためです。1 章書くと、各章の形と、リファレンスへのリンクの入れ方が決まります。

### 構成の案

| 節 | 内容 | リンクするリファレンス |
|---|---|---|
| 版を表す 2 つの番号 | `issueNumber` と `inWork`。発行済みの版は `inWork` が `00` | `issueNumber`、`inWork` |
| 版の状態 | `issueType` の 8 つの値。変更の印を持つ版と持たない版 | `issueType` |
| 更新の理由 | `reasonForUpdate`、`updateReasonType`、`updateHighlight` | `updateReasonType`、`updateHighlight` |
| 変更の印 | `changeType`・`changeMark`・`reasonForUpdateRefIds` の 3 つの属性。編集上の変更には印を付けない | `changeType`、`changeMark`、`reasonForUpdateRefIds` |
| 手を動かす | 券売機の手順 DM を 1 つ選び、作業中の版を始め、手順を 1 つ足して印を付ける。前後の XML を載せる | writer の `start_revision`・`edit_data_module`・`add_reason_for_update` |
| 確かめる | XSD、BREX（BREX-S1-00030・00036・00038・00044）、reader で読み直す | verify の `verify_data_module`、brex の `check_against_brex`、reader の `read_data_module` |
| 実装するときの注意 | 下の「本にしか書けない内容」 | — |

### 本にしか書けない内容

実装して初めて分かった点です。リファレンスには短くしか書いていません。

- 仕様書の Chap 3.9.5.1 の Table 3 は、`001-00` の次の作業中の版（`001-01`）の `issueType` を `new` としている。既定 BREX の BREX-S1-00030 は、この組み合わせを違反にする（D-33）。
- `changeType="delete"` の印が付いた要素を次の版でどう扱うかは、仕様書の読んだ範囲に明記が無い。このスタックは、次の版を始めるときに取り除く（D-33）。
- 要素を移したときの変更の印の決まりは、仕様書に無い。このスタックは、同じ親の中の移動だけを受け付け、親に `modify` を付ける（D-33）。
- `issueType` を `revised`・`status` にして始めた版は、更新の理由が 1 つも無い状態になり、BREX-S1-00038 に違反する。理由だけを足す入口が要る（D-35）。
- DOM を直列化し直すと、何も変えなくても行が変わる。Bike Samples の 110 件で 91,215 行のうち 26,258 行（29 %）が変わったので、編集した範囲だけを書き換える方式にした（D-32）。件数だけを書き、公式サンプルの XML は載せない。

## サイトのリファレンスの状態

| 項目 | 内容 |
|---|---|
| ブランチ | `feature/site-reference`（2026-11-22 にリモートへ push 済み。未マージ） |
| S1000D リファレンス | 17 属性。URL は `/s1000d-stack/ja/reference/s1000d/issue-7/<属性名をハイフンでつないだもの>/` |
| Stack リファレンス | 27 ツール。URL は `/s1000d-stack/ja/reference/stack/<brex・verify・reader・writer>/<ツール名をハイフンでつないだもの>/` |
| 属性を足す方法 | `site/src/reference-notes/s1000d/<属性名>.ja.md` と `.en.md` を書き、`node scripts/generate-reference.mjs extract --spec <配布物の場所>` と `render` を実行する |

本を書いていて足りない属性が出たら、同じブランチにページを足します。いまページがあるのは、次の 17 属性です。

`updateReasonType`、`updateHighlight`、`changeType`、`changeMark`、`reasonForUpdateRefIds`、`issueType`、`issueNumber`、`inWork`、`securityClassification`、`languageIsoCode`、`countryIsoCode`、`infoCode`、`infoCodeVariant`、`itemLocationCode`、`internalRefTargetType`、`emphasisType`、`listItemPrefix`

## リファレンスで確認が済んでいない点

本で使うページから順に見直します。

- 「値の選び方」の場面（`updateReasonType`、`issueType`）は、書いた側が考えた例である。
- `internalRefTargetType`・`emphasisType`・`listItemPrefix`・`itemLocationCode` の値の意味は、既定 BREX の短い説明だけを根拠にしている。
- 英語の訳は、`updateReasonType` の最初の版しか採点していない。
- 日本語の Stack リファレンスは、引数の説明が原文（英語）のままである。
- writer-mcp の `inputSchema` に、日本語の説明がある（5 ツール）。

## マージの前に行うこと

| 作業 | 理由 |
|---|---|
| `node scripts/generate-reference.mjs collect` と `render` | MCP の版が上がると、`tools/list` の写しが古くなる |
| `main` の取り込み | `main` で `mcp/*.md` の「できること」の表や `astro.config.mjs` を直すと、ブランチと同じ行がぶつかる |
| `node scripts/generate-reference.mjs --check`、`npm run check:i18n`、`npm run build` | 生成物と手書きの欄の一致、日本語と英語の構造の一致、リンク |

## 仕様書の読み方

仕様書の PDF（`specs/s1000d/issue-7/S1000D Issue 7.pdf`）は、`pdftotext -layout` で文章にして、属性名や値で探すと該当する Para が見つかります。2026-11-22 は、この方法で `updateReasonType` の値（`urt01`〜`urt05`）と `issueType` の 8 つの値、`changeType` の 3 つの値を読みました。取り出した文章は一時フォルダーに置き、リポジトリには入れません。
