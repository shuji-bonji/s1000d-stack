# 実在の TM を使った確認から出た要望の進み具合

[tm-eval-requests.md](./tm-eval-requests.md) の「進める順」に沿って行った作業の記録です。要望の ID（RD-1、W-3 など）は同じ文書のものです。

- 作成日: 2026-11-15（JST）、更新: 同日 23:15 JST 頃（順 4、W-10、RD-3、R11、材料 4 品目の書き方まで。core 0.9.1 と model 0.3.0 は公開済み。品目の NSN を足した core・model・writer-mcp のコミットは未公開）
- 評価フォルダー: `/Users/bonji/s1000d-stack-eval/tm-9-6115-749-10/`

## 済んだ作業

| 順 | 内容 | リポジトリ | コミット |
|---|---|---|---|
| 1 | RD-1（`dmIf` の条件の文を読む） | s1000d-core | `d69a6f8` |
| 2 | W-3（`Step.next` を参照として書く） | s1000d-writer-mcp | `4ad1e08` |
| 3 | W-1 の core の分（安全の要件） | s1000d-core | `118fd99` |
| 3 | M-1・M-2・M-3（model 0.3.0） | experiential-manual-model | `e0ca740` |
| 3 | W-1 の core の分（人員・文書・品目）と、reader が同じ種類で返すこと | s1000d-core | `f7104ce` |
| 見直し | 共通の警告・注意への参照と条件の参照を読む。往復で失われるものを数えるテスト | s1000d-core | `8bdea98` |
| 見直し | 人員・文書・条件の形を XSD に合わせて広げ、読んでいない要素を知らせる | s1000d-core | `db0fd31` |
| 見直し | 人員の適用性と、参照の版・言語・場所・適用性を読み書きする | s1000d-core | `830de9f` |
| 文書 | D-31、core の `preliminaryRqmts` の設計、この文書を含む 3 つの文書を hub に置く | s1000d-stack | `bc2dc83`・`63d093e`・`7344f3e` |
| 3 | model の CHANGELOG の見出しを日付にする | experiential-manual-model | `cb254e1` |
| 4 | W-1 の変換関数の分、W-2、`Step.next` の `fragment`、`Admonition.title`、依存を core `^0.9.0`・model `^0.3.0` に上げる | s1000d-writer-mcp | `1a3027c` |
| 4 | 見本を model 0.3.0 の形に書き直し、変換し直す | 評価フォルダー（リポジトリには入れない） | — |
| 4 の後 | W-10（識別子か数量の無い品目がある Topic の DM を作らない） | s1000d-writer-mcp | `601e53e` |
| 4 の後 | 依存を core `^0.9.0` に上げる。reader-mcp は `content.notReadElements` を返す | s1000d-reader-mcp / s1000d-verify-mcp / s1000d-brex-mcp | `2154c17` / `4c4c14a` / `656cf5f` |
| RD-3 | 段落の中のリストと、プロセスの節点が指す DM を読む。本文の文字が読み取りの結果に残っているかを数えるテスト | s1000d-core | `9328bbf` |
| R11 | `dmRef` の `dmTitle` に行き先の DM の `infoName` を書く | s1000d-writer-mcp | `85428f1` |
| 材料 | 品目に NATO 物品番号（`natoStockNumber`）を足す（0.4.0） | experiential-manual-model | `f1daae5` |
| 材料 | 品目の識別子として `natoStockNumber` を読み書きする | s1000d-core | `9bff422` |
| 材料 | `convert_manual` が品目の `natoStockNumber` を書く。W-10 の判定を「識別子（NSN か製造者のコード）か数量の無い品目」に変える | s1000d-writer-mcp | `870b38a` |
| 材料 | 見本の材料 4 品目に、WP 0021 の NSN・部品番号・CAGE コードと「As required」を書き、変換し直す | 評価フォルダー（リポジトリには入れない） | — |

設計と決定は次の文書にあります。

| 文書 | 内容 |
|---|---|
| [design/manual-model-0.3.0.md](../design/manual-model-0.3.0.md) | model 0.3.0 の形と、core の下書きに写すときの対応 |
| [design/core-preliminary-rqmts.md](../design/core-preliminary-rqmts.md) | core の `preliminaryRqmts` の読み書き。XSD の構造、いまの対応、往復の実測、3 つの経路を分ける方針 |
| [DECISIONS.md](../DECISIONS.md) の D-31 | core は S1000D の構造を出発点にし、model の都合で形を決めない |

