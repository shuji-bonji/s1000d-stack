# 実在の TM を使った確認から出た要望の進み具合

[tm-eval-requests.md](./tm-eval-requests.md) の「進める順」に沿って行った作業の記録です。要望の ID（RD-1、W-3 など）は同じ文書のものです。

- 作成日: 2026-11-15（JST）、更新: 同日 23:15 JST 頃（順 4、W-10、RD-3、R11、材料 4 品目の書き方まで）、同日 23:55 JST 頃（core 0.10.0 と model 0.4.0 の公開、MCP 4 本の依存の更新）、2026-11-16 07:40 JST 頃（MCP 4 本が core 0.10.0 で動くことの確認）、同日 08:05 JST 頃（MCP 4 本の公開）、同日 08:30 JST 頃（Bike Samples の 66 個）、同日 10:05 JST 頃（公開版の試用と、core 0.11.0・MCP 4 本の公開）、同日 12:55 JST 頃（BREX の修正候補と、Bike Samples の残り 13 個）、2026-11-17 10:55 JST 頃（構造を変える編集と、読み取りに足したもの）、2026-11-18 12:50 JST 頃（改版（層 2）の公開まで）、2026-11-20（2026-11-16 までの節を [tm-eval-progress-1.md](./tm-eval-progress-1.md) に分けた）
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
| 材料 | 品目に NATO 物品番号（`natoStockNumber`）を足す（0.4.0） | experiential-manual-model | `4137a87` |
| 材料 | 品目の識別子として `natoStockNumber` を読み書きする | s1000d-core | `682dde2` |
| 材料 | `convert_manual` が品目の `natoStockNumber` を書く。W-10 の判定を「識別子（NSN か製造者のコード）か数量の無い品目」に変える | s1000d-writer-mcp | `e642dd8` |
| 材料の後 | 依存を core `^0.10.0` に上げる | s1000d-reader-mcp / s1000d-verify-mcp / s1000d-brex-mcp | `473c29a` / `00105ac` / `b9ba18e` |
| RD-3 の後 | Bike Samples で、読み取りの結果に無いテキスト節点を 66 個から 13 個に減らす | s1000d-core | `9a23910`（0.11.0） |
| Bike の後 | 依存を core `^0.11.0` に上げる | s1000d-reader-mcp / s1000d-verify-mcp / s1000d-brex-mcp / s1000d-writer-mcp | 0.10.0 / 0.7.2 / 0.6.2 / 0.3.1 に入っている |
| 候補 | 条件付きで禁止する BREX ルールの修正候補を、条件を成り立たなくする変更にする | s1000d-core | `f1c58a7`（未公開） |
| Bike の残り | Bike Samples で、読み取りの結果に無いテキスト節点を 13 個から 0 個に減らす | s1000d-core | `69e6bbf`（未公開） |
| 材料 | 見本の材料 4 品目に、WP 0021 の NSN・部品番号・CAGE コードと「As required」を書き、変換し直す | 評価フォルダー（リポジトリには入れない） | — |

設計と決定は次の文書にあります。

| 文書 | 内容 |
|---|---|
| [design/manual-model-0.3.0.md](../design/manual-model-0.3.0.md) | model 0.3.0 の形と、core の下書きに写すときの対応 |
| [design/core-preliminary-rqmts.md](../design/core-preliminary-rqmts.md) | core の `preliminaryRqmts` の読み書き。XSD の構造、いまの対応、往復の実測、3 つの経路を分ける方針 |
| [DECISIONS.md](../DECISIONS.md) の D-31 | core は S1000D の構造を出発点にし、model の都合で形を決めない |

