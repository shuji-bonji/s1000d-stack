# 引き継ぎメモ（2026-10-28 21:50 JST 時点）

新しいチャットで s1000d-stack の作業を続けるための要約です。経緯の詳細は [ROADMAP.md](../ROADMAP.md)・[DECISIONS.md](../DECISIONS.md)・[background.md](./background.md) にあり、このメモはそれらへの入口です。

> [!IMPORTANT]
> 作業の前提は次の 3 つです。
> 1. DECISIONS.md の決定事項（D-01〜D-28）は覆さない。変える必要があると判断したときは、理由を挙げて先に相談する。
> 2. S1000D の仕様書・XSD・既定 BREX・公式サンプルは、どのリポジトリにも npm パッケージにもコミットしない（D-03）。置き場所は `s1000d-stack/specs/s1000d/`（git 管理外、D-06）。
> 3. `docs/` の文書（ROADMAP・DECISIONS・notes/ の 6 本・design/ の 6 本）は、ローカル `s1000d-stack/docs/` と claude.ai Project「S1000D Stack」のナレッジの両方に同じ内容を置く。片方だけ直さない。
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
  style S25 fill:#dfe,stroke:#393
  style S3 fill:#ffd,stroke:#993
```

**段階 3 の writer は 2026-10-28 午後に実装が済み、完了条件（券売機の例を共通データモデル経由で S1000D に出力し、Issue 7 の XSD と既定 BREX を通る）をテストで満たしました**（core 0.8.0・writer-mcp 0.1.0。**2026-10-28 16:30 JST 頃までに利用者が両方を npm に公開した。** core はタグ `v0.8.0` の push、writer-mcp は初回の手動 `npm publish` → Trusted Publisher の登録）。設計は design/writer-mcp.md、実装で設計と違えた点は同文書「実装の記録」、作業の表と進捗は ROADMAP「段階 3 の作業」。実装は Sonnet のサブエージェント 6 本に分担させ、テストと設計照合はチャットで行いました。残りは公開（下の「次にやること」の 9）と、Skill 4 つ・作成ツールの試作（作業 8）です。

**段階 1 は 2026-10-24 に、段階 2 は 2026-10-26 に完了しました。** 段階 2 の設計は `docs/design/` の 3 文書（[verify-mcp.md](../design/verify-mcp.md)、[reader-mcp.md](../design/reader-mcp.md)、[manual-model.md](../design/manual-model.md)）、作業の順序と結果は ROADMAP「段階 2 の作業」の表（作業 1〜10）にあります。2026-10-26 に作業 10（公開）を行い、4 パッケージ（experiential-manual-model・brex-mcp・verify-mcp・reader-mcp）の 0.1.0 を npm に公開し、4 リポジトリと hub を Public にし、学習サイトを GitHub Pages に配備しました。経過は下の「作業 10 の記録」にチェックリストのまま残してあります。**2026-10-27 未明に作業 11（D-23）として、MCP 3 本の 0.1.1 を出し、MCP Registry（`io.github.shuji-bonji/*`、`active`）と claude-plugins marketplace（category `s1000d`、0.7.0）に載せました。** 手順は pdf-agent-stack の `docs/specs/30-registry-and-marketplace-release.md` と同じで、各リポジトリの `docs/RELEASE.md` に手順 6 として足してあります。

**次の目標は「CSDB 製品に組み込める基盤」（D-19）で、段階 2.5**（修正提案・`CsdbSource`・HTTP transport・DML/DDN・概要モード・機密区分）です。作業 1〜2（修正提案）は 2026-10-27 に実装・公開済み（core 0.3.0、verify-mcp 0.2.0）。**作業 3（`CsdbSource`）は 2026-10-27 に済みました**: core 0.5.0 を 18:40 JST 頃に公開し、reader-mcp・verify-mcp を `index.read()` に切り替え、19:25 JST 頃に両方とも 0.4.0 を npm・MCP Registry・claude-plugins（marketplace）に公開しました。**作業 4（HTTP transport）も 19:40 JST 頃に 3 本の MCP へ実装し、同日夜に公開しました**（`--http`。brex-mcp 0.4.0、verify-mcp・reader-mcp 0.5.0。npm・MCP Registry・claude-plugins とも同じ版。`-dev` 版も作り直し済み）。**段階 2.5 は 2026-10-28 11:30 JST 頃に完了しました**（作業 1〜8 を実装・公開。core 0.7.0、brex-mcp 0.4.0、verify-mcp 0.6.0、reader-mcp 0.7.0）。 作業 5（DML・DDN）は 2026-10-28 に済みました: core 0.6.0 を朝に公開し、10:20 JST 頃に verify-mcp（7 本目のツール `reconcile_dml`）と reader-mcp（`list_data_modules` の DML・DDN の行に照合の集計）を実装しました（D-26）。**両方とも 0.6.0 として 10:50 JST 頃に公開しました**（npm・MCP Registry・claude-plugins。`-dev` 版も作り直し済み）。plugin 版の `reconcile_dml` を Bike Samples で呼び、テストと同じ結果が返ることを確かめました。**作業 7（概要モード・機密区分）は 11:00 JST 頃に core と reader-mcp に実装し、11:30 JST 頃に core 0.7.0・reader-mcp 0.7.0 として公開しました。作業 8（版が混ざった CSDB）は verify-mcp のテストに固定し、作業 6（サイト「CSDB 製品への組み込み」）は 11:15 JST 頃に書きました。**結果は ROADMAP「進捗（段階 2.5）」と design/agent-platform.md「組み込みに要る広げ方」の実装の記録にあります。設計は design/agent-platform.md。LLM 活用時の注意点 5 つへの対応と、段階 4 の最初の成果物にする簡易な技術マニュアルの Web システム（基盤の参照実装、技術は U-10）も同じ設計文書に記録してあります。

2026-10-26 の日中には、サイトの章立てを houki-hub に揃え（D-20）、ロゴを六角形のスタックに決め（D-21）、英語をルートにして日本語を `/ja/` と `README.ja.md` にしました（D-22）。サイト 14 ページ × 2 言語と README 6 本 × 2 言語が揃い、`npm run check:i18n`（`site/scripts/check-i18n.mjs`）で構造の一致を検査できます。`scripts/generate-stack.mjs --readme` は両 README の表を更新します。経過は notes/i18n-trial.md。

## リポジトリの状態

| リポジトリ | 公開 | npm | 状態 |
|---|---|---|---|
| [shuji-bonji/s1000d-core](https://github.com/shuji-bonji/s1000d-core) | Public | `@shuji-bonji/s1000d-core` **0.7.0**（2026-10-28 11:30 JST 頃、タグ push → `publish.yml`）。**0.8.0 を 2026-10-28 16:20 JST 頃に公開**（`7259d60`、タグ `v0.8.0`。書く側の機能。CHANGELOG 0.8.0） | 公開は `docs/RELEASE.md` の手順（`npm version` でタグを付けて push）。0.3.0 で修正提案 `suggestFixes`（段階 2.5 の作業 1）、0.4.0 で設定ファイル `resolveStackConfig`（D-25）、0.5.0 で `CsdbSource`（作業 3）、0.6.0 で DML・DDN の読み取りと照合と `dme`（作業 5）、0.7.0 で概要モード `outlineContent` / `measureContent` と `ContentNode.securityClassification`（作業 7）。main は origin と一致 |
| [shuji-bonji/s1000d-brex-mcp](https://github.com/shuji-bonji/s1000d-brex-mcp) | Public | `@shuji-bonji/s1000d-brex-mcp` **0.4.0**（2026-10-27 夜、`publish.yml` 経由。core `^0.4.0`） | 0.2.0 で `list_notations` の `effectiveFor` に `mode` / `excluded`、0.3.0 で設定ファイル（D-25）。npm・MCP Registry・claude-plugins とも 0.3.0。0.4.0 で `--http`（作業 4）。npm・MCP Registry・claude-plugins とも 0.4.0。core の依存は `^0.4.0` のまま（`CsdbSource` を使わないため。次に core の minor を上げるときに揃える）。main は origin と一致。[Issue #1](https://github.com/shuji-bonji/s1000d-brex-mcp/issues/1) は開いたまま |
| [shuji-bonji/s1000d-verify-mcp](https://github.com/shuji-bonji/s1000d-verify-mcp) | Public | `@shuji-bonji/s1000d-verify-mcp` **0.6.0**（2026-10-28 10:50 JST 頃、`publish.yml` 経由。core `^0.6.0`） | 0.2.0 で 6 ツール目 `suggest_fixes`、0.3.0 で設定ファイル、0.4.0 で `verify_csdb` を `index.read(o)` に（作業 3）、0.5.0 で `--http`（作業 4）。npm・MCP Registry・claude-plugins とも 0.5.0。0.6.0 で 7 本目のツール `reconcile_dml`（作業 5、core `^0.6.0`）。npm・MCP Registry・claude-plugins とも 0.6.0（作業 8 はテストだけなので公開していない）。main は origin と一致。[Issue #1](https://github.com/shuji-bonji/s1000d-verify-mcp/issues/1) は開いたまま |
| [shuji-bonji/s1000d-reader-mcp](https://github.com/shuji-bonji/s1000d-reader-mcp) | Public | `@shuji-bonji/s1000d-reader-mcp` **0.7.0**（2026-10-28 11:30 JST 頃、`publish.yml` 経由。core `^0.7.0`） | 0.2.0 で ACT・CCT・PCT の探索を core の `findApplicTables` に切り替え、0.3.0 で設定ファイル、0.4.0 で CSDB の中身を `index.read(o)` で読む（作業 3）、0.5.0 で `--http`（作業 4）。npm・MCP Registry・claude-plugins とも 0.5.0。0.6.0 で `list_data_modules` の DML・DDN の行に照合の集計（作業 5、core `^0.6.0`）。0.7.0 で `section: "outline"`、先頭の `securityClassification`、本文の `size`（作業 7、core `^0.7.0`）。npm・MCP Registry・claude-plugins とも 0.7.0。main は origin と一致。[Issue #1](https://github.com/shuji-bonji/s1000d-reader-mcp/issues/1) は開いたまま |
| [shuji-bonji/experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model) | Public | `@shuji-bonji/experiential-manual-model` **0.1.0**（2026-10-26 16:26 JST、同上） | 型・JSON Schema・`validateManual`・`fromLegacyJson`。`schema/` と `examples/` も配布物に含む |
| [shuji-bonji/s1000d-stack](https://github.com/shuji-bonji/s1000d-stack)（hub） | Public（2026-10-26） | — | 学習サイトは https://shuji-bonji.github.io/s1000d-stack/ （英語。日本語は `/ja/`）。`deploy.yml` は `main` への push（`site/**` と自身）で配備、`stack-check.yml` は毎日。**git のコミットはチャットから行ってよい**（2026-10-24 に利用者が指示。接続フォルダーの削除の許可を得れば git のロックファイルも消せる）。署名は利用者が後で付け直す |
| [shuji-bonji/s1000d-writer-mcp](https://github.com/shuji-bonji/s1000d-writer-mcp) | push 済み（Public かは要確認） | `@shuji-bonji/s1000d-writer-mcp` **0.1.1**（0.1.0 は 2026-10-28 16:30 JST 頃に初回の手動 `npm publish`。0.1.1 は 17:10 JST 頃にタグ push → `publish.yml`。npm・MCP Registry・claude-plugins とも 0.1.1） | 2026-10-28 にローカルで実装（6 ツール `build_data_module` / `convert_manual` / `apply_fixes` / `create_comment` / `extract_segments` / `apply_segments`、`--http`、設定ファイル、plugin.json / server.json、CI / publish、README 日英、CHANGELOG「未リリース」）。コミット・push 済み（main は origin と一致）。core の依存は `^0.8.0`（lock も 0.8.0）。テストは自作 36 件・配布物 2 件。MCP Registry（`io.github.shuji-bonji/s1000d-writer-mcp`、0.1.1）と claude-plugins（plugin 名 `s1000d-writer-mcp`、marketplace 0.8.0）に登録済み。0.1.1 は入力スキーマの修正: `draft`・`allocation` を `$ref` だけで書いていたため、`$ref` を解決しない Claude Desktop がオブジェクトを文字列として渡し `data/draft must be object` で拒否された。`$defs` の定義を引数の位置に展開して直した |

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
5. **段階 2.5 の作業 4（HTTP transport）は 2026-10-27 夜に公開まで済み**（brex-mcp 0.4.0、verify-mcp・reader-mcp 0.5.0。ROADMAP「進捗（段階 2.5）」）。hub の README・`guide/architecture.md`・`stack.json` と claude-plugins の README の表を揃えた（claude-plugins の `marketplace-version-check.mjs --write` は台帳だけを直し、README の表は毎回手で直している）。
6. **段階 2.5 の作業 5 は 2026-10-28 10:50 JST 頃に公開まで済み**（core 0.6.0、verify-mcp・reader-mcp 0.6.0。分担は D-26）。最初の 0.6.0 のコミットには `src/` 直下に `handlers.ts` / `definitions.ts` の写しが誤って入っていて `tsc` が落ちたため、写しを取り除いたコミットに `v0.6.0` のタグを付け直して公開した（npm には壊れた版は出ていない）。**教訓: VM で整形したファイルを戻すときは `cp` でファイルを列挙せず、`rsync` で同じ階層へ戻す。**
7. **作業 6・7・8 は 2026-10-28 に実装し、7 は 11:30 JST 頃に公開した**（ROADMAP「進捗（段階 2.5）」）。hub の README・`stack.json`（利用者）と `guide/architecture.md`（チャット）の版も 0.7.0 に揃えた。
8. **段階 3 の writer は 2026-10-28 に実装済み**（design/writer-mcp.md、ROADMAP「段階 3 の作業」）。core 0.8.0 の追加は core の CHANGELOG、writer-mcp の中身は同リポジトリの README.ja.md。実装で設計と違えた点は design/writer-mcp.md「実装の記録」。
9. **公開（利用者）。順番を守る**:
   1. ~~core の公開~~ **済み（2026-10-28 16:20 JST 頃、0.8.0）**
   2. writer-mcp: ~~`npm install` → テスト → 初回コミット・push → 手動 `npm publish` → Trusted Publisher~~ **済み（2026-10-28 16:30 JST 頃、0.1.0）**。**MCP Registry と claude-plugins も済み（2026-10-28 17:20 JST 頃、0.1.1）**。経過: (1) `server.json` の `description` が 118 文字で Registry に 422（上限 100 文字）→ 97 文字に縮めた。(2) plugin 名を他の 3 本に揃えて `s1000d-writer` → `s1000d-writer-mcp` に直した（`mcpServers` のキーは `s1000d-writer` のまま）。(3) claude-plugins の CI（`marketplace-version-check.mjs`）が古い名前を読んで落ちたのは `raw.githubusercontent.com` のキャッシュ（`max-age=300`）のため。**plugin 側を push したら 5 分置いてから claude-plugins を push する**。(4) 0.1.1 で入力スキーマを直した（上の表）。Claude Desktop の再起動後、plugin 版（npm 0.1.1）と `-dev` 版の両方で `build_data_module` を呼び、descript・proced とも Issue 7 の XSD で valid、既定 BREX の違反 0 を確かめた（17:22 JST）。気づいた点: CSDB のフォルダーを渡さないと、BREX の連鎖は `S1000D_SPEC_DIR` の既定 BREX でたどれるのに、参照の工程は `brexDmRef` を「No CSDB folders」で未解決（`confidence: none`）として返す。既定 BREX（モデル識別コード `S1000D`）への参照は仕様書への参照として扱う方が利用者に分かりやすい（core の参照の解決の小さな改善候補）
   3. reader-mcp・verify-mcp・brex-mcp の core の依存は `^0.7.0` / `^0.4.0` のままでよい（0.8.0 は追加だけで既存 API を変えていない）。次に各 MCP の minor を上げるときに揃える
   4. ~~`-dev` 版~~ **済み（2026-10-28 17:00 JST 頃、`s1000d-writer-dev`。`env` は `S1000D_SPEC_DIR` だけ）**
   5. hub: `site/`・README・`stack.json`・`docs/` をコミット・push（サイトが配備される）。サイトは 2026-10-28 に `mcp/writer-mcp.md`（日英）を足し 16 ページ × 2 言語、`check:i18n` ok、内部リンク切れ 0。公開を受けて「npm 未公開」の note（architecture・writer-mcp・s1000d-core、日英）と README の記述は 16:50 JST に消し、`generate-stack.mjs` の writer を `released` にして `stack.json` と README の表を再生成した（npm 照合は 6 つとも一致）。ただし VM では Pagefind が `linux-arm64 is not yet a supported architecture` で失敗したため（以前は通っていた。npm のキャッシュを `/var/tmp` に移した影響か未確認）、**`cd site && npm run build` を Mac で一度通してから push する**。`site/scripts/check-i18n.mjs` が ok であることは確認済み
10. **core 0.8.1 は 2026-10-28 21:30 JST 頃までに公開済み**（`npm view` で 0.8.1）: CSDB なしの検証で `brexDmRef` が未解決と出ていた食い違いの修正（ROADMAP「進捗（段階 3）」の「修正」）。公開は `lib/s1000d-core` でコミット → `git tag v0.8.1 && git push --follow-tags`（`package.json` は 0.8.1 に上げてある。`npm version` は使わない）。writer-mcp の依存 `^0.8.0` は 0.8.1 を含むので、writer-mcp の再公開は要らない（`npx @latest` で入れ直せば効く）。
11. **作業 8 は 2026-10-28 に済み**。Skill 4 つは 21:30 JST 頃までに公開（GitHub Public、`v0.1.0` の Release に `.plugin`、claude-plugins 登録、Claude Desktop に追加）。hub も push 済み。公開を受けて、サイトの Skill の 4 ページ（日英）の「公開準備中」の注記を GitHub・Release へのリンクに置き換え、architecture・トップページ・hub の README を「公開済み」にし、`generate-stack.mjs` の Skill 4 行を `released`（`public: true`、照合の欄は「plugin 配布」）にした（21:50 JST、**未コミット**。Mac で `site` の build を通してからコミット・push）。manual-editor は Mac の `npm run dev` で起動済み。以下は公開までに使った手順の記録:
    1. GitHub に Private で 5 つ作る: `experience-to-s1000d-skill`・`s1000d-publish-skill`・`s1000d-review-skill`・`s1000d-translate-skill`・`manual-editor`
    2. 各フォルダー（`skill/<名前>-skill`、`app/manual-editor`）で `git init` → コミット → `git remote add origin …` → push（hub の `.gitignore` で除外されているので、それぞれが独立したリポジトリになる）
    3. manual-editor は Mac で `npm install && npm run dev` を開き目視で確かめる（券売機の例を開く → ホットスポットを描く → 遷移を付ける → 体験表示）。オフラインは `npm run build && npm run preview`。保存した JSON を `experience-to-s1000d` に渡して S1000D にできることも一度確かめる。`app/manual-editor/.svelte-kit/build-preview.tgz` はチャットでの画面確認に使った build の写し（`.gitignore` 済み。消してよい）
    4. Skill の公開: 各リポジトリで `CHANGELOG.md` の 0.1.0 に日付を入れ、タグ `v0.1.0` を push（`release.yml` が `.plugin` を作り GitHub Release に置く）。リポジトリを Public にするかは利用者が決める（サイトと README は Private の前提でリンクを付けていない）
    5. claude-plugins: 台帳（Skill 4 件、marketplace 0.9.0）と README の表・図は用意済み。**Skill のリポジトリを push して 5 分置いてから** `node scripts/marketplace-version-check.mjs` で 31 件一致を確かめ、コミット・push。`/plugin install s1000d-review@shuji-bonji` などで入ることを確かめる
    6. hub: サイトの Skill の章を含めてコミット・push（Mac で `cd site && npm run build` を通してから）
    7. 決まりの準備（任意）: s1000d-review の comment DM に使う `commentType`・`commentPriorityCode`・発信者・機密区分のプロジェクトの決まり、s1000d-review / s1000d-translate が読む用語集（2 列の CSV か Markdown の表、または DeepL の用語集）
    U-03（自作サンプルデータの共有。出発点は core の `src/__fixtures__/kenbaiki-drafts.ts`）は未決。
12. core で確かめきれていないこと: comment DM のファイル名の規則（仕様書のファイル名の章。データ辞書の見本 1 件からの推定）、`applyFix` が開始タグの中の空白を 1 つに揃えること、ICN の DOCTYPE を書き換える候補が未対応なこと。
13. 片付け: `lib/s1000d-core` と `mcp/s1000d-reader-mcp` 直下の `vitest.config.ts.timestamp-*.mjs`（`.gitignore` 済み）を消す。VM 側は `/sessions` の空きが少なく、`~/vm` を `/var/tmp/vmroot` へのシンボリックリンクにし、npm のキャッシュを `/var/tmp/npm-cache` にしてある（セッションをまたいで残らないことがある）。
14. `notes/site-review.md` に `guide/overview.md`・`use-cases/index.md`・`guide/embedding.md` の照合表を足す（任意）。

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
2. DECISIONS.md（D-01〜D-28 と未決 U-03・U-05・U-07・U-09・U-10）
3. notes/background.md（仕様書の読解結果、配布物のファイル構成、設計のヒント）
4. このメモ
5. design/ の 6 文書（着手する作業に応じて。段階 3 は writer-mcp.md と skills-and-editor.md）
6. notes/site-review.md（サイト通読用の照合シート。通読は 2026-10-24 に完了。記述の根拠を探すときに参照）
7. notes/glossary.md と notes/en-writing-guide.md（英語版を書く・直すときの対訳表と指針）、notes/i18n-trial.md（多言語化の経過と運用）

> [!NOTE]
> 文章は GitHub のアラート記法（`> [!NOTE]` など）を使い、日付は JST で書きます。既定 BREX の DMC は `S1000D-Y-04-10-0301-00A-022A-D` で、システム差異コード（Y）が配布物のファイル名・仕様書本文・データ辞書で食い違うため、コードでは決め打ちしていません。
