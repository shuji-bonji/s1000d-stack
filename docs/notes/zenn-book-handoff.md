# 続編の Zenn Book の引き継ぎ（2026-11-22 10:15 JST）

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
| 題名 | 「S1000D実践 — データモジュールを読み、確かめ、作る」（2026-11-22 に利用者が決めた） |
| 置き場所 | Zenn Book。リポジトリは `/Users/bonji/workspace/shuji-bonji/submissions/zenn-articles`、本は `books/s1000d-practice`。`config.yaml`（`published: false`）と 16 個の章のファイルがある。全章の下書きを書いた（2026-11-22。下の「下書きの状態」） |
| 章立て | 下の「章立て」の 14 章と付録 2 つ（2026-11-22 に利用者が決めた） |
| 読者 | 「S1000D入門」を読み終えた人。データモジュールを作る人と、S1000D を処理するコードを書く人を分けない |
| 本に書くもの | S1000D の決まり、自作の DM の例、確かめる観点 |
| 本に書かないもの | 値の一覧、ツールの引数。サイトのリファレンスへのリンクにする |
| 例に使う CSDB | 券売機の CSDB（`convert_manual` の出力。公開できる）。手元の写しは `/Users/bonji/s1000d-stack-eval/csdb`。12 章のために、ACT・PCT を足す（紙幣を受け付ける機種と受け付けない機種） |
| 公開の時期 | サイトのリファレンス（ブランチ `feature/site-reference`）は、本の完成と同時に `main` へマージして公開する（2026-11-22 に利用者が決めた） |

## 決まっていないこと

| 項目 | 状態 |
|---|---|
| コード例の言語 | 提案は TypeScript と `@shuji-bonji/s1000d-core`。ただし core の使い方の本にはせず、コードは章末の「実装するときの注意」にだけ置く |
| 例の CSDB を読者に渡す方法 | 未定。券売機の CSDB を置く公開の場所（リポジトリ）を決める |

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

## 章立て

2026-11-22 に利用者が決めた並びです。副題の「読み、確かめ、作る」が、3〜7 章、8〜9 章、10〜11 章に対応します。1 件の DM を読み、確かめ、作り、改版するまでを先に通し、その後に CSDB 全体にかかわる内容（適用性・PM・DML）を並べます。