> [!IMPORTANT]
> 公開と push の状態です（2026-11-15 23:10 JST に確かめた）。品目の NSN を足した 3 つのコミットは、どれも push していません。
>
> | リポジトリ | `origin/main` との差 | `package.json` の版 | npm の最新 |
> |---|---|---|---|
> | s1000d-core | 1 コミット先（`9bff422`） | 0.9.1（上げていない。CHANGELOG は「未リリース」の節。次の版は 0.10.0） | 0.9.1 |
> | experiential-manual-model | 1 コミット先（`f1daae5`） | 0.4.0 | 0.3.0 |
> | s1000d-writer-mcp | 4 コミット先（`601e53e`・`5a97182`・`85428f1`・`870b38a`） | 0.2.0（上げていない。CHANGELOG は「未リリース」の節） | 0.2.0 |
> | s1000d-reader-mcp | 2 コミット先 | 0.8.0（同上） | 0.8.0 |
> | s1000d-verify-mcp | 2 コミット先 | 0.7.0（同上） | 0.7.0 |
> | s1000d-brex-mcp | 2 コミット先 | 0.6.0（同上） | 0.6.0 |
> | s1000d-stack（hub） | 文書のコミットの分だけ先 | — | — |
>
> writer-mcp の `package.json` は core `^0.10.0`・model `^0.4.0` を指定していますが、どちらも未公開なので、`package-lock.json` と `node_modules` は core 0.9.1・model 0.3.0 のままです。このままでは Mac で `npm ci` と `npm run build` が通りません。core 0.10.0 と model 0.4.0 を公開した後に、writer-mcp で `npm install` をして `package-lock.json` をコミットしてください。`s1000d-writer-dev` は前にビルドした `dist/` で動いているので、それまでは NSN を書きません。

## 順 1〜3 の要点

- **RD-1**: `readContent` は、`dmIf` の節点（`kind: "if"`）の `question` に `expression/@humanReadableForm` の文を入れます。評価フォルダーの `…-03A-130A-D` で条件の文が返ることを確かめ、R3 は消えました。
- **W-3**: `convert_manual` は、`Step.next` を、同じ Topic の手順へは `internalRef`、別の Topic の手順・画面へはその DM への `dmRef` として書きます。評価フォルダーの見本を `write: false` で変換し直すと（07:31 JST）、26 件とも XSD で valid・BREX で passed・参照は解決、`notRepresented` は 112 件 → 107 件でした。R6 も消えました。評価フォルダーの `csdb/` は書き換えていません。
- **model 0.3.0**: `Topic.prerequisites`（7 つの区分）、`Hotspot.description`・`callout`。テストは 14 件です。
- **W-1 の core の分**: 下書きの `requirements` の子に、条件（`para`）・人員（`person`）・文書（`document`）・品目（`equipment`・`supply`・`spare`）・安全の要件（`admonition`）を置けます。品目は `manufacturerCode` と `quantity` が無いと `DraftInputError` です（値は補いません）。

## D-31 に沿った core の見直し（2026-11-15 08:12 JST 以降）

W-1 の core の形を、experiential-manual-model の 7 つの区分から決めていました。利用者の指摘（core は IETM / IETP の作成ツール・閲覧ソフトでも使う厳密さを重視する。model とは目的が違う）を受けて、XSD と Bike Samples の実測から決め直しました。

| 項目 | 最初（`8bdea98`） | 見直した後（`830de9f`） |
|---|---|---|
| Bike Samples の `preliminaryRqmts` を読んで書いたときに失われる要素・属性（41 件、2,527 個のうち） | 898 個（36 %） | 602 個（24 %） |
| 何も失わずに往復できる DM | 3 件 | 26 件 |
| reader が読まず、知らせてもいない要素・属性 | 数えていなかった | 0 種類 |

見直しで直したこと:

- 共通の警告・注意への参照（`@warningRefs` / `@cautionRefs`）を読んでいなかった。`safetyRqmts` が参照だけを持つ DM で、安全の要件が何も返っていなかった
- 条件の参照（`reqCondDm` の `dmRef`）が、要約の文で落ちていた
- 人員を `personnel` としてしか書けなかった（`person/@man`・区分・技能・見積もり時間が落ちる）
- 人員の適用性を返していなかった。書く側は `personnel` に `applicRefId` を書いていて、渡されると XSD に通らない XML になっていた（XSD では `reqPersons` に付く）
- 参照が行き先と題名しか返していなかった（版・言語・DM の中の場所・適用性）
- 読んでいない要素（`productionMaintData`、`identNumber` 以外の識別子、入れ子の品目など）を、知らせずに落としていた

確認: core のテスト 281 件が通りました（配布物を使う 38 件はスキップ）。往復の数と「黙って落としていないこと」は、Mac 側の VM でビルドした JS を Bike Samples に対して動かして確かめました。見直した項目をすべて入れた手順 DM と故障探求 DM は、Issue 7 の XSD で valid、既定 BREX で違反 0 件でした。

決まった方針（D-31、2026-11-15 08:26 JST）: 読む側は落とさない。新しく作る側は明記した部分集合で、値を補わない。既にある DM は元の XML を保ったまま直し、読んだ木を下書きに写して作り直す経路を編集に使わない。

## 順 4: 変換関数と、見本の書き直し（2026-11-15 11:48 JST まで）

writer-mcp（`1a3027c`）:

- **W-1**: `Topic.prerequisites` の 7 つの区分を、手順 DM・故障探求 DM の `preliminaryRqmts` に書きます。条件の `topicRef` は、その Topic の DM を指す `reqCondDm` になります。識別子か数量の無い品目は書かず、`notRepresented` に返します。
- **W-2**: 画面の手順の文を `Hotspot.label` だけから作り、`description` は後ろの別の文に、`callout` は先頭に置きます。
- `Step.next` の行き先が別の DM の先頭以外の手順のときは、`dmRef/@referredFragment` で指します。`Admonition.title` は見出しと本文の 2 つの段落として書きます。
- テスト 50 件が通りました（Mac で `S1000D_SPEC_TESTS=1 npm test`。配布物を使う 2 件を含む）。

見本（評価フォルダーの `src/build.mts`）:

- 3 つの説明 Topic に置いていた INITIAL SETUP の表と注意書きを、手順 4 件と故障探求 1 件の `prerequisites` に移しました。Hotspot 76 か所の `label` を、名前・説明（66 か所）・番号（52 か所）に分けました。Topic は 14 → 12 です。
- `convert_manual` で `csdb-0.3/` に書きました。DM 23 件 ＋ PM 1 件が XSD で valid、BREX で passed、参照は解決です。`notRepresented` は 119 件です（書き直す前の 107 件に、識別子か数量の無い品目の 12 件が加わりました）。
- **R1 と R2 は消えました**。画面の手順は「[Exit]を押す。メイン画面に戻る。「メイン画面」に進む。」、始動の手順 DM の `preliminaryRqmts` は条件 1・人員 2・参照 6・材料 1・警告 4 になりました。
- 新しく見つかったこと（R8）: 冷却系統の 3 つの手順 DM の `reqSupplies` が `noSupplies` になります。元の文書は材料を「消耗品の一覧の品目番号」で示していて、部品番号と数量がありません。writer は値を補わずに品目を落とし、その区分を `noSupplies` と書くので、DM は「材料は要らない」と読めます。要望の一覧に W-10 として足しました。

## W-10 と、MCP 3 本の依存の更新（2026-11-15 13:20 JST まで）

W-10 について、Issue 7 の `proced.xsd` で確かめたこと:

- `reqSupplies` に書けるのは、`noSupplies` か、`supplyDescr` を 1 件以上持つ `supplyDescrGroup` のどちらかです。品目をすべて落とした区分は、XSD の形の上で `noSupplies` と書くしかありません。
- `supplyDescr` には、識別子（`catalogSeqNumberRef`・`natoStockNumber`・`identNumber`・`supplyRef`・`supplyRqmtRef`・`materialSetRef` のどれか 1 つ以上）と `reqQuantity` が要ります。
- `reqQuantity` は文も書けます。展開してある仕様パッケージの XML（`specs/s1000d/` の下）には、「As required」が 27 件、「See SB」が 6 件あります。
- `supplyRqmtRef` は `supplyRqmtNumber`（必須）で一覧の品目を指す形です。元の文書の「消耗品の一覧の品目番号」に近い形ですが、使い方は仕様書で確かめていません。

