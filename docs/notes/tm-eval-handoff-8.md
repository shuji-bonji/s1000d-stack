# 実在の TM を使った確認の引き継ぎ（8 回目、2026-11-18 09:45 JST）

次のチャットで続きを始めるための文書です。7 回目の引き継ぎは [tm-eval-handoff-7.md](./tm-eval-handoff-7.md)、層 2 の設計は [design/core-revision.md](../design/core-revision.md)、決定は [DECISIONS.md](../DECISIONS.md) の D-33・D-34 です。

> [!WARNING]
> 題材から作ったもの（`manual.json`、切り出した図、変換した XML）は社内の確認用です。配布しません。リポジトリにも入れません。
>
> S1000D の仕様書・スキーマ・公式サンプル（Bike Samples を含む）は再配布できません。仕様書の文章を、文書やコードに写しません（決まりは自分の言葉で書き、章の番号を添えます）。

## この回に行ったこと

7 回目の「最初にやること」の 4（層 2 の実装）のうち、core の分（6 回目の「次に作るもの」の 3 と 4）を作りました。writer-mcp（5）と Skill の E1（6 の残り）は、始めていません。

| 作ったもの | 状態 |
|---|---|
| core: `startRevision`（作業中の版を始める） | `lib/s1000d-core` の作業コピーに `git apply` で入れた。**コミットしていない**（未コミットの変更が 12 ファイル） |
| core: `editContent` の `options.marking`（変更の印を付ける指定） | 同上 |
| core: 開始タグの中の属性の範囲を求める関数（`scanAttributes`・`setAttributeSplice`・`removeAttributeSplice` など。`src/xml/ranges.ts`） | 同上 |
| core の CHANGELOG | 「未リリース（0.15.0 の見込み）」の節を足した（同上） |

同じ内容のパッチは、評価フォルダーの `work/core-revision-layer2-c.patch` です（sha256 の先頭は `a6bbb8d983888252`）。`work/core-revision-layer2.patch` と `core-revision-layer2-b.patch` は途中の版で、消してかまいません。

### 利用者が行うこと

| 順 | 作業 |
|---|---|
| 1 | `lib/s1000d-core` の差分を見て、署名を付けてコミットする |
| 2 | 下の「決めていないこと」の 1 と 2 を決める（core の公開の前に決めると、公開が 1 度で済む） |
| 3 | core を 0.15.0 として公開する（CHANGELOG の見出し、tag、npm）。公開の前に、Mac で `S1000D_SPEC_TESTS=1 npm test` を実行する |

## 確かめたこと（2026-11-18 09:42 JST）

| 確かめたもの | 結果 |
|---|---|
| クラウド側の vitest（GitHub から clone した core 0.14.0 に変更を入れた） | 333 件が通った（配布物を使う 49 件はスキップ）。`eslint`・`prettier`・`tsc` も通った |
| Mac 側の VM の vitest（`/tmp` の作業コピー。`S1000D_SPEC_TESTS=1`） | 382 件が通った（スキップなし）。この実行は `core-revision-layer2-b.patch` の内容で、`-c` との違いはテストの題名 1 つと CHANGELOG だけ |
| Bike Samples の 110 件（DMC 106 件・PMC 4 件）で作業中の版を始めた（`issueType: "changed"`） | 107 件で始められた。断ったのは、`issueType` が `deleted` の DMC 3 件。取り除いた `reasonForUpdate` は 120 個、印の属性を取り除いた要素は 14 個、`changeInline` と `changeType="delete"` の要素は 0 個。結果の文書に、印の属性・`reasonForUpdate`・`changeInline` は残っていない。DMC のファイル名は、どれも `_NNN-00_` が `_NNN-01_` になった |
| 作業中の版にした DMC 103 件 | XSD のエラーも、版と印に関わる既定 BREX のルール（BREX-S1-00030・00032・00033・00036・00038）の違反も、元の版より増えなかった |
| 手順 DM（トップレベルの手順が 2 つ以上あるもの）で、印を付けて手順を足し、次の手順に `delete` の印を付けた | XSD のエラーも、上の 5 つのルールの違反も増えなかった |
| `S1000DBIKE-AAA-D00-00-00-00AA-121A-A` で、insert・remove・move を 1 度に適用した | 元のファイルとの `diff` は、`issueInfo` の行、`reasonForUpdate` の 2 行、足した手順の 3 行、移した手順の 3 行、印を付けた開始タグ 2 行だけだった |