| 章 | ファイル | 題 | 入門の対応章 | 中身 | 例・材料 |
|---|---|---|---|---|---|
| 1 | `introduction` | はじめに | — | この本の読み方、各章の形、例に使う券売機の CSDB の一覧、サイトのリファレンスとの分担、仕様書を載せない理由 | D-03、D-36 |
| 2 | `spec-package` | 仕様パッケージを手元に置く | 10、13 | 同梱できない理由、`S1000D_SPEC_DIR` で利用者の手元を指す方式、`xml_schema_flat/` が 2 つあり片方は使えないこと | D-03、D-25、[background.md](./background.md) |
| 3 | `file-names` | ファイル名から中身を見分ける | 05 | DMC・PMC・DML・COM・ICN のファイル名、版と言語の入り方、ファイル名の DMC と中身の DMC が一致しない見本があること | background.md。`infoCode`、`infoCodeVariant`、`itemLocationCode` |
| 4 | `ident-and-status` | 識別・状態の部分を読む | 04 | `dmAddress` と `dmStatus`。保安区分、言語、BREX への参照、適用性の書かれる場所、品質保証 | [design/core-preliminary-rqmts.md](../design/core-preliminary-rqmts.md)。`securityClassification`、`languageIsoCode`、`countryIsoCode` |
| 5 | `descriptive-and-procedural` | 説明と手順の内容を読む | 04、06 | 段落と手順の木、事前の条件と終了後の作業、警告と注意、表、読む側は未知の要素で落とさない方針 | D-31、[design/reader-mcp.md](../design/reader-mcp.md)。040A・520A。`emphasisType`、`listItemPrefix` |
| 6 | `fault-and-process` | 故障探求とプロセスの内容を読む | 06、07 | 故障の切り分けの木、プロセス DM の分岐 | [design/core-fault-and-process.md](../design/core-fault-and-process.md)。411A・130A |
| 7 | `references-and-graphics` | 参照と図をたどる | 07 | `dmRef`・`internalRef`・`pmRef`・ICN、仕様書の章を指す参照を分けること | background.md。図を持つ 520A。`internalRefTargetType` |
| 8 | `xsd-validation` | XSD で確かめる | 04 | スキーマの選ばれ方、エラーの読み方。章末に `libxml2-wasm` を選んだ経緯と `xs:import` の解決 | [u08-xsd-validation.md](./u08-xsd-validation.md) |
| 9 | `brex-validation` | BREX で確かめる | 08 | `allowedObjectFlag` の 3 値、BREX の連鎖、機械で判定できない決まり。章末に XPath の結果が節点集合と真偽値の両方になること、XSD の正規表現の変換 | background.md の「BREX の章の読解結果」。KENBAIKI と KBWORKS の 022A |
| 10 | `create-data-module` | DM を作る | 04、05 | 種類と DMC の決め方、識別・状態の部分に入れる値、作る側は値を補わない方針 | D-31、[design/writer-mcp.md](../design/writer-mcp.md)。説明 DM を 1 件作る |
| 11 | `revise-data-module` | DM を直し、改版する | 11 | 作業中の版での修正、`issueNumber` と `inWork`、`issueType`、更新の理由、変更の印。章末に元の XML を保ったまま直す方法 | D-32〜D-35、[design/core-structural-edit.md](../design/core-structural-edit.md)、[design/core-revision.md](../design/core-revision.md) |
| 12 | `applicability` | 適用性で出し分ける | （入門に無い） | `applic`、`applicRefId` の指す先が 2 通りあること、ACT・PCT | background.md。紙幣を受け付ける機種と受け付けない機種（新しく作る） |
| 13 | `publication-module` | PM でまとめる | 07 | `pmEntry` の木、DM の並べ方、PM の参照の確かめ方 | `PMC-KENBAIKI-K0001-7BTJ7-00_001-00`（`pmEntry` が 5 個、DM への参照が 9 件） |
| 14 | `csdb-and-dml` | CSDB をフォルダーと Git で持つ | （入門に無い） | 複数の版のファイルの持ち方、DML との照合、納品前の確認 | D-26、[ietp-kickoff.md](./ietp-kickoff.md)。05A の 001〜003 版 |
| 付録 A | `appendix-review-and-comment` | レビューと comment DM | — | comment DM の構造、指摘を残す流れ | `COM-KENBAIKI-K0001-2026-00001-Q` |
| 付録 B | `appendix-translation` | 多言語版を作る | — | DMC が同じで言語だけが違う DM | 05A の 520A の `EN-US` 版。[i18n-trial.md](./i18n-trial.md) |

各章の本文は「仕様の定め → 自作の DM での例 → 確かめ方」にし、章の末尾に「実装するときの注意」を置きます。作るだけの読者は、末尾を飛ばせます。章の題は、コードを書く人の作業の名前（解析する・解決する・評価する）にせず、S1000D の作業の名前にしました。文章の書き方（STE）と、内容を DM に分ける粒度は、深く書きません（実務の経験が無いため）。

### 書く前に分かっていること

2026-11-22 に、リポジトリと券売機の CSDB を見て確かめた点です。