> [!IMPORTANT]
> 公開と push の状態です（2026-11-16 10:00 JST に確かめた）。core・model・MCP 4 本はすべて公開済みで、6 つのリポジトリとも `origin/main` と一致しています。未公開のコミットはありません。
>
> | リポジトリ | 公開した版（`package.json`・git の tag・npm が同じ） | core への依存 |
> |---|---|---|
> | s1000d-core | 0.11.0（2026-11-16） | — |
> | experiential-manual-model | 0.4.0（2026-11-15） | — |
> | s1000d-writer-mcp | 0.3.1（2026-11-16） | `^0.11.0`（model は `^0.4.0`） |
> | s1000d-reader-mcp | 0.10.0（2026-11-16） | `^0.11.0` |
> | s1000d-verify-mcp | 0.7.2（2026-11-16） | `^0.11.0` |
> | s1000d-brex-mcp | 0.6.2（2026-11-16） | `^0.11.0` |
>
> MCP 4 本は、MCP Registry（`mcp-publisher publish`）にも同じ版で登録済みです。claude-plugins リポジトリの台帳と、hub の `stack.json` の `published` も同じ版です。
>
> 下の文は、core 0.10.0 と MCP 4 本（0.3.0・0.9.0・0.7.1・0.6.1）を公開したときの記録です。
>
> 利用者が公開のときに署名を付け直したので、コミットのハッシュが変わりました（model `f1daae5` → `4137a87`、core `9bff422` → `682dde2`、writer-mcp `870b38a` → `7dfaea3` → `e642dd8`、reader-mcp `45330a0` → `473c29a`、verify-mcp `91519f8` → `00105ac`、brex-mcp `f9f4a6e` → `b9ba18e`）。この文書は新しいハッシュで書いています。
>
> reader-mcp・verify-mcp・brex-mcp は、2026-11-15 23:45 JST の `npm update @shuji-bonji/s1000d-core` では core が上がりませんでした。`^0.9.0` の範囲に 0.10.0 が入らないためです（0.x の `^` は minor を固定します）。`package.json` と `package-lock.json` を 0.10.0 に直してコミットし（`package-lock.json` は、writer-mcp の同じ項目の `version`・`resolved`・`integrity` を写しました）、利用者が 3 本で `npm ci`、`S1000D_SPEC_TESTS=1 npm test`、`npm run build` を実行しました（2026-11-16 07:30 JST。reader 32 件、verify 40 件、brex 26 件が通った）。
>
> `s1000d-reader-dev` への反映も確かめました（2026-11-16 07:37 JST）。`csdb-nsn/` の `AMMPS5KW-A-10-20-00-11A-520A-D` を読むと、材料 4 品目の節点に `natoStockNumber`（`6850-00-181-7933` など）が返り、要約の文に「NSN …」が入り、`unknownElements` と `notReadElements` は空でした。

## 2026-11-16 までの記録

次の 10 個の節は、[tm-eval-progress-1.md](./tm-eval-progress-1.md) に分けました（2026-11-20）。文書を小さくするために分けたもので、本文は分ける前と同じです。

- 順 1〜3 の要点
- D-31 に沿った core の見直し（2026-11-15 08:12 JST 以降）
- 順 4: 変換関数と、見本の書き直し（2026-11-15 11:48 JST まで）
- W-10 と、MCP 3 本の依存の更新（2026-11-15 13:20 JST まで）
- RD-3: 残りの DM と PM を読んだ結果（2026-11-15 13:45 JST まで）
- R11: 参照の題名（2026-11-15 14:20 JST まで）
- 材料 4 品目の書き方: `natoStockNumber`（2026-11-15 23:15 JST まで）
- Bike Samples の 66 個（2026-11-16 08:30 JST まで）
- 公開版の試用と、core 0.11.0 での試用（2026-11-16 10:05 JST まで）
- BREX の修正候補と、Bike Samples の残り 13 個（2026-11-16 12:55 JST まで）

## 既にある DM の構造を変える編集（2026-11-17 09:05 JST まで）

core 0.12.0・0.13.0、writer-mcp 0.4.0〜0.5.1、reader-mcp 0.11.0〜0.12.0、verify-mcp 0.8.0・0.8.1、brex-mcp 0.6.3・0.6.4、Skill `s1000d-publish` 0.2.0〜0.3.1、`experience-to-s1000d` 0.1.2 を公開しました。詳しい記録は [tm-eval-handoff-5.md](./tm-eval-handoff-5.md)、設計と実測は [design/core-structural-edit.md](../design/core-structural-edit.md)、決定は DECISIONS の D-32 にあります。

