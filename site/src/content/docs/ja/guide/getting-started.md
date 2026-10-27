---
title: 導入手順
description: s1000d-stack を使い始めるために用意するものと、MCP サーバーの登録から最初の操作までを説明します。
---

`s1000d-stack` を使い始めるために用意するものと、最初の操作を説明します。この道具が何をするものかは [S1000D Stack とは](/s1000d-stack/ja/guide/overview/) をご覧ください。

## 用意するもの

```mermaid
flowchart LR
  A["s1000d.org で配布物を入手<br/>（利用条件に同意）"] --> B["フォルダーに展開<br/>内側の zip も展開する"]
  B --> C["S1000D_SPEC_DIR にそのフォルダーを指定"]
  D["自分のデータモジュールと BREX<br/>（CSDB のフォルダー）"] --> E["S1000D_CSDB_DIR に指定"]
  C --> F["s1000d-brex-mcp を MCP クライアントに登録"]
  E --> F
```

1. **S1000D の配布物**。[s1000d.org](https://s1000d.org/) のダウンロードページから、対象の版（最初の対象は Issue 7）の zip を入手し、展開します。配布物の中に既定 BREX（`DMC-S1000D-*-04-10-0301-00A-022A-D_*.XML`）と XML スキーマが入っています。
2. **Node.js 22 以上**。MCP サーバーは `npx` で起動できます。
3. **MCP クライアント**。Claude Desktop や Claude Code など、MCP サーバーを登録できるものです。

:::caution[配布物は再配布できません]
S1000D の仕様書・XML スキーマ・既定 BREX・公式サンプルの利用条件は、非独占的な利用を許諾するだけで、再配布の権利を与えていません。このプロジェクトのパッケージにはそれらを含めず、利用者ご自身で入手したものを環境変数 `S1000D_SPEC_DIR` で指定する方式にしています。詳しくは[仕様書の扱いと商標](/s1000d-stack/ja/guide/license/)をご覧ください。
:::

## 最初の一歩

Claude Desktop の設定ファイル（`claude_desktop_config.json`）に次を足して再起動します。

```json
{
  "mcpServers": {
    "s1000d-brex": {
      "command": "npx",
      "args": ["-y", "@shuji-bonji/s1000d-brex-mcp"],
      "env": {
        "S1000D_SPEC_DIR": "/path/to/s1000d/issue-7",
        "S1000D_CSDB_DIR": "/path/to/your/csdb"
      }
    }
  }
}
```

登録できたら、次のように頼んでみてください。

- 「既定 BREX のうち、descript（説明データモジュール）に関わるルールを 20 件、分かりやすく説明して」 → `explain_brex`
- 「このデータモジュール（パス）を BREX に照合して、違反を一覧にして」 → `check_against_brex`
- 「`securityClassification` の `01` はこの BREX では何を意味する？」 → `lookup_value`

:::tip[Claude Code では plugin からも入れられます]
3 つの MCP サーバーは MCP Registry（`io.github.shuji-bonji/s1000d-brex-mcp` など）と、個人の marketplace [shuji-bonji/claude-plugins](https://github.com/shuji-bonji/claude-plugins)（category `s1000d`）に載せています。Claude Code では `claude plugin marketplace add shuji-bonji/claude-plugins` の後に `claude plugin install s1000d-brex-mcp@shuji-bonji` で入ります。plugin は環境変数を設定しません。Claude Code では、`S1000D_SPEC_DIR` と `S1000D_CSDB_DIR` を設定したシェルから起動すれば、その値が渡ります。
:::

### 環境変数が渡らないとき（設定ファイル）

Claude Desktop は、plugin で入れたサーバーに環境変数を渡しません。このような場合は、設定ファイル `~/.config/s1000d-stack/config.json` に配布物と CSDB の場所を書いてください。環境変数が無いとき、3 つのサーバーはこのファイルを読みます（brex・verify・reader とも 0.3.0 以降）。

```json
{
  "specDir": "/path/to/s1000d/issue-7",
  "csdbDirs": ["/path/to/your/csdb"]
}
```

- 環境変数があれば、そちらが優先します。
- `~/` で始まるパスと、設定ファイルのあるフォルダーからの相対パスも使えます。
- 場所は `XDG_CONFIG_HOME` に従い、`S1000D_CONFIG` で別のファイルを指せます。
- 設定ファイルは呼び出しのたびに読み直すので、書き換えたあとにサーバーを再起動する必要はありません。


## 次に読むもの

- S1000D を初めて触る方は [IETM と S1000D](/s1000d-stack/ja/guide/ietm-and-s1000d/) から
- この道具の全体像は [S1000D Stack とは](/s1000d-stack/ja/guide/overview/) と [ユースケース](/s1000d-stack/ja/use-cases/) へ
- BREX を渡された方は [BREX（ビジネスルール交換）](/s1000d-stack/ja/guide/brex/) と [s1000d-brex-mcp](/s1000d-stack/ja/mcp/brex-mcp/) へ
- 概念を体系的に学びたい方は Zenn Book [IETM入門 — 概念から S1000D まで](https://zenn.dev/shuji_bonji/books/ietm-overview) へ
