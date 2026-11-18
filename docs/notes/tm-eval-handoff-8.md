# 実在の TM を使った確認の引き継ぎ（8 回目、2026-11-18 09:45 JST）

次のチャットで続きを始めるための文書です。7 回目の引き継ぎは [tm-eval-handoff-7.md](./tm-eval-handoff-7.md)、層 2 の設計は [design/core-revision.md](../design/core-revision.md)、決定は [DECISIONS.md](../DECISIONS.md) の D-33・D-34 です。

> [!WARNING]
> 題材から作ったもの（`manual.json`、切り出した図、変換した XML）は社内の確認用です。配布しません。リポジトリにも入れません。
>
> S1000D の仕様書・スキーマ・公式サンプル（Bike Samples を含む）は再配布できません。仕様書の文章を、文書やコードに写しません（決まりは自分の言葉で書き、章の番号を添えます）。

## この回に行ったこと

7 回目の「最初にやること」の 4（層 2 の実装）のうち、core の分（6 回目の「次に作るもの」の 3 と 4）を作りました。writer-mcp（5）と Skill の E1（6 の残り）は、同じ日の追記（下の「追記（2026-11-18 11:04 JST）」）で、パッチとして作りました。

| 作ったもの | 状態 |
|---|---|
| core: `startRevision`（作業中の版を始める） | `lib/s1000d-core` の作業コピーに `git apply` で入れた。**コミットしていない**（未コミットの変更が 13 ファイル） |
| core: `editContent` の `options.marking`（変更の印を付ける指定） | 同上 |
| core: 開始タグの中の属性の範囲を求める関数（`scanAttributes`・`setAttributeSplice`・`removeAttributeSplice` など。`src/xml/ranges.ts`） | 同上 |
| core の CHANGELOG | 「未リリース（0.15.0 の見込み）」の節を足した（同上） |

同じ内容のパッチは、評価フォルダーの `work/core-revision-layer2-e.patch` です（sha256 の先頭は `6a7aa0468224758c`）。`work/` の `core-revision-layer2` で始まるほかの 7 つのパッチ（名前の末尾が無いもの、`-b`・`-c`・`-d`・`-d-increment`・`-e-increment`・`-e-reason`）は途中の版で、消してかまいません。

### 追記（2026-11-18 10:24 JST）: 既にある `reasonForUpdate` を指す入口

利用者の決定（2026-11-18 10:21 JST）: 既にある `reasonForUpdate` を `id` で指定できる入口を足す（下の「決めていないこと」の 1）。

`marking` は、`reason`（新しい `reasonForUpdate` を足す）と `reasonRefId`（識別・状態部に既にある `reasonForUpdate` の `id`）の、どちらか一方だけを受け取ります。`reasonRefId` のときは、識別・状態部を変えず、付けた印がその `id` を指します。結果の `reasonForUpdate.added` は、足したときが `true`、既にあったものを指したときが `false` です。`id` が識別・状態部の `reasonForUpdate` に無ければ `marking-input-error`、その `reasonForUpdate` が `urt01` なら `editorial-reason` で断ります。

この変更の後、クラウド側の vitest は 334 件（配布物を使う 49 件はスキップ）、Mac 側の VM の vitest（`S1000D_SPEC_TESTS=1`）は 383 件が通りました（スキップなし。`-d.patch` の内容で実行）。下の「確かめたこと」の件数（333 件・382 件）は、この追記の前の値です。

### 追記（2026-11-18 10:45 JST）: 印を付けずに `reasonForUpdate` だけを足す入口

利用者の決定（2026-11-18 10:40 JST）: `addReasonForUpdate` を core に足す（下の「決めていないこと」の 2）。

`addReasonForUpdate(xml, reason)` は、`dmStatus` の中の XSD が決める位置（`productSafety`・`remarks` の前）に `reasonForUpdate` を 1 つ足します。本文には触らず、変更の印も付けません。`text` と `updateReasonType` は必須で、`urt01` も受け付けます。`id` を省略すると、文書に無い値を作ります。発行済みの版（`inWork` が `00`）は `released-issue` で断ります。

3 つの入口の使い分けです。

