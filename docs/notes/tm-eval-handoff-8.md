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

### 追記（2026-11-18 12:26 JST）: writer-mcp 0.6.0 の公開、Skill のコミット、Desktop 経由の確認

- writer-mcp は 0.6.0 として出ました（利用者の作業。npm、MCP Registry、tag。`origin/main` と一致）。公開の前に、利用者が Mac で `npm ci` と `S1000D_SPEC_TESTS=1 npm test` を実行し、62 件が通りました（2026-11-18 12:00 JST）。claude-plugins の台帳は 31 件とも一致、hub の `stack.json` は core 0.15.0・writer-mcp 0.6.0 です（利用者が実行した `marketplace-version-check.mjs` と `generate-stack.mjs` の出力）。
- Skill `s1000d-publish` に `work/s1000d-publish-skill-revision.patch` を入れ、CHANGELOG の見出しを `0.4.0 (2026-11-18)` にして、1 つのコミットにしました（`3ce6a18`。署名なし、未 push）。`plugin.json` の版は 0.3.2 のままです。

Desktop 経由で、`s1000d-writer-dev` と plugin 版（`s1000d-writer`）の両方を呼びました（2026-11-18 12:22 JST）。Bike Samples の XML 118 件を、評価フォルダーの `work/REV-dev/` と `work/REV-plugin/` に写し、`S1000DBIKE-AAA-D00-00-00-00AA-121A-A_012-00` を対象にしました。dev と plugin で、4 回とも同じ応答でした。

| 順 | 呼び出し | 応答 |
|---|---|---|
| 1 | `start_revision`（`issueType: "changed"`、`write: true`） | `started: true`。`fileName` は `…_012-01_EN-US.XML`。`removed.reasonForUpdate` は 1。XSD は `valid`、BREX は `passed` |
| 2 | `edit_data_module`（remove と、その隣への insert。`marking.reason` は `urt02`） | `reasonForUpdate` は `rfu-0001`・`added: true`。`changes[0]` は `kept: true` と `delete` の印、`changes[1]` は `add` の印。XSD は `valid`、BREX は `passed` |
| 3 | `edit_data_module`（同じ親の中の move。`marking.reasonRefId: "rfu-0001"`） | `reasonForUpdate.added` は `false`。親の `proceduralStep[1]` に `modify` の印 |
| 4 | `add_reason_for_update`（`urt01`） | `added: true`。`reasonForUpdate` は `rfu-0002` |

その後に確かめたことです。

- `s1000d-reader-dev` で、書かれた `…_012-01` を読んだ。`identAndStatus.issueInfo` は `012-01`、`issueType` は `changed`、`reasonForUpdates` は 2 件（`rfu-0001`・`urt02`、`rfu-0002`・`urt01`）、`content.changeMarks` は 3 件（`modify`・`delete`・`add`。どれも `rfu-0001` を指す）だった。
- 発行済みの版のファイル（`…_012-00`）は、`REV-dev/`・`REV-plugin/` のどちらでも、`specs/` の元のファイルと同じだった（`cmp`）。dev と plugin が書いた `…_012-01` も、互いに同じだった。
- どの応答でも `verification.references` は `unresolved`（2 件）だった。図のファイル（ICN）を写していないためで、編集とは関係が無い。

分かったことです。

| 分かったこと | 扱い |
|---|---|
| `start_revision` の `_notes` に、「元の版は変えない」という内容の文が 2 つ並ぶ（writer-mcp が足す文と、core の `notes` の文） | 未着手。core の文を応答に入れないか、writer-mcp の文を短くする |
| Claude Desktop を起動し直すと、接続したフォルダーでの削除の許可が切れ、Mac 側の VM の `/tmp` も消える。許可が切れたままコミットすると、コミットはできるが、`.git/HEAD.lock` と `.git/objects/*/tmp_obj_*` が残る | Skill のリポジトリで 1 度起きた。`HEAD.lock` を別の名前に移し、許可をもらい直してから消した。コミットの前に、許可があるかを `rm` できるファイルで確かめる |

確かめていないことです。