決定（利用者、2026-11-15 12:50 JST 頃）: 識別子か数量の無い品目がある Topic の DM は作らない。`convert_manual` は、`dataModules[]` のその行に `error`（`input-error`、`path` は品目の場所）を返し、ほかの DM は作ります（writer-mcp `601e53e`。テスト 49 件が通り、配布物を使う 2 件はスキップ）。テストの券売機の例からは、識別子の無い品目（ウエス）を外しました。

> [!NOTE]
> 評価フォルダーの見本は、このままだと冷却系統の 3 つの手順 DM が作られなくなります。`csdb-0.3/` は W-10 の前に書いたもので、3 件の `reqSupplies` は `noSupplies` のままです。

MCP 3 本の依存を core `^0.9.0` に上げました（決定は同じとき）。reader-mcp は、core が返す `notReadElements` を `content.notReadElements` として応答に入れるようにしました。テストは reader 27 件、verify 34 件、brex 23 件が通りました（配布物を使う分はスキップ）。

## RD-3: 残りの DM と PM を読んだ結果（2026-11-15 13:45 JST まで）

`csdb-0.3/` の DM 23 件を core 0.9.0 の `readContentFromXml` で読み（Mac 側の VM で、reader-mcp の `node_modules` の core を使ったスクリプト）、PM と手順 DM 1 件は `s1000d-reader-dev` で読みました。`unknownElements` と `notReadElements` は 23 件とも空でした。

それでも、読み取りの結果に入っていない文がありました。

| 見つかったこと | 原因 | 扱い |
|---|---|---|
| 説明 DM の箇条書きが、文の無い段落になる。用語の DM は、文の無い段落 1 つだけになる | core の reader は、`para` の中のブロック要素（`randomList`・`definitionList` など）を、文にも子にも入れていなかった。`unknownElements` にも `notReadElements` にも数えていなかった。core の writer はリストを `para` の中に書く（S1000D の普通の書き方） | 直した（core `9328bbf`） |
| プロセス DM の `dmNode` が、題名だけで返る。その画面の手順 DM への `dmRef` が返らない | reader が `dmNode` の直下の参照を読んでいなかった（テストにも「reader は読まない」と書いてあった） | 直した（同上） |
| 参照の題名が、どれもマニュアルの題名（`techName`）になる。「次に進む: [→ …-12A-520A-D AMMPS 5 kW 発電機 操作の手引き…]」のように、行き先の作業の名前が出ない | writer が `dmRef` の `dmTitle` に `infoName` を書いていない（作業前の要件の `reqTechInfo` の参照には書いている） | 済み（R11、writer-mcp `85428f1`） |

D-31 の「読む側は落とさない」を、`preliminaryRqmts` 以外でも数で確かめるために、本文のテキスト節点が読み取りの結果に残っているかを数えるテストを core に足しました（`src/content/coverage.spec.test.ts`）。

| 対象 | テキスト節点 | 読み取りの結果に無い（0.9.0） | 直した後 |
|---|---|---|---|
| 評価フォルダーの `csdb-0.3/`（23 件） | 509 個 | 36 個（7 件の DM） | 0 個 |
| Bike Samples（本文を構造化して読む 59 件） | 1,587 個 | 193 個（31 件の DM） | 66 個（20 件の DM） |

Bike Samples で残っている 66 個は、プロセス DM の `displayText`（15）、品目の `partNumber`（7）、故障の `faultDescr`（6）、定義リストの一部（5）、`hazard`（4）、`prompt`（4）、文書の版（7）などです。文字列が含まれるかどうかだけを見る測り方なので、少なめに数えています。

PM は、`pmEntry` 13 件・DM への参照 23 件がすべて解決していて、問題は見つかりませんでした。

> [!IMPORTANT]
> 読み取りの修正は core の未公開のコミットです。reader-mcp の応答に反映するには、core の公開（0.9.1）と、reader-mcp の依存の更新が要ります。それまで、`s1000d-reader-dev` は箇条書きと用語集を空の段落として返します。

## R11: 参照の題名（2026-11-15 14:20 JST まで）