| 入口 | 本文の変更の印 | 識別・状態部の `reasonForUpdate` | 使う場面 |
|---|---|---|---|
| `editContent` の `marking.reason` | 付ける | 1 つ足す | その理由による最初の編集 |
| `editContent` の `marking.reasonRefId` | 付ける | 変えない（既にあるものを指す） | 同じ理由による 2 回目からの編集 |
| `addReasonForUpdate` | 付けない | 1 つ足す | 編集上の変更（`urt01`）。`issueType` が `revised`・`status` の版 |

この変更の後、クラウド側の vitest は 337 件（配布物を使う 50 件はスキップ）、Mac 側の VM の vitest（`S1000D_SPEC_TESTS=1`）は 387 件が通りました（スキップなし。`-e.patch` の内容で実行）。

配布物を使うテストを 1 件足しました。Bike Samples の DMC を 5 件に 1 件の割合で取り、`issueType: "status"` で作業中の版を始めると、`issueNumber` が `002` 以降のものは BREX-S1-00038 の違反になり、`000`・`001` のものはなりませんでした。`addReasonForUpdate` で `urt01` の理由を 1 つ足した後は、どれも BREX-S1-00038 の違反が無くなり、XSD のエラーは増えませんでした。下の「この回で分かったこと」に、決まりを読んで書いた「BREX-S1-00038 の条件に当たる」は、これで実測になりました。

途中で、パッチに新しいファイル（`src/revision/reason.ts`）が入っていませんでした。`git diff`（ステージしていない差分）は、追跡していない新しいファイルを含みません。差分だけのパッチを作るときは、先に `git add -N` をするか、`git diff --cached` の全体のパッチを使います。

### 追記（2026-11-18 11:04 JST）: writer-mcp と Skill（パッチ）

利用者の決定（2026-11-18 10:57 JST）: writer-mcp では、`start_revision` の入力で理由を受け取り、理由だけを足すツールも別に作る（案 C）。

core が npm に出ていないので、writer-mcp と Skill はコミットせず、評価フォルダーの `work/` にパッチを置きました。どちらも、Mac の作業コピーに `git apply --check` が通ることだけを確かめています（適用はしていません）。

| パッチ | sha256 の先頭 | 内容 |
|---|---|---|
| `writer-mcp-revision-b.patch` | `8fe7e663ca102761` | 新しいツール `start_revision`・`add_reason_for_update`、`edit_data_module` の `marking`。ツールは 9 つになる。README（英・日）、CHANGELOG（「未リリース（0.6.0 の見込み）」）、`plugin.json` の説明の「7 tools」を「9 tools」に。`package.json` の core への依存（`^0.13.0`）と版は変えていない |
| `s1000d-publish-skill-revision.patch` | `57abe4a78dc9e649` | `references/edit.md` の E1 を分け、E1a（作業中の版を始める）、「変更の印を付けるかを確かめる」、E3 の「変更の印」、E7（理由だけを足す）を足した。SKILL.md と README の前提の writer-mcp を 0.6.0 に。CHANGELOG（「未リリース（0.4.0 の見込み）」） |

`writer-mcp-revision.patch` は途中の版で、消してかまいません。

writer-mcp の 3 つの入口の動きです。

| ツール | 動き |
|---|---|
| `start_revision` | 検証 → core の `startRevision` → `reason` があれば `addReasonForUpdate` → 検証し直す。`write: true` のときは、新しいファイル名で書く（`path` を渡したときは同じフォルダー、`xml` を渡したときは CSDB の書き込み先）。同じ名前があれば `write-conflict`。元のファイルは変えない。理由を足せないときは、版も始めない。XSD のエラーが増えた結果と、取り除いた `id` をほかの DM・PM が指している結果は書かない |
| `add_reason_for_update` | 検証 → core の `addReasonForUpdate` → 検証し直す。`write: true` のときは、`path` のファイルを上書きする |
| `edit_data_module` の `marking` | core の `editContent` にそのまま渡す。応答に `reasonForUpdate` と `changes[].mark` を返す。`_notes` に、次の同じ理由の編集では `marking.reasonRefId` を使うことを書く |

core の `notes` と `refusals[].message` は、core の関数名（`startRevision`・`addReasonForUpdate`・`editContent`）で書いてあります。writer-mcp は、応答に入れるときにツールの名前（`start_revision`・`add_reason_for_update`・`edit_data_module`）に読み替えます。

確かめたことです（2026-11-18 11:04 JST）。