| 作ったもの | 要点 |
|---|---|
| core `editContent`（0.13.0） | 節点を足す・取り除く・移す。元の文字列の編集した範囲だけを書き換える。版と変更の印は変えない |
| writer-mcp `edit_data_module`（0.5.0・0.5.1） | 検証 → 編集 → 検証し直す → 書き込む。XSD のエラーが増えた結果と、取り除いた `id` をほかの DM・PM が指している結果は書き込まない |
| reader-mcp `includeLocation`（0.12.0） | `true` のときだけ、節点に `location` を付ける |
| Skill `s1000d-publish` の `references/edit.md`（0.3.0・0.3.1） | E1（版を確かめる）〜 E6（書き込んで確かめる） |

Bike Samples の実測（110 件すべてで要素の範囲が DOM と対応、手順 DM 39 件すべてで足した 3 行のほかは元の文字列と同じ、など）と、plugin 経由の確認の結果は、設計文書にあります。

この作業で分かったこと:

| 項目 | 内容 | 扱い |
|---|---|---|
| 型だけを根拠に手順を書いた | reader-mcp は 0.11.1 まで応答から `location` を外していた。設計文書、writer-mcp の説明、Skill の手順は、reader の実際の応答を確かめずに「`location.path` を写す」と書いていた | reader-mcp 0.12.0 と `s1000d-publish` 0.3.1 で直した。手順や説明を書く前に、plugin か dev の MCP を呼んで応答の形を見る |
| 自作の DM だけで確かめた | `editContent` の `insert` が、`content` の先頭に `refs` などがある DM をすべて断っていた。Bike Samples で初めて見つかった | core 0.13.0 で直した。自作のテスト用の DM だけで確かめたものは、Bike Samples と plugin 経由でも確かめる |
| 手順の段落に場所が付かない | reader は、手順の直下の子を持たない段落を、すべて手順の節点の `text` にまとめる。その段落だけを取り除く・移すことができない | `includeLocation: true` のときに `textLocations[]` を添えると決まった（2026-11-17）。core 0.14.0・reader-mcp 0.13.0 で公開した（下の節） |

## 読み取りに、更新の理由・変更の印・手順の段落の場所を足した（2026-11-17 10:55 JST まで）

層 2（改版）の前提の作業です。決定は DECISIONS の D-34、形と実測は [design/core-revision.md](../design/core-revision.md) の「読み取りに足したもの」と [design/core-structural-edit.md](../design/core-structural-edit.md) の「手順の段落に場所が付かない」にあります。

> [!NOTE]
> 下の表の「状態」は、2026-11-17 10:55 JST の時点のものです。その後、3 つとも公開しました。core は 0.14.0（2026-11-17）、reader-mcp は 0.13.0（2026-11-17）、Skill `s1000d-publish` は 0.3.2（2026-11-18）です。`s1000d-reader-dev` で応答を見た結果は、下の「改版（層 2）」の節にあります。

| 作ったもの | 状態 | 置き場所 |
|---|---|---|
| core: `IdentAndStatus.reasonForUpdates[]`、`ContentNode.change`・`ContentRef.change`、`DataModuleContent.changeMarks[]`、`ContentNode.textLocations[]` | 作業コピーにコミット済み（`270a1fc`。署名なし、未 push、npm に未公開。次の版は 0.14.0） | `lib/s1000d-core` |
| reader-mcp: 上の 4 つを応答に入れる。`textLocations` は `includeLocation: true` のときだけ | パッチ（コミットしていない。core 0.14.0 の公開の後に、依存を `^0.14.0` に上げてコミットする。次の版は 0.13.0） | 評価フォルダーの `work/reader-mcp-change-marks.patch` |
| Skill `s1000d-publish`: `references/edit.md` の E2（`textLocations[]`）、前提の reader-mcp の最低版を 0.13.0 に | パッチ（コミットしていない。reader-mcp 0.13.0 の公開の後） | 評価フォルダーの `work/s1000d-publish-skill-textlocations.patch` |