- 起動し直した後の `s1000d-reader-dev` で用語の DM（`AMMPS5KW-A-10-20-00-05A-040A-D`）を読み、`kind: "list"`（`definitionList`）と `definition` 6 件が返った。core 0.9.1 の修正が `-dev` 版に反映されている。
- writer-mcp `85428f1`: `convert_manual` が、`dmRef` の `dmTitle` に行き先の DM の `infoName` を書く。`infoName` は行き先の DM 自身の `dmTitle/infoName` と同じ値（Topic は題名、画面は「Topic の題名 - 画面の名前」、用語は「用語」）。対象は、手順の飛び先、困ったときの対処、画面の流れの節、PM の項目、作業前の要件の参照の 5 つ。core の `dmRefEl` は既に `infoName` を書けた（`title` が必須）ので、core は変えていない。
- クラウド側のテスト: 51 件が通った（仕様のテスト 2 件は配布物が無いので飛ばした）。
- Mac でビルドした writer で見本を変換し、`csdb-r11/` に書いた（DM 20 件、PM 1 件。冷却系統の 3 件は W-10 のとおり `input-error`）。`dmRef` 38 件すべてに `infoName` が入った。XSD は 21 件すべて valid、BREX の違反は 0 件。

## 材料 4 品目の書き方: `natoStockNumber`（2026-11-15 23:15 JST まで）

元の文書の WP 0021（消耗品の一覧、p.0021-1）を読みました。これまで読んでいなかったページです。表 1 は、品目番号ごとに NSN（列 3）、名前と部品番号・CAGE コード（列 4）、支給単位（列 5）を載せていて、見本の 4 品目はすべて NSN を持っていました。

| 品目番号 | 品目 | NSN | 部品番号（CAGE） | 支給単位 |
|---|---|---|---|---|
| 1 | 不凍液 | 6850-00-181-7933 | MIL-A-46153（81349） | Bottle |
| 5 | 柔軟なじょうご | 4940-01-120-6793 | 記載なし | EA |
| 9 | ウエス | 7920-00-140-0869 | 8722-0088（03950） | Box |
| 10 | 蒸留水 | 6810-00-107-1510 | O-C-265（81348） | Drum |

仕様書（Issue 7、Chap 3.9.5.2.1.9 と Chap 3.9.5.2.7）で確かめたこと:

- 数量が決まらない品目は、`reqQuantity` に「As required」と書き、`unitOfMeasure` を付けない（Chap 3.9.5.2.1.9 の Para 2.5.1.4）。
- `supplyRqmtRef` は、消耗品の要件の共通情報リポジトリ（情報コード 00M の DM）を運用するプロジェクトのための参照で、`supplyRqmtNumber` はそのリポジトリの中の要件を指す（同 Para 2.6.1.2）。Bike Samples でも 00M の DM への `dmRef` と組で使っている。WP 0021 は要件ではなく品目の一覧なので、形が合わない。
- `natoStockNumber` は、`natoSupplyClass`（4 桁）・`natoCodificationBureau`（2 桁）・`natoItemIdentNumberCore`（7 桁）の 3 つの属性で書くのが基本で、`fullNatoStockNumber` は別の書き方。作業前の要件では、NSN を欠けなく書く（Chap 3.9.5.2.7 の Para 2.5.5.1）。
- 3 つの属性の型は `xs:int` だが、仕様書の例は `natoCodificationBureau="00"` と書いている。`00` と `0000184` を書いた手順 DM は、Issue 7 の `proced.xsd` で valid だった（`xmllint`）。ハイフンを入れた `000-0184` は invalid だった。
- `supplyDescr` の識別子は 1 つ以上で、`natoStockNumber` と `identNumber` を両方書ける。

決定（利用者、2026-11-15 22:59 JST）: 識別子を `natoStockNumber` で書く（案 A）。数量は見本に「As required」と書く。元の文書に数量が無いので、見本の作者が書く値で、writer は補わない。

行ったこと:

- **model 0.4.0**（`f1daae5`）: 品目（`equipment`・`supplies`・`spares`）に `natoStockNumber`（任意）。13 桁の数字で、4-2-3-4 桁をハイフンで区切って書ける。`validateManual` と JSON Schema が形を検査する。テスト 15 件。
- **core**（`9bff422`、未公開。次の版は 0.10.0）: 下書きの `equipment`・`supply`・`spare` に `natoStockNumber`。3 つの属性に、0 で始まる桁をそのまま書く。品目に要る識別子は「`natoStockNumber` か `manufacturerCode` のどちらか 1 つ以上」になった。`partNumber` は `identNumber` に書くので、NSN があっても `manufacturerCode` が要る。読む側は、節点の `natoStockNumber` に番号を返し（属性 → `fullNatoStockNumber` → 要素の文の順）、要約の文に「NSN …」を入れる。同じ品目の 2 つ目からの `natoStockNumber` と、その子の `refs` は `notReadElements` に数える。テスト 285 件（配布物を使う 39 件はスキップ）。
- **writer-mcp**（`870b38a`）: `convert_manual` が model の `natoStockNumber` を core の下書きに写す。W-10 の判定は「識別子（`natoStockNumber` か `manufacturerCode`）か `quantity` の無い品目」になった。NSN だけがある品目の `partNumber` は書かず、`notRepresented` に返す。テスト 52 件（配布物を使う 2 件はスキップ）。
- **見本**: `src/build.mts` の冷却系統の材料 4 品目に、上の表の NSN・部品番号・CAGE コードと `quantity: 'As required'` を書いた。支給単位は `note` に書いた（`remarks` になる）。`validateManual` はエラー 0 件・警告 0 件で、`manual.json` の差は 3 つの Topic の `supplies` だけ。

変換の結果（評価フォルダーの `csdb-nsn/`、応答は `csdb-nsn.convert.json`、2026-11-15 23:08 JST）:

| 項目 | `csdb-r11/`（前回） | `csdb-nsn/` |
|---|---|---|
| 作った DM | 20 件（冷却系統の 3 件は `input-error`） | 23 件 |
| PM | 1 件 | 1 件 |
| XSD（Issue 7） | 21 件 valid | 24 件 valid |
| BREX（機械で検査できるルール） | 違反 0 件 | 違反 0 件 |
| 解決しない参照 | 4 件（R14） | 0 件 |
| `notRepresented` | — | 107 件（品目の分は 0 件） |

- 冷却系統の 3 つの手順 DM（`…-11A`・`12A`・`13A-520A-D`）の `reqSupplies` は、`supplyDescr` 4 件になった。不凍液・ウエス・蒸留水は `natoStockNumber` と `identNumber` の両方、柔軟なじょうごは `natoStockNumber` だけを持つ。`reqQuantity` は 4 件とも「As required」。
- `s1000d-verify-dev` の `verify_csdb` で `csdb-nsn/` の 24 件を確かめた（23:09 JST、報告は `csdb-nsn.verify.json`）: XSD valid 24、BREX passed 24、解決しない参照 0。これは S1000D への準拠の判定ではない。
- 新しい core の `readContentFromXml` で 23 件を読み直した: 3 件の材料は、名前・NSN・部品番号・製造者のコード・数量が返り、`unknownElements` と `notReadElements` は 23 件とも空だった。
- R8 と、この見本での R14 は消えた。

> [!NOTE]
> 変換は、Mac 側の VM に writer-mcp の `src` を写してビルドしたもので行いました（`node_modules` の core と model を、hub の `lib/` の作業コピーに向けた）。`s1000d-writer-dev` と `s1000d-reader-dev` は npm の core 0.9.1 で動いているので、`s1000d-reader-dev` で `csdb-nsn/` を読むと、NSN は `attrs.otherIdentifiers` と `notReadElements` に `natoStockNumber` として出ます。
>
> 確かめていないこと: core の配布物を使うテスト（`S1000D_SPEC_TESTS=1`）は、今回の変更の後に実行していません。Bike Samples の `preliminaryRqmts` には `natoStockNumber` が無い（`grep` で確かめた）ので、往復の数は変わらない見込みです。

## 作業中に分かったこと

