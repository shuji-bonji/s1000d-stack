# 引き継ぎメモ（2026-10-27 19:55 JST 時点）

新しいチャットで s1000d-stack の作業を続けるための要約です。経緯の詳細は [ROADMAP.md](../ROADMAP.md)・[DECISIONS.md](../DECISIONS.md)・[background.md](./background.md) にあり、このメモはそれらへの入口です。

> [!IMPORTANT]
> 作業の前提は次の 3 つです。
> 1. DECISIONS.md の決定事項（D-01〜D-25）は覆さない。変える必要があると判断したときは、理由を挙げて先に相談する。
> 2. S1000D の仕様書・XSD・既定 BREX・公式サンプルは、どのリポジトリにも npm パッケージにもコミットしない（D-03）。置き場所は `s1000d-stack/specs/s1000d/`（git 管理外、D-06）。
> 3. `docs/` の文書（ROADMAP・DECISIONS・notes/ の 6 本・design/ の 4 本）は、ローカル `s1000d-stack/docs/` と claude.ai Project「S1000D Stack」のナレッジの両方に同じ内容を置く。片方だけ直さない。
> 4. サイトと README は英語がルート、日本語が `/ja/` と `README.ja.md`（D-22）。一次執筆は日本語で、英語は `notes/glossary.md` と `notes/en-writing-guide.md` に従って訳す。ページの完了条件は「日本語と英語の両方が揃うこと」。

## いまどこにいるか

```mermaid
flowchart LR
  S1["段階 1<br/>hub ＋ core ＋ brex"] --> S2["段階 2<br/>reader ＋ verify ＋ model"]
  S2 --> S25["段階 2.5<br/>修正提案 ＋ 組み込みの土台"]
  S25 --> S3["段階 3<br/>writer ＋ Skill ＋ 作成ツール"]
  S3 --> S4["段階 4<br/>閲覧ソフト"]
  style S1 fill:#dfe,stroke:#393
  style S2 fill:#dfe,stroke:#393
  style S25 fill:#ffd,stroke:#993
```

**段階 1 は 2026-10-24 に、段階 2 は 2026-10-26 に完了しました。** 段階 2 の設計は `docs/design/` の 3 文書（[verify-mcp.md](../design/verify-mcp.md)、[reader-mcp.md](../design/reader-mcp.md)、[manual-model.md](../design/manual-model.md)）、作業の順序と結果は ROADMAP「段階 2 の作業」の表（作業 1〜10）にあります。2026-10-26 に作業 10（公開）を行い、4 パッケージ（experiential-manual-model・brex-mcp・verify-mcp・reader-mcp）の 0.1.0 を npm に公開し、4 リポジトリと hub を Public にし、学習サイトを GitHub Pages に配備しました。経過は下の「作業 10 の記録」にチェックリストのまま残してあります。**2026-10-27 未明に作業 11（D-23）として、MCP 3 本の 0.1.1 を出し、MCP Registry（`io.github.shuji-bonji/*`、`active`）と claude-plugins marketplace（category `s1000d`、0.7.0）に載せました。** 手順は pdf-agent-stack の `docs/specs/30-registry-and-marketplace-release.md` と同じで、各リポジトリの `docs/RELEASE.md` に手順 6 として足してあります。

**次の目標は「CSDB 製品に組み込める基盤」（D-19）で、段階 2.5**（修正提案・`CsdbSource`・HTTP transport・DML/DDN・概要モード・機密区分）です。作業 1〜2（修正提案）は 2026-10-27 に実装・公開済み（core 0.3.0、verify-mcp 0.2.0）。**作業 3（`CsdbSource`）は 2026-10-27 に済みました**: core 0.5.0 を 18:40 JST 頃に公開し、reader-mcp・verify-mcp を `index.read()` に切り替え、19:25 JST 頃に両方とも 0.4.0 を npm・MCP Registry・claude-plugins（marketplace）に公開しました。**作業 4（HTTP transport）も 19:40 JST 頃に 3 本の MCP へ実装しました**（`--http`。コミット済み・未 push・未公開）。結果は ROADMAP「進捗（段階 2.5）」と design/agent-platform.md「組み込みに要る広げ方」の実装の記録にあります。設計は design/agent-platform.md。LLM 活用時の注意点 5 つへの対応と、段階 4 の最初の成果物にする簡易な技術マニュアルの Web システム（基盤の参照実装、技術は U-10）も同じ設計文書に記録してあります。