- Skill の手順どおりに LLM が動くかは、試していません（Skill 0.4.0 が plugin に出た後に、1 件を通します）。
- `start_revision` に `reason` を渡す場合、`issueType` が `revised`・`status` の場合、断る場合（`released-issue`・`write-conflict` など）は、Desktop 経由では呼んでいません（自作のテストと、VM の stdio で確かめました）。

### 追記（2026-11-18 12:55 JST）: 文書を直した（「最初にやること」の 5）

Skill `s1000d-publish` は 0.4.0 として出ました（利用者の作業。hub の `f99dc60`、`stack.json` の `local.version` は 0.4.0）。その後に、「最初にやること」の 5 を行いました。

| 直したもの | 内容 |
|---|---|
| `docs/design/core-revision.md` | 状態を「実装済み、公開済み」にした。「案」の節を「実装」に書き直した（`startRevision`、`marking`、`addReasonForUpdate`、writer-mcp、Skill）。「実装のときに決めたこと」「設計と違う点、設計に無かった点」「確かめた結果」「残っている確認」「テストと確認の結果」を足した |
| `docs/DECISIONS.md` | この回の 3 つの決定を、新しい番号の D-35 にした。D-33 と D-34 の「実装はしていない」「未公開」を、公開した版に直した |
| `docs/design/writer-mcp.md` | 「ツール案」の表に `start_revision`・`add_reason_for_update` と、`edit_data_module` の `marking` を足した。「改版の入口」の節を足した |
| `docs/design/skills-and-editor.md` | `s1000d-publish` の必須の MCP と最低版（writer 0.6.0、reader 0.13.0）、E1a・E7・変更の印の手順を足した。「手順の段落だけを取り除く・移すことはできない」という古い文を外した |
| `docs/notes/tm-eval-progress.md` | 「改版（層 2）」の節を足した。「読み取りに足した」の節に、3 つとも公開済みであることを書いた。「残り」の表を直した |
| サイト（日本語・英語） | `mcp/writer-mcp`（ツールは 9 つ。「発行済みのデータモジュールを直す」の節）、`skill/s1000d-publish`（手順を 9 段に。最低版）、`lib/s1000d-core`（「改版の操作」の節。「できること」の表に `editContent`・`startRevision`・`addReasonForUpdate`）、`mcp/reader-mcp`（「更新の理由と変更の印」の節、`textLocations`） |
| `stack.json`・`scripts/generate-stack.mjs`・README（英・日） | core・writer-mcp・`s1000d-publish` の説明（`note`）と、README の writer-mcp の行。writer-mcp の説明は「6 tools」のままだったので、9 つの名前に直した |

確かめたことです。

- サイトの `node scripts/check-i18n.mjs` は、どのページも `ok` だった（日本語と英語で、見出し・表・図の数と順が合っている）。
- サイトを Mac 側の VM の `/tmp/site-check` に写し、`npm ci` と `astro build` を実行した。47 ページができた。直した 8 ページの中の、サイト内のリンク 302 本は、行き先のページと見出しがすべてあった。
- `stack.json` は JSON として読めた。`generate-stack.mjs` は実行していない（説明の文字列を、スクリプトと `stack.json` の両方で同じに直した）。

確かめていないことです。

- 英語のページは、日本語から自分で訳した。xcomet での採点と、DeepL の訳との比較は行っていない（[en-writing-guide.md](./en-writing-guide.md) の手順の一部）。
- 足した Mermaid の図 3 つ（設計文書 1 つ、サイトの 2 ページ）は、ブラウザーで描画を見ていない。

分かったことです。

| 分かったこと | 扱い |
|---|---|
| core の CHANGELOG（0.15.0）は「配布物を使うテストを 3 件足しました」と書いているが、`src/revision/revision.spec.test.ts` のテストは 4 件ある（4 件目は `addReasonForUpdate` のテスト） | 設計文書には 4 件と書いた。CHANGELOG は直していない |
| サイトには、reader-mcp 0.13.0 の内容（`reasonForUpdates`・`changeMarks`・`textLocations`）が無く、「手順の段落だけを取り除く・移すことはできません」のままだった。`lib/s1000d-core` のページは「現在の版は 0.8.0 です」のままだった | この回に直した |
| Mac 側の VM のホーム（`/sessions`）は空きが 11 MB だが、`/tmp` に写せば、サイトの `npm ci`（`--cache /tmp/npm-cache`）とビルドができる | 作業の仕方の記録 |

