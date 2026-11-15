# 実在の TM を使った確認から出た要望の進み具合

[tm-eval-requests.md](./tm-eval-requests.md) の「進める順」に沿って行った作業の記録です。要望の ID（RD-1、W-3 など）は同じ文書のものです。

- 作成日: 2026-11-15（JST）、更新: 同日 11:55 JST 頃（順 4 まで。core 0.9.0 と model 0.3.0 の公開、見本の書き直し）
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

設計と決定は次の文書にあります。

| 文書 | 内容 |
|---|---|
| [design/manual-model-0.3.0.md](../design/manual-model-0.3.0.md) | model 0.3.0 の形と、core の下書きに写すときの対応 |
| [design/core-preliminary-rqmts.md](../design/core-preliminary-rqmts.md) | core の `preliminaryRqmts` の読み書き。XSD の構造、いまの対応、往復の実測、3 つの経路を分ける方針 |
| [DECISIONS.md](../DECISIONS.md) の D-31 | core は S1000D の構造を出発点にし、model の都合で形を決めない |

> [!IMPORTANT]
> core と model は公開済みです（2026-11-15）。writer-mcp と hub は push していません。
>
> | リポジトリ | `origin/main` との差 | `package.json` の版 | npm の最新 |
> |---|---|---|---|
> | s1000d-core | 一致 | 0.9.0 | 0.9.0 |
> | experiential-manual-model | 一致 | 0.3.0 | 0.3.0 |
> | s1000d-writer-mcp | 2 コミット先 | 0.2.0（上げていない。CHANGELOG は「未リリース」の節） | 0.2.0 |
> | s1000d-stack（hub） | 文書のコミットの分だけ先 | — | — |
>
> reader-mcp・verify-mcp・brex-mcp の依存は、core 0.9.0 に上げていません。

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
- 新しく見つかったこと（R8）: 冷却系統の 3 つの手順 DM の `reqSupplies` が `noSupplies` になります。元の文書は材料を「消耗品の一覧の品目番号」で示していて、部品番号と数量がありません。writer は値を補わずに品目を落としますが、落とした品目があるのに `noSupplies` と書くので、DM は「材料は要らない」と読めます。要望の一覧に W-10 として足しました。

## 作業中に分かったこと

| 項目 | 内容 | 扱い |
|---|---|---|
| `dmRef` が指せる位置 | 「`dmRef` は DM の中の手順を指せない」と書いていたが、`dmRef/@referredFragment` で指せる。core は `fragment` として読み書きできるようになった（`830de9f`） | 済み。writer-mcp の `convert_manual` が使う（`1a3027c`） |
| 品目の識別子 | 品目は識別子が 1 つ以上と `reqQuantity` が要る。Bike Samples の 118 件は、110 件が `identNumber`、8 件が `toolRef` などだけを持つ。core が書けるのは `identNumber` だけ | 識別子の種類を増やすのは次の版（core の設計の 5） |
| 参照で書く安全の要件 | `@warningRefs` / `@cautionRefs` は読めるが、書けない | 次の版（core の設計の 6） |
| 要約の文と子の節点の重なり | reader は、条件・品目・安全の要件を `requirements` の `text`（要約）と子の節点の両方に返す。文字数（`chars`）には両方が入る | そのまま。要約の文を使っている Skill を変えないため |
| ほかの要素への広げ方 | 往復で数える・黙って落としていないかを確かめる、という測り方を、手順の本文・説明・故障探求・プロセスにはまだ当てていない | 未着手 |
| `userEntry` の `variableRef` | reader は変数名を `dialog` の `attrs.variableName` に読んでいるのに、`variableRef` を `unknown` にも数える | 未着手 |
| `dmThenSeq` と `dmElseSeq` | reader はどちらも中身をそのまま並べるので、区別が付かない | W-6 と一緒に扱う |
| 条件の文の言い回し | writer-mcp は「〈条件〉、次に進む: 」と書く。見本の条件には「とき」で終わらないものがある | 未着手（第 3 回の書き直しでは触っていない） |
| 説明と遷移の重なり | 画面の手順の文で、`description` に遷移先を書くと「メイン画面に戻る。「メイン画面」に進む。」のように 2 回言う | 見本の書き方の問題。`description` に遷移先を書かなければ済む |
| model の CHANGELOG | 0.2.0 は npm に公開済みだが、見出しが「0.2.0 (未リリース)」のままだった | 済み（`cb254e1` で日付にした） |
| 文書の置き場所 | 設計・記録の文書は、Project と hub のリポジトリ（`s1000d-stack/docs/`）の両方に置く。2026-11-15 の途中まで、新しい文書を Project にだけ書いていた | 両方に置くようにした |
| テストの実行場所 | Mac 側の Linux VM では、`node_modules` が macOS 用のため vitest が起動しない（空きも 75 MB）。GitHub から clone したクラウド側で実行した。`tsc` と、ビルドした JS を node で動かすこと（libxml2-wasm での XSD 検証、Bike Samples の読み取りを含む）は VM でもできる | 作業の仕方の記録 |
| writer-mcp の `.git/objects/maintenance.lock` | 2026-11-05 の日付の、大きさ 0 のファイルが残っている | 触っていない |

## 残り

| 順 | 作業 | 待つもの |
|---|---|---|
| 4 の後 | W-10（落とした品目があるときに `noSupplies` などを書かない） | 無し。品目番号だけの材料をどう書くかは、XSD と仕様書で確かめてから |
| 4 の後 | RD-3（残りの DM と PM を reader で読む） | reader-mcp の依存を core 0.9.0 に上げる |
| 5 | W-4 → W-5 → RD-2 | core に足す形は、XSD の `hotspot` と配布物の実測から決める（D-31） |
| 6 | 仕様書のプロセス DM の章を読んでから W-6 | — |
| 7 | M-4〜M-7 と W-9、その後に優先 3 | — |

editor と player の 0.3.0 対応は、製品側（`webapps/experiential-manual-editor`）の作業です。評価フォルダーの `.emanual` と HTML は 0.2.0 の形のままで、作り直していません。