2026-10-26 の日中には、サイトの章立てを houki-hub に揃え（D-20）、ロゴを六角形のスタックに決め（D-21）、英語をルートにして日本語を `/ja/` と `README.ja.md` にしました（D-22）。サイト 14 ページ × 2 言語と README 6 本 × 2 言語が揃い、`npm run check:i18n`（`site/scripts/check-i18n.mjs`）で構造の一致を検査できます。`scripts/generate-stack.mjs --readme` は両 README の表を更新します。経過は notes/i18n-trial.md。

## リポジトリの状態

| リポジトリ | 公開 | npm | 状態 |
|---|---|---|---|
| [shuji-bonji/s1000d-core](https://github.com/shuji-bonji/s1000d-core) | Public | `@shuji-bonji/s1000d-core` **0.5.0**（2026-10-27 18:40 JST 頃、タグ push → `publish.yml`） | 公開は `docs/RELEASE.md` の手順（`npm version` でタグを付けて push）。0.3.0 で修正提案 `suggestFixes`（段階 2.5 の作業 1）、0.4.0 で設定ファイル `resolveStackConfig`（D-25）、0.5.0 で `CsdbSource`（作業 3）。main は origin と一致 |
| [shuji-bonji/s1000d-brex-mcp](https://github.com/shuji-bonji/s1000d-brex-mcp) | Public | `@shuji-bonji/s1000d-brex-mcp` **0.3.0**（2026-10-27 15:10 JST 頃、`publish.yml` 経由。core `^0.4.0`） | 0.2.0 で `list_notations` の `effectiveFor` に `mode` / `excluded`、0.3.0 で設定ファイル（D-25）。npm・MCP Registry・claude-plugins とも 0.3.0。**main に未 push のコミット `04ae6e6`（`--http`、作業 4、署名なし）がある。次の公開は 0.4.0（core の依存は `^0.4.0` のままで動くが、公開時に `^0.5.0` へ揃える）。**[Issue #1](https://github.com/shuji-bonji/s1000d-brex-mcp/issues/1) は開いたまま |
| [shuji-bonji/s1000d-verify-mcp](https://github.com/shuji-bonji/s1000d-verify-mcp) | Public | `@shuji-bonji/s1000d-verify-mcp` **0.4.0**（2026-10-27 19:25 JST 頃、`publish.yml` 経由。core `^0.5.0`） | 0.2.0 で 6 ツール目 `suggest_fixes`、0.3.0 で設定ファイル、0.4.0 で `verify_csdb` を `index.read(o)` に（作業 3）。npm・MCP Registry・claude-plugins とも 0.4.0。**main に未 push のコミット `01794be`（`--http`、作業 4、署名なし）がある。次の公開は 0.5.0。**[Issue #1](https://github.com/shuji-bonji/s1000d-verify-mcp/issues/1) は開いたまま |
| [shuji-bonji/s1000d-reader-mcp](https://github.com/shuji-bonji/s1000d-reader-mcp) | Public | `@shuji-bonji/s1000d-reader-mcp` **0.4.0**（2026-10-27 19:25 JST 頃、`publish.yml` 経由。core `^0.5.0`） | 0.2.0 で ACT・CCT・PCT の探索を core の `findApplicTables` に切り替え、0.3.0 で設定ファイル、0.4.0 で CSDB の中身を `index.read(o)` で読む（作業 3）。npm・MCP Registry・claude-plugins とも 0.4.0。**main に未 push のコミット `5bf0783`（`--http`、作業 4、署名なし）がある。次の公開は 0.5.0。**[Issue #1](https://github.com/shuji-bonji/s1000d-reader-mcp/issues/1) は開いたまま |
| [shuji-bonji/experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model) | Public | `@shuji-bonji/experiential-manual-model` **0.1.0**（2026-10-26 16:26 JST、同上） | 型・JSON Schema・`validateManual`・`fromLegacyJson`。`schema/` と `examples/` も配布物に含む |
| [shuji-bonji/s1000d-stack](https://github.com/shuji-bonji/s1000d-stack)（hub） | Public（2026-10-26） | — | 学習サイトは https://shuji-bonji.github.io/s1000d-stack/ （英語。日本語は `/ja/`）。`deploy.yml` は `main` への push（`site/**` と自身）で配備、`stack-check.yml` は毎日。**git のコミットはチャットから行ってよい**（2026-10-24 に利用者が指示。接続フォルダーの削除の許可を得れば git のロックファイルも消せる）。署名は利用者が後で付け直す |
| `shuji-bonji/s1000d-writer-mcp` | Private | 未公開 | GitHub に作成済み、中身は空（段階 3） |

ローカルの配置は `/Users/bonji/workspace/shuji-bonji/s1000d-stack/` の下に `lib/s1000d-core`、`mcp/s1000d-brex-mcp`、`mcp/s1000d-verify-mcp`、`mcp/s1000d-reader-mcp`、`lib/experiential-manual-model`、`specs/s1000d/`（いずれも hub の `.gitignore` で除外）です。

## 動かし方（確認用）

```sh
# core（配布物に対するテストも含める場合）
cd lib/s1000d-core && npm test
S1000D_SPEC_TESTS=1 npm test          # 既定: ../../specs/s1000d/issue-7

# brex-mcp
cd mcp/s1000d-brex-mcp && npm test
S1000D_SPEC_DIR=../../specs/s1000d/issue-7 npm start   # stdio で起動

# verify-mcp（配布物のテストは約 20 秒）、reader-mcp も同じ
cd mcp/s1000d-verify-mcp && npm test
S1000D_SPEC_TESTS=1 npm test
cd mcp/s1000d-reader-mcp && npm test

# experiential-manual-model（配布物を使わない）
cd lib/experiential-manual-model && npm test

# サイト（Node 22.23.4 以上）
cd site && npm run build && npm run preview
```

> [!TIP]
> チャットから開発機に接続した Linux VM（aarch64）では、**Mac の `node_modules` を使わない**。`node_modules` は 1 つのフォルダーを 2 つの OS で見ることになり、npm が OS に合うネイティブモジュール（rolldown の binding）だけを残すため、片方で `npm install` するともう片方が壊れる（2026-10-25 に判明。WebAssembly 版の binding への切り替えも、他のパッケージが要求する別の版の `@emnapi/*` と衝突して動かなかった）。VM では `~/vmrun.sh <s1000d-stack からの相対パス> <コマンド>` を使う。リポジトリを `~/vm/s1000d-stack/` に rsync（`node_modules`・`dist`・`.git` を除く）して `npm ci` し、そこでコマンドを実行する。`specs/` は Mac 側へのシンボリックリンクなので配布物のテストも動く。例: `S1000D_SPEC_TESTS=1 ~/vmrun.sh lib/s1000d-core npx vitest --run`、`~/vmrun.sh site npm run build`。`~/vmrun.sh` は VM のホームにあり、セッションをまたいで残らないことがあるので、無ければ下の内容で作り直す。
>
> ```sh
> #!/usr/bin/env bash
> set -euo pipefail
> REL="$1"; shift
> SRC="$HOME/mnt/s1000d-stack/$REL"; DST="$HOME/vm/s1000d-stack/$REL"
> mkdir -p "$DST"
> rsync -a --delete --exclude node_modules --exclude dist --exclude .git --exclude '.astro' "$SRC/" "$DST/"
> ln -sfn "$HOME/mnt/s1000d-stack/specs" "$HOME/vm/s1000d-stack/specs"
> cd "$DST"
> if [ ! -d node_modules ] || [ ! -f node_modules/.lock-hash ] || [ "$(md5sum package-lock.json | cut -d' ' -f1)" != "$(cat node_modules/.lock-hash)" ]; then
>   npx -y npm@12 ci --no-audit --no-fund >/dev/null 2>&1 || npx -y npm@12 install --no-audit --no-fund >/dev/null
>   md5sum package-lock.json | cut -d' ' -f1 > node_modules/.lock-hash
> fi
> exec "$@"
> ```
>
> VM の npm は 10.9.9 で、Mac の npm 12 が書いた lock を読めず `Cannot read properties of null (reading 'edgesOut')` で失敗することがあるので、npm は `npx -y npm@12` で呼ぶ。

## 次にやること

1. **10-4 公開後の確認**（利用者。下のチェックリスト）。加えて、`S1000D_SPEC_DIR` を設定したシェルから Claude Code を起動し、plugin で入れた `s1000d-brex` が `/mcp` で接続済みになり `explain_brex` が動くことを確かめる（plugin の `mcpServers` に `env` を書かない判断、D-23）。動かなければ `plugin.json` に `env` を足す案を検討する。
2. **D-25（設定ファイル）は 2026-10-27 15:10 頃に公開済み**: core 0.4.0、brex-mcp・verify-mcp・reader-mcp 0.3.0（npm・MCP Registry・claude-plugins。core `^0.4.0`）。Claude Desktop の plugin 版が `~/.config/s1000d-stack/config.json` の `specDir` を読み、`list_schemas`（Issue 7 の XSD 33 本）と `explain_brex`（既定 BREX）が動くことを確かめた。`-dev` 版も core 0.4.0 で作り直し済み。LaunchAgent は片付け済み。
3. サイトと hub の README は 2026-10-27 15:35 に更新済み（hub の `9f2c661`、push 済み）: `guide/getting-started.md` に「環境変数が渡らないとき（設定ファイル）」の節、MCP 3 ページの「設定」に設定ファイルの一文、`guide/architecture.md` の版（core 0.4.0・MCP 0.3.0）。
4. **段階 2.5 の作業 3 は 2026-10-27 19:25 JST 頃に公開まで済み**（core 0.5.0、reader-mcp・verify-mcp 0.4.0。`-dev` 版も core 0.5.0 で作り直し済み）。
5. **段階 2.5 の作業 4（HTTP transport）は 2026-10-27 19:40 JST 頃に実装済み**（3 本の MCP に `--http`。ROADMAP「進捗（段階 2.5）」）。残っている操作は利用者のもの。
   1. reader-mcp `5bf0783`・verify-mcp `01794be`・brex-mcp `04ae6e6` に署名し直して push し、`npm version minor`（reader・verify 0.5.0、brex 0.4.0）→ `git push --follow-tags` で公開する。brex-mcp は公開前に core の依存を `^0.5.0` に上げてもよい（動作は変わらない）。MCP Registry と claude-plugins は手順 6。
   2. hub の未 push のコミット（サイトの MCP 3 ページの HTTP の段落、ROADMAP・design・handoff）を push する。
   3. 公開後、`-dev` 版を作り直し、Claude Desktop から `--http` 無しで従来どおり動くことを確かめる。
6. **段階 2.5 の作業 5**（core に DML・DDN の読み取りと照合。verify-mcp `verify_csdb` と reader-mcp `list_data_modules` に反映）。設計は design/agent-platform.md「組み込みに要る広げ方」。その後に作業 6（サイトの「組み込み基盤」のページ）、7（概要モードと機密区分）、8（版が混ざった CSDB）。
7. `notes/site-review.md` に `guide/overview.md` と `use-cases/index.md` の照合表（3.10・3.11）を足す（任意）。

## 作業 10 の記録（公開、D-16。2026-10-26 に完了）

利用者がやったこと（GitHub・npm の操作）と、チャットでやったこと（ファイルの追加・書き換え）を分けて残します。

### 10-0 前提（利用者。2026-10-26 15:00 までに実施）

- [x] hub の未 push のコミット（`e981c5f`・`ea24872` ほか）に署名し直して push する
- [x] 2026-10-26 の変更をコミットする。hub: `site/`（章立て・ロゴ・i18n）、`README.md`・`README.ja.md`、`scripts/generate-stack.mjs`、`stack.json`、`docs/`。5 リポジトリ（core・brex・verify・reader・experiential-manual-model）: `README.md`（英語）と `README.ja.md`（日本語）
- [x] `site` と 5 リポジトリで `npm install` を 1 回ずつ実行する（VM 側の作業で Mac の `node_modules` が一時的に壊れたため。手順は上の TIP）
- [x] `cd site && npm run build && npm run check:i18n` が通ることを確かめる（28 ページ = 14 × 2 言語。ヘッダーの言語切替、`/ja/` 側の hero のロゴ、favicon を目視）
- [x] 英語版（サイト 14 ページと README 6 本）を通読し、直したい箇所があれば新しいチャットの最初に伝える。特に `guide/overview.md`・`guide/license.md` と、5 本の README の冒頭段落
- [x] 用語の追加候補を決める（技術指令書 → technical order、機能マトリクス → functionality matrix、改修 001 → modification 001、券売機 → ticket machine、本社コード → head office code）。採用したものを `notes/glossary.md` に足す

### 10-1 公開用のファイルを 4 リポジトリに足す（チャット）

brex-mcp・verify-mcp・reader-mcp・experiential-manual-model に、core と同じ形で次を足す。core の実物は `lib/s1000d-core/.github/workflows/publish.yml` と `lib/s1000d-core/docs/RELEASE.md`。

- [x] `.github/workflows/publish.yml`（タグ `v*` の push で test → publish。publish は Node 24・`permissions: id-token: write`・`npm publish --provenance --access public`。Trusted Publisher 前提で Secrets のトークンは使わない。package.json の version とタグの一致を確かめる step も同じ）
- [x] `docs/RELEASE.md`（`npm version patch|minor` → `git push --follow-tags` の手順。初回だけ手動 `npm publish --access public` が要ることを明記）
- [x] `package.json` の `files`・`repository`・`publishConfig` を core と揃える（`engines` は各リポジトリの現状のまま。core と experiential-manual-model は `>=20`、MCP 3 つは `>=22`）
- [x] 各 README の先頭の「npm 未公開（開発中）」の note を消す（`README.md` と `README.ja.md` の両方）— 10-0 の英語化の時点で既に無かった
- [x] **日本語 README の古い記述を直し、英語版に反映する**: hub README の「できること（段階 1）」の節と全体像の図（reader / verify が「予定」のまま）、brex-mcp README の WARNING（「XSD 検証は段階 2 の verify-mcp で予定」）。段階 2 の 3 部品が動いている現状に合わせる。順番は日本語 → 英語（D-22）
- [x] 各 CHANGELOG の「未リリース」を `0.1.0` に切る（日付は公開日の JST）— brex-mcp には CHANGELOG が無かったので新規作成

### 10-2 GitHub と npm の操作（利用者）

- [x] hub `s1000d-stack` を Public にし、Settings → Pages の Source を **GitHub Actions** にする
- [x] brex-mcp・verify-mcp・reader-mcp・experiential-manual-model を Public にする
- [x] 4 パッケージを初回だけ手動で公開する: 各リポジトリで `npm run build && npm publish --access public`（D-14。順番は experiential-manual-model → brex-mcp → verify-mcp → reader-mcp。MCP 3 つは core `^0.2.0` を使うので core は公開済みでよい）
- [x] npm 側で 4 パッケージに Trusted Publisher（GitHub Actions、リポジトリ名と `publish.yml`）を登録する
- [x] 公開できたことを `npm view @shuji-bonji/<name> version` で確認し、チャットに伝える — 公開直後はレジストリ API が 2〜3 分 404 を返した（Web ページが先に出る）。tarball に `src/`・`tests/`・`specs/`・XSD が入っていないことも確認

### 10-3 サイトと hub の仕上げ（チャット。10-2 の後）

- [x] `.github/workflows/deploy.yml` の push トリガー（`main` への push で配備）を戻す。いまは `workflow_dispatch` のみ
- [x] `site/src/content/docs/guide/getting-started.md`・`mcp/brex-mcp.md`・`mcp/verify-mcp.md`・`mcp/reader-mcp.md` の「npm 未公開（開発中）」の note を消し、`npx @shuji-bonji/...` の手順が実物と合うことを確かめる。**英語（直下）と日本語（`ja/`）の両方**を直し、`npm run check:i18n` で揃っていることを確かめる
- [x] `scripts/generate-stack.mjs` の REGISTRY で 4 つの `status` を `released` にし、`node scripts/generate-stack.mjs --readme` で `stack.json` と `README.md`・`README.ja.md` を再生成する
- [x] `~/vmrun.sh site npm run build` でサイトが通ることを確かめる — 28 ページ（14 × 2 言語。handoff の「26」は use-cases を数え落としていた）、内部リンク切れ無し、`dist/ja/` あり
- [x] ROADMAP「段階 2 の作業」の進捗の行で作業 10 を「済み」にし、段階 2 の完了日（JST）を書く。DECISIONS の D-16 に公開日を追記する。このメモの「リポジトリの状態」の表を Public / npm 版に更新する
- [ ] `notes/site-review.md` に、2026-10-26 に増えた 2 ページ（`guide/overview.md`、`use-cases/index.md`）の照合表を 3.10・3.11 として足す（任意。段階 2 の完了条件ではない。未実施）
- [x] hub をコミットする（署名は利用者）。push で `deploy.yml` が走り、GitHub Pages に配備される

### 10-4 公開後の確認（利用者）

- [ ] GitHub Pages の URL でサイトが開き、ヘッダーの GitHub リンクが `shuji-bonji/s1000d-stack` を指す。`/s1000d-stack/` が英語、`/s1000d-stack/ja/` が日本語で開き、言語切替が往復できる。`/s1000d-stack/images/logo.svg` が開く
- [ ] npm の各パッケージのページで英語の README が表示され、`README.ja.md` へのリンクが GitHub の該当ファイルに飛ぶ（npm 上では相対リンクが GitHub に向く）
- [ ] `stack-check.yml`（毎日）が緑になる
- [ ] Claude Desktop などから `npx -y @shuji-bonji/s1000d-brex-mcp` で起動できる（`S1000D_SPEC_DIR` を付けて）

## 新しいチャットの最初に読むもの

1. ROADMAP.md（全体像と進捗。段階 2 の作業の表）
2. DECISIONS.md（D-01〜D-25 と未決 U-03・U-05・U-07・U-09・U-10）
3. notes/background.md（仕様書の読解結果、配布物のファイル構成、設計のヒント）
4. このメモ
5. design/ の 4 文書（着手する作業に応じて。agent-platform.md が次の目標）
6. notes/site-review.md（サイト通読用の照合シート。通読は 2026-10-24 に完了。記述の根拠を探すときに参照）
7. notes/glossary.md と notes/en-writing-guide.md（英語版を書く・直すときの対訳表と指針）、notes/i18n-trial.md（多言語化の経過と運用）

> [!NOTE]
> 文章は GitHub のアラート記法（`> [!NOTE]` など）を使い、日付は JST で書きます。既定 BREX の DMC は `S1000D-Y-04-10-0301-00A-022A-D` で、システム差異コード（Y）が配布物のファイル名・仕様書本文・データ辞書で食い違うため、コードでは決め打ちしていません。
