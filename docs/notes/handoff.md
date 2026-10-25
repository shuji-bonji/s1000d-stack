# 引き継ぎメモ（2026-10-25 11:50 JST 時点）

新しいチャットで s1000d-stack の作業を続けるための要約です。経緯の詳細は [ROADMAP.md](../ROADMAP.md)・[DECISIONS.md](../DECISIONS.md)・[background.md](./background.md) にあり、このメモはそれらへの入口です。

> [!IMPORTANT]
> 作業の前提は次の 3 つです。
> 1. DECISIONS.md の決定事項（D-01〜D-18）は覆さない。変える必要があると判断したときは、理由を挙げて先に相談する。
> 2. S1000D の仕様書・XSD・既定 BREX・公式サンプルは、どのリポジトリにも npm パッケージにもコミットしない（D-03）。置き場所は `s1000d-stack/specs/s1000d/`（git 管理外、D-06）。
> 3. `docs/` の文書（ROADMAP・DECISIONS・notes/background・notes/handoff・design/ の 3 本）は、ローカル `s1000d-stack/docs/` と claude.ai Project「S1000D Stack」のナレッジの両方に同じ内容を置く。片方だけ直さない。

## いまどこにいるか

```mermaid
flowchart LR
  S1["段階 1<br/>hub ＋ core ＋ brex"] --> S2["段階 2<br/>reader ＋ verify ＋ model"]
  S2 --> S3["段階 3<br/>writer ＋ Skill ＋ 作成ツール"]
  S3 --> S4["段階 4<br/>閲覧ソフト"]
  style S1 fill:#dfe,stroke:#393
  style S2 fill:#ffd,stroke:#993
```

**段階 1 は 2026-10-24 に完了し、段階 2 の設計を同日に書きました。** 設計は `docs/design/` の 3 文書（[verify-mcp.md](../design/verify-mcp.md)、[reader-mcp.md](../design/reader-mcp.md)、[manual-model.md](../design/manual-model.md)）で、作業の順序は ROADMAP「段階 2 の作業」の表（作業 1〜10）にあります。設計で出た 3 つの判断は同日に確定しました（D-17: XSD 検証の置き場所、D-18: reader の検証の既定、U-04: パッケージ名 `@shuji-bonji/experiential-manual-model`）。実装は作業 1〜7 が済み（段階 2 の 3 部品のうち verify-mcp と reader-mcp が動く状態）、core 0.2.0 は npm に公開済みです（2026-10-25）。次は作業 8（experiential-manual-model）と作業 9（サイト）です。

## リポジトリの状態