確かめていないことです。

- 配布物を使うテストの 3 つ目は、move を呼んでいません（move は、自作の DM のテストと、上の 121A の 1 件で確かめました）。
- 説明 DM（`levelledPara` の中の移動）は、自作の DM でも Bike Samples でも確かめていません。
- plugin 経由と dev の MCP では、まだ呼べません（writer-mcp に入口が無い）。

## 6 回目の「確かめること（未読・未測）」の結果

| 項目 | 結果 |
|---|---|
| Chap 3.5（データモジュールの更新） | 全体（Para 1〜2.3.3.5、3 ページ）を読んだ。作業中の版を始めるときの `issueDate`・`qualityAssurance` の扱いも、`delete` の印の要素を次の版でどうするかも、書かれていない。発行のたびに `issueNumber` を 1 つ上げること（Para 2.3.1）と、作業の途中を `inWork` を上げて示すこと（Para 2.3.2）だけが書かれている。**R-2 の「`delete` の要素を取り除く」は、解釈のまま**である |
| 手順の並べ替えの記述 | 仕様書の全文から、並べ替え・移動を表す語（reorder・rearrange など 6 つ）を探した。変更の印に関わる記述は無かった（当たった 3 か所は、SCORM の設問の並べ替え、点検の割り当て、リンクの行き先の話） |
| `descript.xsd` | `levelledPara`・`para`・`note`・`warning`・`caution`・`sequentialList`・`randomList`・`listItem` は、変更の印の属性を持てる。`description`（トップレベルの `levelledPara`・`para` の親）と `content` は持てない。`proced.xsd` でも、`mainProcedure`・`proceduralStep` は持て、`procedure` は持てない |

`descript.xsd` の結果から、説明 DM のトップレベルの `levelledPara`・`para` を並べ替える move は、`marking` があると `parent-not-markable` で断ります（remove と insert で書いてもらいます）。

## 設計と違う点、設計に無かった点

| 項目 | 内容 |
|---|---|
| 印を付けて残す要素の前後への insert | 同じ呼び出しで、remove（`delete` の印を付けて残す）と、その要素の前後への insert を受け付ける。手順の置き換えを 1 回の呼び出し（＝ 1 つの `reasonForUpdate`）で書くためである。設計文書には無かった |
| 既に `modify` の印を持つ親の中の move | 親の `changeType`・`changeMark` は変えず、`reasonForUpdateRefIds` に今回の理由の `id` を足す |
| 既に `changeType="delete"` を持つ要素の remove | `already-marked-deleted` で断る |
| `changeType` が無く `changeMark` だけを持つ要素 | 追加として扱う（Chap 3.9.5.2.1.1 Para 2.4.1）。その中への編集には印を付けない |
| `startRevision` の `new` | 元の `issueNumber` が `001` のときだけ受け付ける。結果の `notes` に、BREX-S1-00030 に違反することを書く |
| `startRevision` と PM | PM でも動く（Bike Samples の PMC 4 件で始められた）。ファイル名（`fileName`）は DM のときだけ返す |

## この回で分かったこと

| 分かったこと | 確かめ方 | 影響 |
|---|---|---|
| `issueType` を `revised`・`status` にして作業中の版を始めると、`reasonForUpdate` が 1 つも無い文書になる。`issueNumber` が `000`・`001` でなければ、BREX-S1-00038 の条件に当たる | BREX-S1-00038 の決まり（設計文書の「版と `issueType`」）と、`startRevision` が前の版の `reasonForUpdate` をすべて取り除くこと | `notes` で知らせるだけにしてある。印を付けずに `reasonForUpdate` だけを足す入口が要る（下の「決めていないこと」の 2） |
| 配布物を使うテストで、文字列の検索（`reasonForUpdate` など）で「印が残っていない」を確かめると、文の中に要素名を書いた DM（BREX の DM など）で落ちる | Mac 側の VM の vitest | 要素と属性を、範囲の走査で数える形に直した |
| 取り除いた `reasonForUpdate` の数を、実行する前に 121 個と書いた。実測は 120 個だった | VM で数えた | テストの値は実測で書いた。7 回目の「数を書くときは、数えた結果を写す」と同じ誤り |
| `section: "outline"` と `includeLocation: true` の組では、`textLocations` が付かない（7 回目の文書に書いたもの） | plugin 版の応答 | 未着手 |