| 項目 | 内容 | 扱い |
|---|---|---|
| `dmRef` が指せる位置 | 「`dmRef` は DM の中の手順を指せない」と書いていたが、`dmRef/@referredFragment` で指せる。core は `fragment` として読み書きできるようになった（`830de9f`） | 済み。writer-mcp の `convert_manual` が使う（`1a3027c`） |
| 品目の識別子 | 品目は識別子が 1 つ以上と `reqQuantity` が要る。Bike Samples の 118 件は、110 件が `identNumber`、8 件が `toolRef` などだけを持つ。core が書けるのは `identNumber` と `natoStockNumber` | `natoStockNumber` は済み（core `9bff422`）。`toolRef`・`partRef`・`supplyRef` などは次の版（core の設計の 5） |
| 参照で書く安全の要件 | `@warningRefs` / `@cautionRefs` は読めるが、書けない | 次の版（core の設計の 6） |
| 要約の文と子の節点の重なり | reader は、条件・品目・安全の要件を `requirements` の `text`（要約）と子の節点の両方に返す。文字数（`chars`）には両方が入る | そのまま。要約の文を使っている Skill を変えないため |
| ほかの要素への広げ方 | 往復で数える・黙って落としていないかを確かめる、という測り方を、`preliminaryRqmts` 以外には当てていなかった | 読む側は、本文のテキスト節点で数えるテストを足した（`9328bbf`）。往復（読んで書く）の測り方は未着手 |
| `userEntry` の `variableRef` | reader は変数名を `dialog` の `attrs.variableName` に読んでいるのに、`variableRef` を `unknown` にも数える | 未着手 |
| `dmThenSeq` と `dmElseSeq` | reader はどちらも中身をそのまま並べるので、区別が付かない | W-6 と一緒に扱う |
| 条件の文の言い回し | writer-mcp は「〈条件〉、次に進む: 」と書く。見本の条件には「とき」で終わらないものがある | 未着手（第 3 回の書き直しでは触っていない） |
| 説明と遷移の重なり | 画面の手順の文で、`description` に遷移先を書くと「メイン画面に戻る。「メイン画面」に進む。」のように 2 回言う | 見本の書き方の問題。`description` に遷移先を書かなければ済む |
| model の CHANGELOG | 0.2.0 は npm に公開済みだが、見出しが「0.2.0 (未リリース)」のままだった | 済み（`cb254e1` で日付にした） |
| 文書の置き場所 | 設計・記録の文書は、Project と hub のリポジトリ（`s1000d-stack/docs/`）の両方に置く。2026-11-15 の途中まで、新しい文書を Project にだけ書いていた | 両方に置くようにした |
| テストの実行場所 | Mac 側の Linux VM では、`node_modules` が macOS 用のため vitest が起動しない（空きも 75 MB）。GitHub から clone したクラウド側で実行した。`tsc` と、ビルドした JS を node で動かすこと（libxml2-wasm での XSD 検証、Bike Samples の読み取りを含む）は VM でもできる | 作業の仕方の記録 |
| W-10 で作らなかった DM への参照 | 冷却系統の 3 件の DM を作らなかったので、PM の項目 3 件と故障探求の DM（`…-00A-411A-D`）の参照 1 件が、無い DM を指す。`convert_manual` の応答では `references` が `unresolved` になり、`unresolvedReferenceCount` は 4 だった（2026-11-15 14:20 JST） | 見本では、材料を NSN で書いたので起きなくなった（`csdb-nsn/`）。writer の扱いは未着手（R14） |
| writer-mcp の `.git/objects/maintenance.lock` | 2026-11-05 の日付の、大きさ 0 のファイルが残っている | 触っていない |

## 残り

| 順 | 作業 | 待つもの |
|---|---|---|
| 公開 | core 0.10.0 と model 0.4.0 を公開し、writer-mcp の `package-lock.json` を更新する。その後に MCP 4 本を push する | 利用者の作業（npm の公開と push）。core は `npm version minor`、model は版を上げてある |
| 公開の後 | reader-mcp・verify-mcp・brex-mcp の依存を core `^0.10.0` に上げる | core 0.10.0 の公開。reader-mcp は、上げると `natoStockNumber` を返すようになる |
| RD-3 の後 | Bike Samples で残っている 66 個を減らす | 無し |
| R11 の後 | 作らなかった DM への参照（R14）の扱いを決める | W-10 の続き。見本では起きなくなったが、識別子の無い品目を持つマニュアルでは今も起きる |
| 5 | W-4 → W-5 → RD-2 | core に足す形は、XSD の `hotspot` と配布物の実測から決める（D-31） |
| 6 | 仕様書のプロセス DM の章を読んでから W-6 | — |
| 7 | M-4〜M-7 と W-9、その後に優先 3 | — |

editor と player の 0.3.0 対応は、製品側（`webapps/experiential-manual-editor`）の作業です。評価フォルダーの `.emanual` と HTML は 0.2.0 の形のままで、作り直していません。