### 利用者が行うこと

| 順 | 作業 |
|---|---|
| 1 | `lib/s1000d-core` のコミット（`8eb5e36`）を見て、署名を付けて push する。hub の `docs/notes/tm-eval-handoff-8.md` のコミットも同じ |
| 2 | （済み）「決めていないこと」の 1 と 2 は決まり、core に入れた |
| 3 | core を 0.15.0 として公開する（CHANGELOG の見出し、tag、npm）。公開の前に、Mac で `S1000D_SPEC_TESTS=1 npm test` を実行する |
| 4 | （1〜3 は済み）writer-mcp のコミット（`dd57dcd`）を見て、Mac で `npm ci` と `S1000D_SPEC_TESTS=1 npm test` を実行し、署名を付けて、0.6.0 として公開する（`npm version minor`、push、npm、MCP Registry） |
| 5 | （4 は済み）`s1000d-publish-skill` のコミット（`3ce6a18`）を見て、署名を付け、0.4.0 として公開する（`plugin.json` の版、tag、push、claude-plugins の台帳、hub の `stack.json`） |
| 6 | （5 は済み）hub の文書とサイトのコミットを見て、署名を付けて push する。サイトを公開し直す |
| 7 | 評価フォルダーの `work/REV-dev/`・`work/REV-plugin/`（Bike Samples の XML の写しと、作業中の版 1 件ずつ）は、確認が済んだら消してかまわない。配布物の写しなので、リポジトリには入れない |

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
次の 2〜4 のうち、2・3 と、4 の Skill の試行のほかは、2026-11-18 12:26 JST までに済みました（上の追記）。残っているのは、Skill 0.4.0 が plugin に出た後に手順どおりに 1 件を通すことと、5 です。

2. **core が出ていれば、writer-mcp にパッチを入れる。** `work/writer-mcp-revision-b.patch` を `git apply` し、依存を core `^0.15.0` に上げます。Mac 側の VM で、配布物を使う vitest を実行します。
3. **writer-mcp が出ていれば、Skill にパッチを入れる。** `work/s1000d-publish-skill-revision.patch` です。
4. **Desktop 経由で確かめる。** `s1000d-writer-dev` と plugin 版で、上の stdio と同じ 4 つの呼び出しを行います（Bike Samples の写しを、接続したフォルダーの中に作ってから。`specs/` の中のファイルには書かない）。印を付けた後の DM を reader で読み、`changeMarks`・`reasonForUpdates` を見ます。Skill の手順どおりに 1 件を通します。
5. **（済み。2026-11-18 12:55 JST の追記）文書を直す。** `design/core-revision.md`（「案」を実装の結果に直し、「確かめること」の 3 つの結果と、この回の 3 つの決定を書く）、`DECISIONS.md`（この回の 3 つの決定。D-33 の補足か、新しい番号か）、`design/writer-mcp.md`、`design/skills-and-editor.md`、`notes/tm-eval-progress.md`、サイト、hub の `stack.json` の説明。その後に、Project の古い 4 つの文書（7 回目の表）と合わせて反映します。

## Project の文書

| 文書 | Project の状態 |
|---|---|
| `docs/notes/tm-eval-handoff-8.md`（この文書） | hub と同じ（2026-11-21 13:00 JST ごろに、2026-11-21 の 2 つの追記を含めて反映した） |
| `docs/design/core-revision.md`・`docs/design/writer-mcp.md`・`docs/design/skills-and-editor.md`・`docs/design/reader-mcp.md` | hub と同じ（同上。クラウド側の写しと hub のファイルの sha256 が合うことを確かめた） |
| `docs/DECISIONS.md`・`docs/notes/tm-eval-progress.md` | hub と同じ（2026-11-20 に、古い節を別の文書に分けてから反映した。下の追記） |
| `docs/DECISIONS-archive.md`・`docs/notes/tm-eval-progress-1.md` | hub と同じ（2026-11-20 に分けて作り、反映した。下の追記） |
| `docs/design/core-structural-edit.md` | hub と同じ（2026-11-20 16:34 JST ごろに反映した） |
| `docs/notes/tm-eval-handoff-7.md` | hub と同じ（2026-11-18 06:02 JST に反映した） |

