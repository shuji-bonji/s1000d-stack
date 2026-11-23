# 応答に、答えたサーバーの版を載せる

S1000D Stack の 4 本の MCP（s1000d-brex-mcp・s1000d-verify-mcp・s1000d-reader-mcp・s1000d-writer-mcp）の応答に、答えたサーバーのパッケージ名と版、使っている s1000d-core の版を載せるための設計です。

- 状態: **実装済み、未公開**（2026-11-24）。s1000d-core（`CORE_INFO`）、4 本の MCP（`_server`）、4 つの Skill の報告、サイトの 4 ページ（日本語・英語）、Grok Build のキットに実装しました。「決めること」の V-1〜V-6 は、利用者が 2026-11-24 04:32 JST にすべて提案どおりと決めました（DECISIONS の D-38）
- Issue: [#12](https://github.com/shuji-bonji/s1000d-stack/issues/12)
- 出どころ: `eval/hosts/grok-build/reports/2026-11/FINDINGS.md` の H-04、`eval/hosts/grok-build/reports/2026-11/REFCHECK-FINDINGS.md` の H-06

## 目的

エージェントが、応答だけを見て「どのサーバーの、どの版が答えたか」を確かめられるようにします。公開した版と、実際に答えているプロセスの版が違うときに、それを応答から見分けられることが目的です。

## 背景

| # | 起きたこと |
|---|---|
| H-04（2026-11-05） | MCP の初期化で返す `serverInfo`（`name`・`version`）は、ツールの結果としてエージェントに届かない。Grok Build は、起動中のパッケージの `package.json` を読んで版を確かめていた |
| H-06（2026-11-24） | reader-mcp 0.14.0 を npm に公開した後も、Grok Build の `read_data_module` は 0.13.1 の数え方を返した。Grok の reader のプロセスは公開の前に起動していて、読み込んだ 0.13.1 のコード（core 0.14.0）のまま動いていた。npx のキャッシュは 0.14.0 に差し替わっていたので、ディスク上の `package.json` を読んでも、答えたプロセスの版は分からなかった |

H-06 の取り違えは、サーバー自身の版ではなく、依存している core の版の違いで起きました。reader 0.14.0 はコードを変えておらず、core を 0.16.0 に上げただけだったからです。そのため、サーバーの版だけでなく core の版も要ります。

## 範囲

| 区分 | 内容 |
|---|---|
| 扱う | 4 本の MCP の、すべてのツールの応答（成功・想定内の失敗・想定外の失敗） |
| 扱う | core が自分の版を外に出す手段 |
| 扱う | サイトの各 MCP のページ、Skill の報告、Grok Build のキットの手順への反映 |
| 扱わない | MCP の初期化の `serverInfo`。今のまま `PACKAGE_INFO` を返す |
| 扱わない | brex の `_note` と、ほかの 3 本の `_notes` の名前の違い（FINDINGS.md の F-10）。別に扱う |

## 今の作り

4 本とも、`src/server.ts` の `buildServer()` で、ツールの結果を同じ形の包みで返しています。

| 場合 | 返す形 |
|---|---|
| 成功 | ハンドラの結果をそのまま `JSON.stringify` する |
| 想定内の失敗（`ToolInputError`） | `{"error": {"code", "path", "detail"}}`。`isError` は付けない |
| 想定外の失敗 | `{"error": "…"}` と `isError: true` |

サーバーの名前と版は、4 本とも `src/config.ts` の `PACKAGE_INFO`（`package.json` の `name`・`version`）にあります。core は自分の版を外に出していません。

この包みに 1 か所足せば、ツールごとのハンドラを変えずに、すべての応答に載せられます。

## 決めること

### V-1 載せる場所

| 案 | 内容 | 長所 | 短所 |
|---|---|---|---|
| A（提案） | 応答の最上位に、決まった項目を 1 つ足す | 機械でも読める。`_notes` の名前の違い（F-10）に関係しない | 応答の形が変わる（項目が 1 つ増えるだけ） |
| B | `_notes` に文を 1 つ足す | 形が変わらない | 文を解析しないと比べられない。brex は `_note`（文字列）なので、ほかの 3 本と揃わない |

**提案: A。**

### V-2 項目の名前と形

**提案: 名前は `_server`、形は次のとおり。**

```json
"_server": {
  "name": "@shuji-bonji/s1000d-reader-mcp",
  "version": "0.14.0",
  "core": "0.16.0"
}
```

- 先頭の `_` は、`_notes` と同じく「ツールの結果そのものではない、応答についての情報」であることを表します。
- `core` は、実際に読み込まれている core の `package.json` の `version` です。依存の指定（`^0.16.0`）ではありません。

### V-3 core の版を載せるか

**提案: 載せる。** H-06 は、core の版の違いで起きたからです。core に、自分の名前と版を返す `CORE_INFO`（`{ name, version }`）を足します。core の `package.json` を、core 自身が読みます。

この変更のため、4 本の MCP の依存を、`CORE_INFO` を持つ core の版に上げる必要があります。

### V-4 失敗の応答にも載せるか

**提案: 3 つの場合すべてに載せる。** 版を確かめたくなるのは、思わぬ失敗が返ったときが多いからです。

- 想定内の失敗: `{"error": {...}, "_server": {...}}`
- 想定外の失敗: `{"error": "…", "_server": {...}}`（`isError: true` はそのまま）

### V-5 応答の中の位置

| 案 | 内容 |
|---|---|
| A（提案） | 最後の項目にする |
| B | 最初の項目にする |

**提案: A。** reader の `read_data_module` は「`verification` と `securityClassification` を応答の最初に置く」とツールの説明に書いています。その順番を崩さないためです。

### V-6 Skill とキットでの使い方

**提案: 次の 2 つを行う。**

- 4 つの Skill の Report に、使った MCP の `_server`（名前・版・core の版）を書く欄を足します。
- Grok Build のキットの手順に、最初のツールの呼び出しで `_server` を記録し、npm の公開版と比べることを足します。版が違えば、ホストを起動し直すよう案内します。

## 実装の形（V-1〜V-6 が提案どおりの場合）

| リポジトリ | 変更 |
|---|---|
| s1000d-core | `CORE_INFO` を足して公開する。テストで、`package.json` の `version` と一致することを確かめる |
| 4 本の MCP | `src/config.ts` に `SERVER_INFO = { name, version, core: CORE_INFO.version }` を足す。`src/server.ts` の包みで、3 つの場合すべてに `_server` を最後に足す。テストで、成功・想定内の失敗・想定外の失敗のそれぞれに `_server` が付くことを確かめる。サーバーの `instructions` に `_server` の意味を書く |
| 4 つの Skill | Report の型に `_server` の欄を足す |
| hub | サイトの各 MCP のページに `_server` を書く。Grok Build のキットの手順を直す |

応答 1 件あたり、およそ 100 バイト増えます。

## 実装のときに決めたこと

- `_server` の版と npm の公開版を比べる手順は、Grok Build のキットだけに置き、Skill には入れません。Skill の報告には `_server` を書き写すだけにします。Skill の利用者は、npm を確かめる手段を持たないことがあるためです（D-38）
- HTTP で動かすとき（`src/http.ts`）も同じ包みを通るかを、実装のときに確かめる