- クラウド側の vitest（core の `dist` を、この回の core に入れ替えた）: 60 件が通った（配布物を使う 2 件はスキップ）。`tsc`・`eslint`・`prettier`（`src`）も通った。
- Mac 側の VM の vitest（`/tmp/writer`。core の `dist` は `/tmp/core` のもの。`S1000D_SPEC_TESTS=1`）: 62 件が通った（スキップなし）。
- `/tmp/writer` でビルドした MCP を stdio で呼んだ（`tools/list` は 9 つ）。Bike Samples を `/tmp/bike` に写し、`…BIKE-AAA-D00-00-00-00AA-121A-A_012-00` に対して、`start_revision`（`changed`、`write: true`）→ `edit_data_module`（remove と、その隣への insert。`marking.reason`）→ `edit_data_module`（同じ親の中の move。`marking.reasonRefId`）→ `add_reason_for_update`（`urt01`）の順に呼んだ。4 回とも、応答の `verification` は XSD が `valid`、BREX が `passed` で、`newSchemaErrors[]` は空だった。作業中の版は `…_012-01_EN-US.XML` に書かれた。
- 同じ DM を `issueType: "status"` で始めると（理由なし、`write` なし）、応答の `verification.brex` は `violations`（1 件）で、`_notes` に BREX-S1-00038 のことが出た。
- 発行済みの版に `add_reason_for_update` を呼ぶと `released-issue` で断り、`message` は `start_revision` を案内した。

確かめていないことです。

- plugin 経由と `s1000d-writer-dev` では呼んでいません（core と writer-mcp の公開、Mac でのビルド、Claude Desktop の起動し直しの後になります）。
- Skill の手順どおりに LLM が動くかは、試していません。手順は、上の stdio の応答の形を見てから書きました。
- writer-mcp の `server.json`・サイト・hub の `stack.json` の説明（ツールの数）は直していません。
- reader-mcp で、印を付けた後の DM を読むことは、この回は行っていません（core の `readContentFromXml` で `changeMarks` が返ることは、core の自作のテストで確かめました）。

### 追記（2026-11-18 11:17 JST）: core のコミット

利用者の指示（2026-11-18 11:16 JST）: コミットまで Claude が行う。署名・確認・push は利用者が行う。

core の 13 ファイルを、`lib/s1000d-core` に 1 つのコミットにしました（`8eb5e36`。署名なし、未 push。`main` は `origin/main` より 1 つ先）。コミットの内容は `work/core-revision-layer2-e.patch` と同じです（コミットの前後の木と、パッチを当てた木を `diff -r` で比べました）。上の表の「コミットしていない」は、この追記の前の状態です。署名を付け直すと、ハッシュは変わります。

writer-mcp と Skill は、パッチのままです（core が npm に出るまでコミットしない、という 6 回目からの決まりのとおり）。

### 追記（2026-11-18 11:55 JST）: core 0.15.0 の公開と、writer-mcp のコミット

- core は 0.15.0 として出ました（利用者の作業。tag `v0.15.0`、npm。`origin/main` と一致）。公開の前に、利用者が Mac で `S1000D_SPEC_TESTS=1 npm test` を実行し、387 件が通りました（2026-11-18 11:23 JST、スキップなし）。CHANGELOG の見出しは、公開の前に `0.15.0 (2026-11-18)` に直しました。
- writer-mcp に `work/writer-mcp-revision-b.patch` を入れ、依存を core `^0.15.0` に上げ、CHANGELOG の見出しを `0.6.0 (2026-11-18)` にして、1 つのコミットにしました（`dd57dcd`。署名なし、未 push）。`package.json` の版は 0.5.1 のままです（`npm version` は利用者が行います）。
- `package-lock.json` は、手で 4 か所だけを直しました（ルートの依存の指定と、core の項目の `version`・`resolved`・`integrity`）。Mac 側の VM の npm（10.9.9）で `npm install` をすると、ほかの項目の `libc` が消える差分が出たので、その結果は使っていません。`libc` を除けば、VM の `npm install` の結果と同じ内容です。
- npm から入れた core 0.15.0 で、Mac 側の VM の vitest（`/tmp/writer2`。`S1000D_SPEC_TESTS=1`）は 62 件が通りました（スキップなし）。`tsc`・`eslint`・`prettier`（`src`）も通りました。コミットしたファイルは、`package-lock.json` のほかは、このときのファイルと同じです（`cmp` で比べました）。
- Skill のパッチ（`work/s1000d-publish-skill-revision.patch`）は、writer-mcp 0.6.0 が出てから入れます。
- Project の文書を置き換えるときに、クラウド側のファイルを `Edit` で直した直後は、`Read` をし直さなくても `project_write` の `local_path` に渡せました。