残った 3 つは、次のチャットの最初に反映します。既にある文書を置き換えるには、その会話で `project_read` をしてから、写したファイルを `Read` で全部読む必要があり、`project_read` は 42 KB の文書でも本文を応答にそのまま返します。3 つで 300 KB ほどを読むことになるので、この回は行いませんでした。

`docs/design/reader-mcp.md` は、hub の「0.13.0、未公開」の 2 か所を「0.13.0」に直してから反映しました。

### 追記（2026-11-20 16:45 JST）: 残った 3 つの反映と、文書の分割

上の「残った 3 つ」を、次のチャットで反映しました。上の表は、反映した後の状態に直してあります。

- `docs/design/core-structural-edit.md` は、hub のファイルをそのまま反映しました。
- `docs/DECISIONS.md` と `docs/notes/tm-eval-progress.md` は、hub のファイルのままでは反映できませんでした。`Read` は「25,137 トークン」「25,106 トークン」で、1 回の上限（25,000 トークン）を超えると断りました。`offset` と `limit` で 2 回に分けて全部を読んでも、写したファイルを `Edit` で 1 文字足して戻しても、`project_write` の `local_path` は「ファイルの全体を読むこと」を求めて断りました。
- 利用者の決定（2026-11-20 16:37 JST ごろ）: hub の文書を分け、古い節をまとめて別の文書に移す。

| 元の文書 | 移した範囲 | 移した先 | 分けた後の大きさ |
|---|---|---|---|
| `docs/DECISIONS.md`（63,950 バイト） | D-01〜D-20 | `docs/DECISIONS-archive.md`（26,099 バイト） | 38,584 バイト |
| `docs/notes/tm-eval-progress.md`（61,446 バイト） | 「順 1〜3 の要点」から「BREX の修正候補と、Bike Samples の残り 13 個」までの 10 個の節（2026-11-16 まで） | `docs/notes/tm-eval-progress-1.md`（35,349 バイト） | 27,917 バイト |

- 移した節の本文は変えていません（分ける前のファイルの行と、移した先の行を比べました）。元の文書には、移した先へのリンクを置きました。
- D-11・D-14・D-15・D-16 を `docs/DECISIONS.md` の決定として指していた 5 か所（README の英語と日本語、`docs/ROADMAP.md`、サイトの `mcp/verify-mcp` の日本語と英語）は、`DECISIONS-archive.md` を指すように直しました。README の構成の図にも `DECISIONS-archive.md` の行を足しました。サイトの `node scripts/check-i18n.mjs` は、どのページも `ok` でした。
- ほかの文書が D-01〜D-20 を指している箇所は、直していません。`docs/notes/handoff.md` の 2 か所は「DECISIONS.md（D-01〜）」のようにファイル名と一緒に書いていて、残りは番号だけです（`DECISIONS.md` と番号が近くに並ぶ箇所を `grep` で探した結果です）。2 回目・3 回目の引き継ぎは、移した節を「tm-eval-progress.md の「…」」と書いています。記録なので、直していません。
- 次に `Read` の上限を超えるまでの余裕は、`DECISIONS.md` のほうが小さいです（分けた後で 38,584 バイト。超えたのは 63,950 バイトのとき）。

### 追記（2026-11-21 10:45 JST）: Skill 0.4.0 の試行の結果と、その確認

Skill `s1000d-publish` 0.4.0 の改版の手順（E1 → E1a → 変更の印を付けた編集 → E6 → E7）は、2026-11-20 17:09 JST に、plugin 版の MCP で 1 件を最後まで通しました（別のチャット）。その結果は、hub の文書に書いていませんでした。ここに記録します。