- 12 章の例の ACT・PCT は、XML を手で書く。`lib/s1000d-core/src` で ACT・PCT を扱うのは読み取り（`applic/`）だけで、`write/` には無い。
- 13 章には、既にある PM に DM を 1 件足す操作を載せられない。PM の全体を組み立てる操作は、`build_data_module`（種類が `pm`）と `convert_manual` にあるが、PM の一部を直すツールは無い。章の手順は「`read_publication_module` で読む → DM を 1 件足す分を手で直す → `verify_data_module` で確かめる」にした（この行は、2026-11-22 09:20 JST に直した。前は「PM を作るツールは無い」と書いていたが、誤りだった）。
- 12 章と 14 章は、サイトのガイド（`ja/guide/applicability.md`、`ja/guide/csdb.md`）と重なる。概要を繰り返さず、例と確かめ方を中心に書く。
- 券売機の CSDB には、種類ごとの DM（説明 040A、手順 520A、故障探求 411A、プロセス 130A）、プロジェクト BREX と上位の BREX（KENBAIKI と KBWORKS の 022A）、PM、comment、05A の 520A の 001〜003 版と英語版がある。ACT・PCT は無い。

## 下書きの状態（2026-11-22 09:20 JST）

16 個の章のすべてに、下書きがあります（合計で約 10 万字）。下書き、見直し、最初の 5 つの図は、利用者が `zenn-articles` の `02a4fcc` としてコミットし、push しました。後から足した 3 つの図（4・13・14 章）は、コミットしていません。利用者は、まだ通読していません。

| 項目 | 内容 |
|---|---|
| 各章の形 | 冒頭の説明 → 仕様の定め（Chap・Para の番号）→ 自作の XML → 「確かめ方」→「実装するときの注意」→「この章のポイント」→「出典」 |
| 用語 | DM の版は「版（issue）」と書き、「バージョン」は製品のバージョンの意味にだけ使う（2026-11-22 に利用者が決めた）。3 つの属性（`changeType`・`changeMark`・`reasonForUpdateRefIds`）は「変更の印」 |
| リンク | 属性名は S1000D リファレンス、ツール名は Stack リファレンスへ。公開後の URL（`https://shuji-bonji.github.io/s1000d-stack/ja/reference/…`）で書いた。2026-11-22 に、リンク先のページがブランチ `feature/site-reference` にあることを確かめた |
| 仕様書の番号 | 章の番号は、仕様書の目次（PDF から取り出した文章）で確かめた。Para の番号は、設計文書に記録済みのものを使った。今回読んだのは、Chap 4.4 の ICN の書式、Chap 4.5 の `dmlType`・`dmlEntryType` の値、Chap 4.6.1 の `commentType` の値、Chap 3.5 の issue・inwork の語 |

### 見直し（2026-11-22 10:05 JST）

利用者の依頼で、Claude が 16 個の章の本文を読み直して直しました。

| 直した点 | 内容 |
|---|---|
| 「版」の指す対象 | 「版」は DM・PM の版（issue）だけに使う。S1000D の仕様の版は「Issue」と書く（「S1000D の Issue」「スキーマの Issue」）。入門は仕様の版も「版」と書いているので、入門とは書き方が違う |
| 比喩の言い換え | 「届く」（BREX の参照）→「既定 BREX が検査に入っている」。「拾う」→「扱う」「使う」。「落とす・落ちる」→「読み取りを止めない」「失われる」。「部品」→「共通の要素」。「黙って」→「何も知らせずに」。「スキーマが待っていた」→「スキーマが置けるとしている」 |
| 語の定義 | 「層」（参照でつながった BREX の 1 つ 1 つ）と「節点」「木」を、最初に出る場所で説明した |
| 読点 | 助詞の直後の読点が多かったので減らした（「を、」「の、」と、短い文の「は、」など）。1 文あたりの読点は、入門と同じ程度になった |
| 確かめていない記述 | プロセスの DM を使えない納め先への書き方、版を書かない参照がどの版を指すか、の 2 か所を、言い切らない書き方に直した |
| 実行した確認 | `extract_segments` を実行し、適用性の人が読む文が取り出され、条件（`assert`）は取り出されないことを確かめた（付録 B の記述と合っている） |

### 図（2026-11-22 10:15 JST）

Zenn の HTML/CSS の埋め込み（コードブロックの言語名を `html-embed` にする。2026-11-11 からの Beta）で、図を 8 つ入れました。利用者が、`published: false` のまま push して、Zenn のサイトで Book の章に図が表示されることを確かめました（最初の 5 つ）。