### 利用者が行うこと

| 順 | 作業 |
|---|---|
| 1 | `lib/s1000d-core` のコミット（`8eb5e36`）を見て、署名を付けて push する。hub の `docs/notes/tm-eval-handoff-8.md` のコミットも同じ |
| 2 | （済み）「決めていないこと」の 1 と 2 は決まり、core に入れた |
| 3 | core を 0.15.0 として公開する（CHANGELOG の見出し、tag、npm）。公開の前に、Mac で `S1000D_SPEC_TESTS=1 npm test` を実行する |
| 4 | （1〜3 は済み）writer-mcp のコミット（`dd57dcd`）を見て、Mac で `npm ci` と `S1000D_SPEC_TESTS=1 npm test` を実行し、署名を付けて、0.6.0 として公開する（`npm version minor`、push、npm、MCP Registry） |
| 5 | writer-mcp の公開の後に、`s1000d-publish-skill` で `git apply` → 0.4.0 として公開する |

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
| 1（決まった。上の追記） | 既にある `reasonForUpdate` を指す入口 | 決まる前は、`marking` を渡した呼び出しのたびに `reasonForUpdate` が 1 つ増える。同じ理由の変更は同じ `reasonForUpdate` を指す、という決まり（Chap 3.9.5.2.1.1 Para 2.1.3）に沿うには、2 回目からの呼び出しで、既にある `id` を指定できる必要がある | `marking.reason` の代わりに `marking.reasonRefId`（文書にある `reasonForUpdate` の `id`）を受け付ける。どちらか一方を必須にする |
| 2（決まった。上の追記） | 印を付けずに `reasonForUpdate` だけを足す入口 | 6 回目から残っている項目（R-4 の補足）。編集上の変更（`urt01`）のほかに、上の `revised`・`status` の版でも要ることが分かった | core に `addReasonForUpdate`（XML と理由 1 つを受け取り、`dmStatus` に足す）を足し、writer-mcp の `start_revision` の入力にも理由を受け取れるようにする |
| 3 | outline の `textLocations` | outline に付けるか、説明文と `_notes` を直すか | 説明文と `_notes` を「`content`・`all` のときだけ」と直す |

7 回目の「決めていないこと」（`applyFix`・`applySegments` の寄せ方、`text` にまとめた `para` の `id`・`applicRefId`、PM の `reasonForUpdate`、Skill `s1000d-review` の観点）は、そのまま残っています。

## 最初にやること

1. **状態を確かめる。** `lib/s1000d-core` で `git status -sb` と `git log --oneline -3` を見ます。core が 0.15.0 として出ているかを、`package.json`・tag・npm で見ます。
2. **core が出ていれば、writer-mcp にパッチを入れる。** `work/writer-mcp-revision-b.patch` を `git apply` し、依存を core `^0.15.0` に上げます。Mac 側の VM で、配布物を使う vitest を実行します。
3. **writer-mcp が出ていれば、Skill にパッチを入れる。** `work/s1000d-publish-skill-revision.patch` です。
4. **Desktop 経由で確かめる。** `s1000d-writer-dev` と plugin 版で、上の stdio と同じ 4 つの呼び出しを行います（Bike Samples の写しを、接続したフォルダーの中に作ってから。`specs/` の中のファイルには書かない）。印を付けた後の DM を reader で読み、`changeMarks`・`reasonForUpdates` を見ます。Skill の手順どおりに 1 件を通します。
5. **文書を直す。** `design/core-revision.md`（「案」を実装の結果に直し、「確かめること」の 3 つの結果と、この回の 3 つの決定を書く）、`DECISIONS.md`（この回の 3 つの決定。D-33 の補足か、新しい番号か）、`design/writer-mcp.md`、`design/skills-and-editor.md`、`notes/tm-eval-progress.md`、サイト、hub の `stack.json` の説明。その後に、Project の古い 4 つの文書（7 回目の表）と合わせて反映します。

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