| 項目 | 内容 |
|---|---|
| 対象 | 評価フォルダーの `work/REV-skill/`（Bike Samples の XML 118 件の写し）の `S1000DBIKE-AAA-DA2-10-00-00AA-520A-A`（発行済みの版 012-00） |
| 作業中の版 | `start_revision`（`issueType` は `changed`。利用者の指定）で、`…_012-01_EN-US.XML` を書いた。消えた前の版の更新の理由は 1 件 |
| 編集（1 回の呼び出し。`marking.reason`、`changeMark` は `"1"`） | 手順 2.3 を 2.2 の前に移す（親の手順 2 に `modify`）、手順 2.4 を取り除く（`delete` の印で残る）、手順 2.1 の前に注記を足す（`add`）。3 つとも `rfu-0001`（`urt03`）を指す |
| E7 | `add_reason_for_update` で `rfu-0002`（`urt01`）を足した |

2026-11-21 10:39 JST に、書かれたファイルを確かめ直しました。

- plugin 版の `verify_data_module`: XSD は `valid`、BREX は `passed`（2 層。人の確認が要る項目は 3 件）、参照は `unresolved` が 1 件（図のファイル `ICN-C0419-S1000D0387-001-01` を写していないため）。
- plugin 版の `read_data_module`: `issueInfo` は `012-01`、`content.changeMarks` は 3 件（手順 2 に `modify`、`note` に `add`、`proceduralStep[4]` に `delete`。どれも `rfu-0001` を指す）。
- `work/REV-skill/` の 119 件のうち、`specs/` の元のファイルと違うのは、新しく書かれた `…_012-01` の 1 件だけだった（`cmp`）。発行済みの版（`…_012-00`）は元のファイルと同じ。
- hub・core・writer-mcp・reader-mcp・Skill の 5 つのリポジトリは、どれも `origin/main` と一致し、未コミットの変更は無かった。

試行で分かった、Skill の手順の足りない点です（直していません）。

| # | 分かったこと | 直す案 |
|---|---|---|
| 1 | E1 は `inWork` しか見ない。reader の応答で `issueType` が `deleted` と分かっていても、版の扱いと `issueType` を聞いた後に `deleted-issue` で断られる | E1 の 2 に「`issueType` が `deleted` なら、作業中の版は始められないと先に伝える」を足す |
| 2 | SKILL.md の「CSDB にある DM を直したいと頼まれたとき」の表の最後の行（「版を上げて変更の印を付ける操作は、writer にまだ無い」）が古いまま残り、2 つ上の行と食い違う | 「発行（発行番号を上げる）は扱わない」に書き直す |
| 3 | E1a の 6 で読み直すときに `section: "outline"` を使うと、`textLocations` が付かない（「決めていないこと」の 3 を、手順の中で踏んだ） | 「決めていないこと」の 3 の決定と合わせて、E2 に「`section` は `content` か `all`」と書く |
| 4 | 置き換えの説明（E3）は「元の節点の `after` か `before` への insert」だけを書いている。手順を注記に置き換える場合は、入れ子の手順より前にしか置けないので、別の場所への insert になる | E3 に、種類が変わる置き換えは XSD の並びの順に合う場所へ足す、と 1 文足す |
| 5 | 聞く項目が多い（対象、版の扱い、`issueType`、変更の種類、理由の文と種類、`changeMark`、書き込みの確認 2 回）。1 度にまとめて聞いてよい項目が、手順からは分からない | E1a と「変更の印を付けるかを確かめる」に、まとめて聞ける組を書く |

writer-mcp について分かったことです。

- `add_reason_for_update` の `_notes` にも、「本文と変更の印は変えていない」という内容の文が 2 つ並ぶ（`start_revision` と同じ形の重なり）。
- `edit_data_module` と `add_reason_for_update` は、`path` を渡せば、`overwrite` を付けなくても上書きする。

試行のときに手順から外れた点は 2 つです。E7 の 3（足される理由を示して、確認の後に書く）は、理由の文と種類を先に選んでもらったので、書かずに呼んだ結果を示さずに書き込みました。注記の文を変えた後は、書かずに呼び直さずに書き込みました。

残っていることです。