確かめたこと:

- core の vitest は、クラウド側で 321 件（配布物を使う 46 件はスキップ）、Mac 側の VM で `S1000D_SPEC_TESTS=1` を付けて 367 件（スキップなし）が通った。
- Bike Samples の DMC 106 件で、元の文字列を正規表現で数えた数と、読み取りの結果が合った。`reasonForUpdate` は 97 件に 124 個、変更の印を持つ要素は 3 件に 14 個（`wire` 10・`electricalEquip` 2・`graphic` 2）、まとめた段落が 2 つ以上の手順は 7 件に 11 個。
- その 11 個すべてで、`textLocations` の場所の `para` を取り除く編集と移す編集が `editContent` で適用された。
- reader-mcp は、パッチを当てて VM でビルドし、stdio で `read_data_module` を呼んで応答を見た（クラウド側の vitest は 29 件が通り、配布物を使う 5 件はスキップ）。plugin 経由と `s1000d-reader-dev` では、まだ呼んでいない（公開と Mac でのビルドの後になる）。

この作業で分かったこと:

| 項目 | 内容 |
|---|---|
| 印を持つ要素の数 | 5 回目・6 回目の引き継ぎは「`changeType` は 3 件」とだけ書いていた。要素の数は 14 個で、12 個は本文を構造化して読まない `wrngdata` の DM にある。節点だけに印を返す形では、Bike Samples の印のほとんどが応答に出ない |
| `text` にまとめた段落が失うもの | 手順の `text` にまとめた `para` と、`listItem` の `text` になった `para` は、その要素自身の `id`・`applicRefId`・変更の印を節点として返さない。Bike Samples では、この形の `para` に属性を持つものは 0 個。変更の印は `changeMarks[]` に入るが、`id` と `applicRefId` は、いまも応答に無い |
| Mac 側の VM の空き | `/sessions`（VM のホーム）が 100 % で、`npm ci` と `npx` が `ENOSPC` で止まる。`npm ci --cache /tmp/npm-cache`、`./node_modules/.bin/…` の直接の実行、`TMPDIR=/tmp` で動く。`/tmp` に作業コピーを作れば、配布物を使う vitest も VM で実行できる |
| Project の文書の大きさ | `project_write` の `local_path` は、ファイルを 1 度の `Read` で全部読めることが条件で、`Read` の上限は 25,000 トークン。`DECISIONS.md` は 25,572 トークンで超えていたので、U-08 の付録を [u08-xsd-validation.md](./u08-xsd-validation.md) に分けた |

## 改版（層 2）（2026-11-18 12:26 JST まで）

発行済みの DM を、S1000D の版の決まりに沿って直すための操作です。core 0.15.0、writer-mcp 0.6.0、Skill `s1000d-publish` 0.4.0 を公開しました。詳しい記録は [tm-eval-handoff-8.md](./tm-eval-handoff-8.md)、設計と実装の結果は [design/core-revision.md](../design/core-revision.md)、決定は DECISIONS の D-33・D-35 にあります。

| 作ったもの | 要点 |
|---|---|
| core `startRevision`（0.15.0） | 発行済みの版（`inWork` が `00`）から、`inWork` が `01` の XML を作る。`issueType` は入力の値にする。前の版の変更の印と `reasonForUpdate` を消し、`changeType="delete"` の要素を取り除く |
| core `editContent` の `options.marking`（0.15.0） | insert は `changeType="add"`、remove は要素を残して `changeType="delete"`、同じ親の中の move は親に `changeType="modify"`。`marking.reason` は `reasonForUpdate` を 1 つ足し、`marking.reasonRefId` は既にあるものを指す |
| core `addReasonForUpdate`（0.15.0） | `reasonForUpdate` を 1 つ足す。本文には触らず、変更の印も付けない |
| writer-mcp `start_revision`・`add_reason_for_update`、`edit_data_module` の `marking`（0.6.0） | ツールは 9 つになった。`start_revision` は、作業中の版を新しいファイル名で書き、発行済みの版のファイルを変えない |
| Skill `s1000d-publish` の `references/edit.md`（0.4.0） | E1 の分け直し、E1a（作業中の版を始める）、「変更の印を付けるかを確かめる」、E3 の「変更の印」、E7（理由だけを足す） |