| リポジトリ | 公開 | npm | 状態 |
|---|---|---|---|
| [shuji-bonji/s1000d-core](https://github.com/shuji-bonji/s1000d-core) | Public | `@shuji-bonji/s1000d-core` **0.2.0**（2026-10-25、タグ push → `publish.yml`） | 公開は `docs/RELEASE.md` の手順（`npm version` でタグを付けて push）。0.2.0 の後に `a0e9eb6`（`findSchemaDirs` のデータ辞書除外）と vitest 4 への更新が未公開で、0.2.1 の材料 |
| [shuji-bonji/s1000d-brex-mcp](https://github.com/shuji-bonji/s1000d-brex-mcp) | Private | 未公開 | core `^0.2.0` を参照し、BREX の探索は core の `locateBrex` に任せた（`edfe6e2`、push 済み）。npm 公開は D-16 のとおり段階 2 が揃った時点 |
| [shuji-bonji/s1000d-verify-mcp](https://github.com/shuji-bonji/s1000d-verify-mcp) | Private | 未公開 | 最初の実装を push 済み（`686fb58`）。5 ツール、テスト 13＋5 件、stdio の実機確認済み |
| [shuji-bonji/s1000d-stack](https://github.com/shuji-bonji/s1000d-stack)（hub） | Private | — | README・`stack.json`・`scripts/generate-stack.mjs`・`site/`・`.github/workflows/`（`deploy.yml` は手動実行のみ、`stack-check.yml` は毎日）・`docs/` をコミット・push 済み（2026-10-24）。`docs/` の変更は 2026-10-24 夜にチャットからコミット済み（push は未）。**git のコミットはチャットから行ってよい**（2026-10-24 に利用者が指示。接続フォルダーの削除の許可を得れば git のロックファイルも消せる）。署名は利用者が後で付け直す |
| [shuji-bonji/s1000d-reader-mcp](https://github.com/shuji-bonji/s1000d-reader-mcp) | Private | 未公開 | 最初の実装を push 済み（`6e567c7`）。6 ツール、テスト 14＋5 件、stdio の実機確認済み |
| `shuji-bonji/s1000d-writer-mcp` | Private | 未公開 | GitHub に作成済み、中身は空（段階 3） |

ローカルの配置は `/Users/bonji/workspace/shuji-bonji/s1000d-stack/` の下に `lib/s1000d-core`、`mcp/s1000d-brex-mcp`、`mcp/s1000d-verify-mcp`、`mcp/s1000d-reader-mcp`、`specs/s1000d/`（いずれも hub の `.gitignore` で除外）です。

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

# サイト（Node 22.23.4 以上）
cd site && npm run build && npm run preview
```

> [!TIP]
> チャットから開発機に接続した Linux VM（aarch64）では、VM の npm 10.9.9 が macOS の npm 12 が書いた lock を読めず `npm install` が `Cannot read properties of null (reading 'edgesOut')` で失敗することがある。そのときは `npx -y npm@12 install` を使う。vitest を動かすには、macOS 側で入れた `node_modules` に Linux 用の rollup が無いため、各リポジトリで `npm install --no-save @rollup/rollup-linux-arm64-gnu` が 1 回要ります（`--no-save` なので `package.json` と lock は変わらない）。VM の npm は 10.9.9 で、`npm install` をすると lock から `libc` の項目が消える差分が出る（新しい npm が書く項目。害は無い）。

## 次にやること（候補の順）

1. **作業 8**（experiential-manual-model）。core に依存しない。設計は design/manual-model.md。`lib/experiential-manual-model` に新しいリポジトリを作る（GitHub の `shuji-bonji/experiential-manual-model` は未作成なので、利用者が作ってから push）。
2. **作業 9**（サイトに verify-mcp・reader-mcp・適用性の 3 ページ、`stack.json` に verify / reader / manual-model）。
3. **core 0.2.1 の公開**（利用者の作業、急がない）: `findSchemaDirs` のデータ辞書除外（`a0e9eb6`）と vitest 4 への更新。手順は `docs/RELEASE.md`（`npm version patch`）。verify-mcp と reader-mcp は自分でも同じ除外をしているので、0.2.0 のままでも動く。
4. **公開（D-16）**: 作業 9 の後に、hub・brex-mcp・verify-mcp・reader-mcp を公開する（各 MCP の初回は手動 `npm publish`、D-14）。
3. **作業 8**（experiential-manual-model）は core に依存しないので、並行して進められる。
4. **公開（D-16）**: 段階 2 が揃ったら、D-16 に書いた 5 つの作業で hub と brex-mcp を公開する。

## 新しいチャットの最初に読むもの

1. ROADMAP.md（全体像と進捗。段階 2 の作業の表）
2. DECISIONS.md（D-01〜D-18 と未決 U-03・U-05・U-07・U-09）
3. notes/background.md（仕様書の読解結果、配布物のファイル構成、設計のヒント）
4. このメモ
5. design/ の 3 文書（着手する作業に応じて）
6. notes/site-review.md（サイト通読用の照合シート。通読は 2026-10-24 に完了。記述の根拠を探すときに参照）

> [!NOTE]
> 文章は GitHub のアラート記法（`> [!NOTE]` など）を使い、日付は JST で書きます。既定 BREX の DMC は `S1000D-Y-04-10-0301-00A-022A-D` で、システム差異コード（Y）が配布物のファイル名・仕様書本文・データ辞書で食い違うため、コードでは決め打ちしていません。