- 上の 1〜5 を Skill に直す。writer-mcp の `_notes` の重なり（`start_revision`・`add_reason_for_update`）を直す。「決めていないこと」の 3（outline の `textLocations`）を決める。3 つは互いに関わるので、1 回にまとめる。
- `work/REV-dev/`・`work/REV-plugin/`・`work/REV-skill/` は、確認が済んだら消してかまわない（配布物の写しなので、リポジトリには入れない）。
- この追記は、Project の文書に反映していない（2026-11-21 13:00 JST ごろに反映した）。

### 追記（2026-11-21 10:55 JST）: Skill の手順の修正（0.4.1 の見込み）

利用者の決定（2026-11-21 10:45 JST ごろ）: 「決めていないこと」の 3（outline の `textLocations`）は、outline には付けないままにし、reader-mcp の説明文と `_notes` を「`content`・`all` のときだけ」と直す。この回は Skill だけを直し、writer-mcp と reader-mcp のコードの変更は次のチャットで行う。

上の追記の表の 1〜5 を、`skill/s1000d-publish-skill` に 1 つのコミットにしました（署名なし、未 push）。`plugin.json` の版を 0.4.1 に上げ、CHANGELOG の見出しを `0.4.1 (2026-11-21)` にしてあります。手順の文だけの変更です。

| # | 直した場所 | 内容 |
|---|---|---|
| 1 | `references/edit.md` の E1 | reader の応答の `identAndStatus.issueType` も見る。`deleted` なら、版の扱いを聞く前に、作業中の版は始められないと伝える |
| 2 | SKILL.md の表の最後の行 | 扱わないのは発行（発行番号を上げること）だけ、と書き直した |
| 3 | E1・E1a の 6・E2 | 場所を得るための読み取りは、`section` を `content` か `all` にする（E1 は、識別・状態部も要るので `all`） |
| 4 | E3 | 種類が変わる置き換えは、並びの順に合う場所への insert にする |
| 5 | 新しい節「利用者に聞く項目のまとめ方」 | まとめて聞いてよい組を 4 つに分けた。書き込みの確認は、書かずに呼んだ結果を見せた後にだけ聞く |
| — | E6・「やらないこと」 | `path` のファイルは上書きされるので `overwrite` を付けない。確認の後に編集・文・値を変えたら、書かずに呼び直す（試行のときに手順から外れた 2 点） |

確かめていないことです。

- 直した手順どおりに LLM が動くかは、試していません。
- `edit_data_module` が `overwrite` なしで `path` のファイルを上書きすることは、2026-11-18 の Desktop 経由の呼び出しと設計文書の記述によります。2026-11-20 の試行で `overwrite` なしを確かめたのは `add_reason_for_update` だけです。

次のチャットで行うことです。

1. Skill 0.4.1 のコミットを利用者が見て、署名を付けて公開する（tag、push、claude-plugins の台帳、hub の `stack.json`）。
2. writer-mcp: `start_revision` と `add_reason_for_update` の `_notes` の、同じ内容の文の重なりを直す。
3. reader-mcp: `includeLocation` の説明文と `_notes` を、「`textLocations` は `section` が `content`・`all` のときだけ」と直す。サイトの `mcp/reader-mcp`（日・英）も合わせる。
4. この文書（2026-11-21 の 2 つの追記）を、Project に反映する。

### 追記（2026-11-21 13:15 JST）: writer-mcp と reader-mcp の文の修正

上の「次のチャットで行うこと」の 1 と 4 は済みました（1 は利用者の作業。Skill `s1000d-publish` 0.4.1 は公開済みで、hub は `3d6f9c1`。4 は、この回の最初に、この文書を Project に反映しました）。2 と 3 を行い、writer-mcp・reader-mcp・hub に 1 つずつコミットしました（署名なし、未 push）。どちらも `package.json` の版は変えていません（`npm version` は利用者が行います）。