| 章 | 図 | 元の HTML（`/Users/bonji/s1000d-stack-eval/work/ZENN-FIG/` の下） |
|---|---|---|
| 3 | ファイル名の色分けと、DMC・版の内訳 | `fig-file-name.html` |
| 4 | `dmAddress` と `dmStatus` の値の一覧 | `fig-ident-status.html` |
| 5 | 手順の XML の構造と、表示の例 | `fig-procedure.html` |
| 9 | BREX の検査した層と、検査していない既定 BREX | `fig-brex-layers.html` |
| 11 | 改版の前と後の表示の例（`add`・`delete` の札） | `fig-change-marks.html` |
| 12 | 2 つの製品で読んだ表示の例（`notApplicable`・`undetermined`） | `fig-applicability.html` |
| 13 | PM の目次の表示の例 | `fig-pm-toc.html` |
| 14 | 版と言語で並べたファイルの一覧 | `fig-issues-grid.html` |

- 制限: 1 つ 50KB まで、高さ 500px まで（超えた分は図の中でスクロールする）。JavaScript・外部の CSS・Web フォントは使えない。どの図も 2.5〜4KB。
- 書き方: 図ごとに、クラス名の頭の 2 文字を変える（`fn-`・`is-` など）。色は CSS 変数にして、`[data-theme="dark"]` で上書きする。幅 520px 以下で縦に並べる。
- 確かめ方: クラウド側の Chrome で描画して画面を見た（幅 700px のライト、幅 340px のダーク）。`zenn-markdown-html` 0.5.15 に `htmlEmbed: true` と `embedOrigin` を渡して変換し、iframe になることを確かめた。
- 手元の `zenn-cli` は 0.5.8 で、`html-embed` に対応していない（最新は 0.5.15）。利用者の手元の `npx zenn preview` では、図を確かめられなかった。
- スマホの幅では、4 章（約 690px）、5 章（約 565px）、9 章（約 507px）の図が 500px を超え、図の中でスクロールする。
- 表示の例（5・11・12・13 章）は、Claude が描いたもの。本文に「実際の見た目は、閲覧の道具が決めます」と書いてある。

### 例を作った場所

本に載せた結果は、dev の MCP を、次のフォルダーに対して実行したものです。元の `/Users/bonji/s1000d-stack-eval/csdb` は変えていません。

| フォルダー（`/Users/bonji/s1000d-stack-eval/work/` の下） | 章 | 中身 |
|---|---|---|
| `ZENN-CH08/broken.xml` | 8 | 手順の DM に、月 `13` と、要素 `memo` を入れたもの |
| `ZENN-CH09/csdb` | 9 | `…-02A-520A-D` の機密区分を `05`、責任を持つ企業を `K0009` に変えたもの |
| `ZENN-CH10/csdb` | 10、13 | `build_data_module` で作った `…-02A-040A-D_001-00`（払い戻しの説明）。PM に `pmEntry` を 1 つ手で足したもの |
| `ZENN-CH11/csdb` | 11 | `…-01A-520A-D_001-01`（`start_revision` と `edit_data_module` 2 回の結果） |
| `ZENN-CH12/csdb` | 12、14 | 手で書いた ACT（`00W`）・PCT（`00P`）。`…-05A-520A-D_003-00`（DM の全体の適用性）、`…-04A-520A-D_001-00`（`applicRefId`）、プロジェクトの BREX（`00P`・`00W` を許す値に足した）を、手で直したもの |

例のために、ツールが「利用者が決める」としている値を、Claude が選びました（11 章の `issueType`・理由の文・`updateReasonType`・`changeMark`、10 章の DM の題名と本文、12 章の属性と製品）。利用者は、まだ確かめていません。

### 書いていて分かったこと