この回に利用者が決めたこと（DECISIONS の D-35）:

| 決めた時刻（JST） | 決定 |
|---|---|
| 10:21 | `marking` に、既にある `reasonForUpdate` を `id` で指す入口（`reasonRefId`）を足す |
| 10:40 | 印を付けずに `reasonForUpdate` だけを足す `addReasonForUpdate` を、core に足す |
| 10:57 | writer-mcp では、`start_revision` の入力で理由を受け取り、理由だけを足すツールも別に作る（案 C） |

確かめたこと:

- core の vitest は、利用者が Mac で `S1000D_SPEC_TESTS=1 npm test` を実行し、387 件が通った（11:23 JST、スキップなし）。writer-mcp は 62 件が通った（12:00 JST）。
- Bike Samples の 110 件（DMC 106 件・PMC 4 件）で作業中の版を始めると、107 件で始められた。断ったのは、`issueType` が `deleted` の DMC 3 件。取り除いた `reasonForUpdate` は 120 個、印の属性を取り除いた要素は 14 個だった。作業中の版にした DMC 103 件は、XSD のエラーも、版と印に関わる既定 BREX のルール（BREX-S1-00030・00032・00033・00036・00038）の違反も、元の版より増えなかった。
- `issueType: "status"` で始めた作業中の版は、`issueNumber` が `002` 以降なら BREX-S1-00038 の違反になり、`addReasonForUpdate` で理由を 1 つ足すと違反が無くなった。
- Desktop 経由で、`s1000d-writer-dev` と plugin 版の両方を呼んだ（12:22 JST）。Bike Samples の写しの `S1000DBIKE-AAA-D00-00-00-00AA-121A-A_012-00` に、`start_revision` → `edit_data_module`（`marking.reason`）→ `edit_data_module`（`marking.reasonRefId`）→ `add_reason_for_update` の順に呼び、dev と plugin で 4 回とも同じ応答だった。
- `s1000d-reader-dev` で、書かれた `…_012-01` を読んだ。`reasonForUpdates` は 2 件、`content.changeMarks` は 3 件（`modify`・`delete`・`add`）だった。発行済みの版のファイル（`…_012-00`）は、元のファイルと同じだった（`cmp`）。
- 仕様書の Chap 3.5 の全体を読み、並べ替え・移動を表す語を全文から探し、`descript.xsd` を見た。結果は設計文書の「確かめた結果」にある。

この作業で分かったこと:

| 項目 | 内容 | 扱い |
|---|---|---|
| `revised`・`status` の版に理由が無い | `startRevision` は前の版の `reasonForUpdate` をすべて取り除くので、`issueType` を `revised`・`status` にして始めた版は、`issueNumber` が `000`・`001` でなければ BREX-S1-00038 に違反する | `addReasonForUpdate` と、`start_revision` の `reason` を足した（D-35） |
| 文字列の検索で数えた | 配布物を使うテストで、文字列の検索（`reasonForUpdate` など）で「印が残っていない」を確かめると、文の中に要素名を書いた DM（BREX の DM など）で落ちる | 要素と属性を、範囲の走査で数える形に直した |
| 実行する前に数を書いた | 取り除いた `reasonForUpdate` の数を、実行する前に 121 個と書いた。実測は 120 個だった | テストの値は実測で書いた。数を書くときは、数えた結果を写す |
| 差分のパッチに新しいファイルが入らない | `git diff`（ステージしていない差分）は、追跡していない新しいファイルを含まない | 差分だけのパッチを作るときは、先に `git add -N` をするか、`git diff --cached` の全体のパッチを使う |
| `start_revision` の `_notes` | 「元の版は変えない」という内容の文が 2 つ並ぶ（writer-mcp が足す文と、core の `notes` の文） | 未着手 |
| outline の `textLocations` | reader の `section: "outline"` と `includeLocation: true` の組では、`textLocations` が付かない | 決めていない。案は、説明文と `_notes` を「`content`・`all` のときだけ」と直す |
| 削除の許可とコミット | Claude Desktop を起動し直すと、接続したフォルダーでの削除の許可が切れる。許可が切れたままコミットすると、`.git/HEAD.lock` と `.git/objects/*/tmp_obj_*` が残る | コミットの前に、許可があるかを `rm` できるファイルで確かめる |