| リポジトリ | コミット | 内容 |
|---|---|---|
| `mcp/s1000d-writer-mcp` | `5515ed4` | `start_revision` の `_notes` から「発行済みの版は変えない」の部分を、`add_reason_for_update` の `_notes` から「本文と変更の印は変えていない」の部分を外した。どちらも core の `notes` の文が同じことを書くので、core の文を残した（core を直すと公開が要るため）。CHANGELOG は「未リリース（0.6.1 の見込み）」 |
| `mcp/s1000d-reader-mcp` | `8491202` | `includeLocation` の説明に、`textLocations` は `section` が `content`・`all` のときだけ付き、概要には付かないことを書いた。`_notes` は、`section: "outline"` のときに、`textLocations` が付かないことと、`content` か `all` で読み直すことを書く（これまでは、付くように書いていた）。README（英・日）も合わせた。CHANGELOG は「未リリース（0.13.1 の見込み）」 |
| hub | この追記と同じコミット | サイトの `mcp/reader-mcp`（日・英）と `skill/s1000d-publish`（日・英）の 4 段目、`docs/design/reader-mcp.md`、`docs/design/skills-and-editor.md` の E2 を、上の決まりに合わせた |

確かめたことです（Mac 側の VM。`/tmp/writer`・`/tmp/reader` に写し、`npm ci` をしてから。`S1000D_SPEC_TESTS=1`）。

- writer-mcp の vitest は 62 件、reader-mcp の vitest は 34 件が通った（スキップなし）。`tsc`・`eslint`・`prettier`（`src`）も通った。
- 足したテストの確かめ（writer-mcp の 2 つ、reader-mcp の 1 つ）は、直す前の `handlers.ts` に戻すと落ちた。writer-mcp の 2 つは、1 つずつ戻して、それぞれ落ちることを見た。
- コミットした木と、テストした木の違いは、どちらも CHANGELOG だけだった（テストの後に書いた）。
- サイトの `node scripts/check-i18n.mjs` は、どのページも `ok` だった。サイトのビルドはしていない（直したのは段落の中の文だけ）。

確かめていないことです。

- plugin 経由と dev の MCP では呼んでいません（公開と、Mac でのビルドの後になります）。
- サイトの `skill/s1000d-publish` は、Skill 0.4.1 のほかの変更（E1 で `issueType` が `deleted` かを見ること、聞く項目のまとめ方）を、まだ書いていません。

利用者が行うことです。

| 順 | 作業 |
|---|---|
| 1 | writer-mcp（`5515ed4`）を見て、Mac で `npm ci` と `S1000D_SPEC_TESTS=1 npm test` を実行し、CHANGELOG の見出しを `0.6.1 (日付)` に直して、0.6.1 として公開する（`npm version patch`、push、npm、MCP Registry） |
| 2 | reader-mcp（`8491202`）も同じく、0.13.1 として公開する |
| 3 | hub のコミットを見て、署名を付けて push する。サイトを公開し直す。2 つが出た後に、claude-plugins の台帳と hub の `stack.json` を合わせる |

次に行うことの候補です。

- サイトの `skill/s1000d-publish`（日・英）に、Skill 0.4.1 のほかの変更を書く。
- 7 回目から残っている「決めていないこと」（`applyFix`・`applySegments` の寄せ方、`text` にまとめた `para` の `id`・`applicRefId`、PM の `reasonForUpdate`、Skill `s1000d-review` の観点）。
- `work/REV-dev/`・`work/REV-plugin/`・`work/REV-skill/` と、`work/` の途中の版のパッチを消す（利用者の確認の後）。

## 作業の仕方（7 回目からの追加）

| 項目 | 内容 |
|---|---|
| Mac の作業コピーへのパッチ | 削除の許可が無くても、`git apply` は適用できる（`unable to unlink` の警告が出るが、ファイルは書き換わる）。`git apply --check -R` が通ることと、`/tmp` の作業コピーとの `cmp` で確かめた。`.git` にロックファイルは残らなかった |
| 配布物を使う vitest の実行 | 全体で 35 秒ほど。`nohup … > /tmp/core/vitest.log &` で動かし、`sleep` の後にログの末尾を読む。`NO_COLOR=1` を付ける |
| 失敗したテストの出力 | 文書の全体を `expect` に渡すと、失敗したときに XML が丸ごと出る。先に `dist` をビルドして、数だけを出すスクリプト（`node stat.mjs`）で実測する |