| 項目 | 内容 | 扱い |
|---|---|---|
| 券売機の BREX の参照が、既定 BREX に着かない | `DMC-KBWORKS-…-022A-D` の `brexDmRef` が、自分自身を指している。`verify_data_module` は 2 層（KENBAIKI・KBWORKS）だけを検査し、既定 BREX を検査しない。仕様書の決まり（参照の先は既定 BREX で終わる）に合っていない | 9 章は、これを「例の CSDB の誤り」として書き、既定 BREX を指定した `check_against_brex`（243 ルール、違反 0 件）を別に行う形にした。例の CSDB を直すか、道具が知らせるようにするかは、決めていない |
| `convert_manual`・`build_data_module` の `001-00` に `issueType` が無い | 既定 BREX の検査は通る（属性が無いので、BREX-S1-00030 の条件に当たらない） | 10 章の「実装するときの注意」に、残っている課題として書いた |
| `…-05A-520A-D` の `002-00`・`003-00` に、`issueType`・`reasonForUpdate`・変更の印が無い | 11 章の決まりに沿った改版の例になっていない。既定 BREX の検査は通る | 14 章に、手本ではないという注記を入れた。例を作り直すかは、決めていない |
| プロジェクトの BREX が `00W`・`00P` を許していない | ACT・PCT を足すと、KB-00002 に違反する | 12 章の例では、BREX の許す値に足した |
| writer に、PM へ DM を 1 件足す操作と、ACT・PCT を作る操作が無い | 12 章と 13 章は、XML を手で直している | 本文に、そのとおり書いた |
| 例の CSDB に ICN のファイルが無い | 図を持つ DM の参照の確認が `unresolved` になる（`verify_csdb` で 19 件のうち 6 件） | 各章で、理由を書いた |

### 例のリポジトリ（2026-11-22 14:40 JST）