確かめていないこと:

- Skill 0.4.0 の手順どおりに LLM が動くかは、試していない。
- `start_revision` に `reason` を渡す場合、`issueType` が `revised`・`status` の場合、断る場合（`released-issue`・`write-conflict` など）は、Desktop 経由では呼んでいない（自作のテストと、Mac 側の VM の stdio で確かめた）。
- 説明 DM の `levelledPara` の中の移動は、自作の DM でも Bike Samples でも確かめていない。

## 作業中に分かったこと

| 項目 | 内容 | 扱い |
|---|---|---|
| `dmRef` が指せる位置 | 「`dmRef` は DM の中の手順を指せない」と書いていたが、`dmRef/@referredFragment` で指せる。core は `fragment` として読み書きできるようになった（`830de9f`） | 済み。writer-mcp の `convert_manual` が使う（`1a3027c`） |
| 品目の識別子 | 品目は識別子が 1 つ以上と `reqQuantity` が要る。Bike Samples の 118 件は、110 件が `identNumber`、8 件が `toolRef` などだけを持つ。core が書けるのは `identNumber` と `natoStockNumber` | `natoStockNumber` は済み（core `682dde2`）。`toolRef`・`partRef`・`supplyRef` などは次の版（core の設計の 5） |
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
| すぐ | ~~core 0.12.0 の公開（`f1c58a7`・`69e6bbf`）と、MCP 4 本の依存の更新・公開~~。reader-mcp の説明文の例を直す | 公開は済み（2026-11-17）。説明文の例を直したかは、確かめていない |
| 層 2 の後 | Skill `s1000d-publish` 0.4.0 の手順どおりに、1 件を通す。`start_revision` の `_notes` の重なりを直す。outline の `textLocations` の扱いを決める | — |
| 層 2 の後 | 7 回目の引き継ぎの「決めていないこと」（`applyFix`・`applySegments` の寄せ方、`text` にまとめた `para` の `id`・`applicRefId`、PM の `reasonForUpdate`、Skill `s1000d-review` の観点） | 利用者の決定 |
| Bike の後 | `unknown` のまま返している要素を読む（故障探求 DM の `lru`・`bitMessage`・`circuitBreakerDescr` など、`dmIf` の式のうち人が読む文の無いもの） | 返す形を XSD から決める（D-31） |
| 候補の後 | BREX-S1-00121 のように、足す属性の値を決められないルールの候補（文書の中の `applic` の id を候補にする、など） | 方針の決定 |
| R11 の後 | 作らなかった DM への参照（R14）の扱いを決める | W-10 の続き。見本では起きなくなったが、識別子の無い品目を持つマニュアルでは今も起きる |
| 5 | W-4 → W-5 → RD-2 | core に足す形は、XSD の `hotspot` と配布物の実測から決める（D-31） |
| 6 | 仕様書のプロセス DM の章を読んでから W-6 | — |
| 7 | M-4〜M-7 と W-9、その後に優先 3 | — |

editor と player の 0.3.0 対応は、製品側（`webapps/experiential-manual-editor`）の作業です。評価フォルダーの `.emanual` と HTML は 0.2.0 の形のままで、作り直していません。
