---
title: 全体構成と進み方
description: s1000d-stack を構成するリポジトリと、段階ごとの進め方を説明します。
---

s1000d-stack は、構成表と学習サイトだけを持つ hub リポジトリと、独立した部品のリポジトリからなります。専門家エージェント（MCP と Skill）を先に作り、それを開発の道具として使いながら製品（作成ツール・閲覧ソフト）を作ります。

## 部品

```mermaid
flowchart TB
  subgraph Hub["s1000d-stack（hub）"]
    SITE["site/ 学習サイト"]
    STACK["stack.json 構成表"]
    DOCS["docs/ 計画と決定の記録"]
  end
  subgraph Lib["共有ライブラリ"]
    CORE["s1000d-core<br/>公開済み（npm 0.5.0）"]
    MODEL["experiential-manual-model<br/>公開済み（npm 0.1.0）"]
  end
  subgraph Mcp["MCP サーバー"]
    BREX["s1000d-brex-mcp<br/>公開済み（npm 0.4.0）"]
    R["s1000d-reader-mcp<br/>公開済み（npm 0.5.0）"]
    V["s1000d-verify-mcp<br/>公開済み（npm 0.5.0）"]
    W["s1000d-writer-mcp<br/>予定（段階 3）"]
  end
  subgraph App["製品"]
    ED["作成ツール<br/>構想（段階 3）"]
    VW["閲覧ソフト<br/>構想（段階 4）"]
  end
  SK["Skill<br/>構想（段階 3）"]
  BREX --> CORE
  R --> CORE
  V --> CORE
  W --> CORE
  W --> MODEL
  ED --> MODEL
  VW --> MODEL
  SK -.-> Mcp
```

| 部品 | 役割 | 状態（2026-10-27） |
| --- | --- | --- |
| [s1000d-core](https://github.com/shuji-bonji/s1000d-core) | DMC・ICN・識別・状態部・BREX 照合・XSD 検証・参照の解決・適用性の評価・本文の読み取り・修正候補の決定の共有ライブラリ | [npm 0.5.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-core) 公開済み |
| [s1000d-brex-mcp](/s1000d-stack/ja/mcp/brex-mcp/) | BREX の説明と照合（5 ツール） | [npm 0.4.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-brex-mcp) 公開済み |
| [s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) | データモジュールの本文を構造化して返す、参照の解決、適用性の判定（6 ツール） | [npm 0.5.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-reader-mcp) 公開済み |
| [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/) | 公式 XSD による検証、BREX 照合、参照切れの検出、修正提案、DML・DDN の照合（7 ツール） | [npm 0.5.0](https://www.npmjs.com/package/@shuji-bonji/s1000d-verify-mcp) 公開済み |
| [experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model) | 体験型マニュアルの共通データモデル（S1000D に依存しない）。型・JSON Schema・検査・2021 年の作品からの変換 | [npm 0.1.0](https://www.npmjs.com/package/@shuji-bonji/experiential-manual-model) 公開済み |
| s1000d-writer-mcp | 共通データモデルからデータモジュールを生成 | 予定（段階 3） |
| Skill | experience-to-s1000d / s1000d-publish / s1000d-review | 構想（段階 3） |
| 作成ツール・閲覧ソフト | 人が使う製品。AI が無くても動く | 構想（段階 3〜4） |

## 段階

| 段階 | 成果物 | 完了の条件 |
| --- | --- | --- |
| 1 | hub（このサイト）、s1000d-core、s1000d-brex-mcp | 自作 BREX とデータモジュールで照合のテストが通る。既定 BREX を読み、自作データモジュールを照合して仕様書と矛盾しない。サイトの説明を仕様書と照合済み |
| 2 | s1000d-reader-mcp、s1000d-verify-mcp、experiential-manual-model | 公式 XSD（利用者が入手したもの）による検証、参照の解決、適用性の判定ができる。reader の応答に版と検証状態を含める |
| 3 | s1000d-writer-mcp、Skill、作成ツールの試作 | 券売機の例を共通データモデル経由で S1000D に出力し、verify を通る |
| 4 | 閲覧ソフト | 共通データモデルを表示し、WebMCP で AI が操作を案内できる |

## 決めていること

- **名前は S1000D に寄せる**。MCP とライブラリは `s1000d-` で始めます。一般向けの製品には S1000D の名前を付けません。
- **仕様書・スキーマ・公式サンプルを同梱しない**。利用者が入手したものを `S1000D_SPEC_DIR` で指定します。
- **構成は houki-hub に揃える**。hub は構成表とサイトだけを持ち、各部品は独立したリポジトリです。
- **BREX の照合処理は s1000d-core に置く**。brex-mcp と verify-mcp はそれを呼ぶだけにします。
- **XML は @xmldom/xmldom、XPath は fontoxpath**。既定 BREX に XPath 2.0 の式があるためです。
- **XSD の検証は libxml2-wasm**。XSD ごとに 1 回コンパイルして使い回せ、公式サンプル 106 件を 0.5 秒以内で検証できます。インターフェースと実装は s1000d-core に置き、verify-mcp と reader-mcp が同じものを使います。
- **reader は適用性の式を LLM に渡さない**。判定はサーバーが行い、applicable / notApplicable / undetermined と表示文だけを返します。
- **npm への公開は Trusted Publisher**。tag の push で GitHub Actions が OIDC で公開します。

決定の経緯と未決事項は、hub リポジトリの `docs/DECISIONS.md` に番号付きで記録しています。

## 対象とする版

最初の対象は Issue 7 です。次に Issue 4.2 を対象にする予定で、国内外の実例が Issue 4 系に多いためです。`s1000d-core` は版ごとに読み分けられる構造にします。