例の CSDB を、別のリポジトリ [shuji-bonji/s1000d-examples](https://github.com/shuji-bonji/s1000d-examples) に置いた。手元の場所は `s1000d-stack/examples/s1000d-examples`。ハブの `.gitignore` に `/examples/` を足した（`/mcp/` と同じ扱い）。ライセンスは CC BY 4.0。`/Users/bonji/s1000d-stack-eval` は、動かしていない。

> [!IMPORTANT]
> 2026-11-22 14:40 JST の時点で、`s1000d-examples` はコミットしていない（`LICENSE`、`README.md`、`README.ja.md`、`kenbaiki/` が未追跡）。ハブの `.gitignore` と引き継ぎメモも、コミットしていない。本は、例の修正に伴う変更までを利用者が `zenn-articles` の `8d3b359` にコミットした。ICN を入れたことに伴う 6 つの章（1・3・7・11・14 章、付録 A）の変更は、2026-11-22 15:20 JST の時点でコミットしていない。

| フォルダー | 中身 |
|---|---|
| `kenbaiki/csdb/` | 元の 18 個のファイルを直したもの |
| `kenbaiki/chapters/08-xsd`〜`14-csdb` | 章ごとに、足したファイルと直したファイル。直した後の `csdb/` を元に、dev の MCP で作り直した |

元の CSDB から直した点は、次の 6 つ。

| 直した点 | 内容 |
|---|---|
| 組織の BREX の参照 | `brexDmRef` を、自分自身から、既定 BREX（`S1000D-J-04-10-0301-00A-022A-D`）に変えた。DM・PM の検査が 3 層になった |
| 組織の BREX の版 | `003-00`・`issueType="changed"` を、`001-00`・`issueType="new"` に変えた。`001`・`002` のファイルも更新の理由も無かったため。**利用者の指示には無い変更で、Claude が選んだ** |
| `001-00` の DM・PM の `issueType` | 属性が無かった 12 件に、`new` を足した |
| `…-05A-520A-D` の `002-00`（JA・EN） | `issueType="status"`、品質保証を `firstVerification`（`tabtop`）、更新の理由 `urt01`。値は Claude が選んだ |
| `…-05A-520A-D` の `003-00`（JA・EN） | `issueType="changed"`、更新の理由 `urt02`、足した手順 `stp-record` に変更の印。値は Claude が選んだ |
| プロジェクトの BREX | 使ってよい情報コードに `00P`・`00W` を足した。`objectUse` から、テストのための注記（「exact の修正」など）を取り除いた |

`verify_csdb` の結果（Issue 7 のスキーマと既定 BREX）は、`kenbaiki/csdb/` が 17 件すべて `valid`・`passed`（違反 0 件）、章のファイルを重ねた CSDB が 23 件すべて `valid`・`passed`。この時点では、図のファイルが無い DM が、それぞれ 6 件と 8 件あった。

本は、9 章（層の表、図 `fig-brex-layers`、「例の CSDB の誤り」の注記）、10・11・13 章（層の数）、12 章（BREX と作業中の版の注記）、14 章（3 つの版の注記）、付録 B（違う行の数）、1 章（例の入手先）、4 章（品質保証）を直した。

ICN は、2026-11-22 15:15 JST に入れた（利用者が STEP を選んだ）。

| ファイル | 作り方 |
|---|---|
| `ICN-K0001-00001`〜`00005`（PNG、800×480） | HTML・SVG を Chrome のヘッドレスモードで画像にした。画面の文言と駅の名前は Claude が考えた架空のもの |
| `ICN-K0001-00006-001-01.STEP` | CadQuery 2.8.0（Open CASCADE）で、箱 3 つ（`cabinet`・`front-door`・`door-handle`）を組んだ。スキーマは AP214。`notations.xml` の `step` の公開識別子は「STEP AP203」で、AP203 での書き出しは設定を試したが変わらなかった |

- 「前面扉を開ける（係員）」の `001-00` と `001-01` の宣言を、`NDATA jt`（writer-mcp が独自に宣言した形）から `NDATA step` に変えた。プロジェクトの BREX に、形式を絞るルールは無い。
- `notations.xml` に `png`・`svg`・`cgm`・`step`・`iges`・`wrl`・`x3d`・`u3d` はあり、glTF は無い。JT は `ugs` の名前である。Open CASCADE の OSS 版は JT を書き出せない。
- 入れた後の `verify_csdb` は、`kenbaiki/csdb/`（17 件）と、章のファイルを重ねた CSDB（23 件）のどちらも、指す先の無い参照が 0 件。
- 本は、7 章（参照の結果を 2 件とも解決に。ファイルを 1 つ取り除いたときの結果を足した）、11 章（`unresolved` の注記を削除）、14 章（納品前の確認の件数を 23 件・0 件に）、3 章と 1 章（ICN がある）、付録 A（コメントは図を入れる前の記録という注記）を直した。
- コメントの DM（`COM-…-Q`）の R-1・R-2 は、古いファイル名（`.JT`）のまま残している。

### 残っていること

| 作業 | 内容 |
|---|---|
| 利用者の通読 | 章の形、分量、例の値、「実装するときの注意」に書いてよい内容か |
| 例のリポジトリのコミットと push | `s1000d-examples` と、ハブの `.gitignore`。利用者の指示を待つ |
| 図の見た目の確認 | 画面の図 4 つと前面扉の図を、利用者はまだ見ていない |
| 表紙 | `cover.jpg`（入門にはある） |
| 用語集 | 入門の 14 章に当たるものは、作っていない |
| 確かめていない結果 | 12 章の、`K60-0002` で読んだときの手順 1.3 の状態（本文には載せていない）。付録 B の `apply_segments` は、今回は実行していない（ツールの説明と、既にある英語の DM との差分から書いた）。2 章の `list_schemas` も実行していない（ソースの説明文から書いた） |
| Zenn での表示 | `html-embed` の図は、利用者が Zenn のサイトで確かめた（最初の 5 つ）。Mermaid の図、`diff xml` のコードブロック、`:::message` の表示を、Claude は見ていない |

## 最初に書く章: 「改版する」

11 章「DM を直し、改版する」を最初に書く提案です。リンク先のリファレンスがすべてあり、材料が最も新しいためです。1 章書くと、各章の形と、リファレンスへのリンクの入れ方が決まります。

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