## 決めていないこと

| # | 項目 | 内容 | 案 |
|---|---|---|---|
| 1 | 既にある `reasonForUpdate` を指す入口 | いまは、`marking` を渡した呼び出しのたびに `reasonForUpdate` が 1 つ増える。同じ理由の変更は同じ `reasonForUpdate` を指す、という決まり（Chap 3.9.5.2.1.1 Para 2.1.3）に沿うには、2 回目からの呼び出しで、既にある `id` を指定できる必要がある | `marking.reason` の代わりに `marking.reasonRefId`（文書にある `reasonForUpdate` の `id`）を受け付ける。どちらか一方を必須にする |
| 2 | 印を付けずに `reasonForUpdate` だけを足す入口 | 6 回目から残っている項目（R-4 の補足）。編集上の変更（`urt01`）のほかに、上の `revised`・`status` の版でも要ることが分かった | core に `addReasonForUpdate`（XML と理由 1 つを受け取り、`dmStatus` に足す）を足し、writer-mcp の `start_revision` の入力にも理由を受け取れるようにする |
| 3 | outline の `textLocations` | outline に付けるか、説明文と `_notes` を直すか | 説明文と `_notes` を「`content`・`all` のときだけ」と直す |

7 回目の「決めていないこと」（`applyFix`・`applySegments` の寄せ方、`text` にまとめた `para` の `id`・`applicRefId`、PM の `reasonForUpdate`、Skill `s1000d-review` の観点）は、そのまま残っています。

## 最初にやること

1. **状態を確かめる。** `lib/s1000d-core` で `git status -sb` と `git log --oneline -3` を見ます。core が 0.15.0 として出ているかを、`package.json`・tag・npm で見ます。
2. **「決めていないこと」の 1 と 2 が決まっていれば、core に入れる。** core の公開の前なら同じ版に、後なら次の版にします。
3. **writer-mcp を作る。** 設計文書の「writer-mcp」のとおり、`start_revision`（`path`・`issueType`・`write`）と、`edit_data_module` の `marking` です。先に、writer-mcp の `edit_data_module` の実装（検証 → 編集 → 検証し直す → 書き込む）を読みます。core が npm に出るまでは、writer-mcp にコミットせず、パッチを評価フォルダーの `work/` に置きます。`/tmp` にビルドした MCP を stdio で呼んで、応答の形を見ます。
4. **Skill `s1000d-publish` の `references/edit.md` の E1 を分ける。** 手順を書く前に、3 の応答の形を見ます。
5. **文書を直す。** `design/core-revision.md`（「案」を実装の結果に直し、「確かめること」の 3 つの結果を書く）、`design/writer-mcp.md`、`design/skills-and-editor.md`、`notes/tm-eval-progress.md`。その後に、Project の古い 4 つの文書（7 回目の表）と合わせて反映します。

## Project の文書

| 文書 | Project の状態 |
|---|---|
| `docs/notes/tm-eval-handoff-8.md`（この文書） | hub と同じ |
| `docs/notes/tm-eval-handoff-7.md`・`docs/notes/tm-eval-progress.md` | hub と同じ（2026-11-18 06:02 JST に反映した） |
| `docs/design/core-structural-edit.md`・`reader-mcp.md`・`writer-mcp.md`・`skills-and-editor.md` | **古い**（7 回目の表のまま） |
| `docs/design/core-revision.md` | hub と同じだが、この回の結果（上の「確かめること」の結果、実装）は、どちらにも書いていない |

## 作業の仕方（7 回目からの追加）

| 項目 | 内容 |
|---|---|
| Mac の作業コピーへのパッチ | 削除の許可が無くても、`git apply` は適用できる（`unable to unlink` の警告が出るが、ファイルは書き換わる）。`git apply --check -R` が通ることと、`/tmp` の作業コピーとの `cmp` で確かめた。`.git` にロックファイルは残らなかった |
| 配布物を使う vitest の実行 | 全体で 35 秒ほど。`nohup … > /tmp/core/vitest.log &` で動かし、`sleep` の後にログの末尾を読む。`NO_COLOR=1` を付ける |
| 失敗したテストの出力 | 文書の全体を `expect` に渡すと、失敗したときに XML が丸ごと出る。先に `dist` をビルドして、数だけを出すスクリプト（`node stat.mjs`）で実測する |
