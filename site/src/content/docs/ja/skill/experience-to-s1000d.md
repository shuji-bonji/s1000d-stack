---
title: experience-to-s1000d
description: 体験型マニュアルの JSON を S1000D の CSDB に変換して検証し、結果を報告する Skill の、渡すもの・前提の MCP サーバー・手順の流れ・しないことを説明します。
---

`experience-to-s1000d` は、体験型マニュアル（[experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model) の JSON）を S1000D® の CSDB（データモジュール、パブリケーションモジュール、図の原本）に変換する Skill です。Skill は、どの MCP サーバーをどの順番で呼び、各段階で利用者に何を聞くかを Claude に伝える手順で、変換や検証の処理は持ちません。判定はすべて MCP サーバーの応答を根拠にします。

[GitHub](https://github.com/shuji-bonji/experience-to-s1000d-skill) / [Release](https://github.com/shuji-bonji/experience-to-s1000d-skill/releases)

## 何をする Skill か

- **渡すもの**: マニュアルの JSON のパス、出力先の CSDB のフォルダー、機密区分、採番の規則（モデル識別コード、システム差異コード、SNS、種類ごとの情報コード、CAGE コード）です。作成ツールの試作（仮称 manual-editor）が保存する JSON を渡せます。
- **受け取るもの**: Topic ごとのデータモジュールとパブリケーションモジュール 1 件、図の原本、変換の結果をまとめた Conversion Report（検証状態、自動で直した修正、表せなかったもの、書き込んだファイル）です。書き込みは、利用者が確認した後に行います。

## 前提の MCP サーバー

| MCP サーバー | 必須・任意 | 最低版 | 役割 |
| --- | --- | --- | --- |
| [s1000d-writer-mcp](/s1000d-stack/ja/mcp/writer-mcp/) | 必須 | 0.1.1 | マニュアルを変換して検証し（`convert_manual`）、選んだ修正を適用します（`apply_fixes`） |
| [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/) | 必須 | 0.6.0 | 書き込んだ CSDB 全体を検証します（`verify_csdb`） |
| [s1000d-brex-mcp](/s1000d-stack/ja/mcp/brex-mcp/) | 任意 | 0.4.0 | 図の形式や機密区分の許可値を、プロジェクトの BREX で確かめます（`list_notations`、`lookup_value`） |
| [s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) | 任意 | 0.7.0 | 変換した結果を構造として読んで見せます（`read_data_module`） |

必須のサーバーが接続されていないとき、Skill は作業を始めず、接続の方法を伝えて止まります。任意のサーバーが接続されていないときは、報告の該当項目に「未実施（ツール未接続）」と書きます。

## 手順の流れ

```mermaid
flowchart LR
  A["入力と採番の規則を<br/>利用者に確かめる"] --> B["書き込まずに変換する"]
  B --> C["残った修正を<br/>利用者が選ぶ"]
  C --> D["確認後に書き込む"]
  D --> E["CSDB 全体を検証する"]
  E --> F["Conversion Report"]
```

1. マニュアルのパス、出力先の CSDB のフォルダー、機密区分を確かめます。機密区分の値は解釈せず、利用者が答えた値をそのまま書きます。
2. 採番の規則を聞きます。情報コードの既定はないので、プロジェクトが登録したコードを聞きます。
3. 書き込まずに変換し、データモジュールの一覧、検証状態、表せなかったもの（ホットスポットの座標など）を報告します。
4. 残った修正のうち、候補が複数あるものは利用者が選び、候補がないものは利用者に聞きます。候補が 1 つに決まる修正は、サーバーが自動で適用し、報告に載せます。
5. 利用者が書き込み先を確認してから書き込み、CSDB 全体を検証します。
6. 採番の台帳（`<manual>.ledger.json`）をマニュアルの隣に保存することを提案します。次の変換でこの台帳を渡すと、同じ Topic に同じ DMC が付きます。
7. 変換の結果と検証状態を Conversion Report にまとめます。

## Skill がしないこと

- XML を書きません。XML は writer サーバーが組み立てます。
- 情報コードの値を、利用者に聞かずに決めません。
- 候補の外の値で修正しません。
- ホットスポットの座標など、データモジュールで表せなかったものを、変換できたとは書きません。
- 適用性・条件・製品の相互参照表（ACT・CCT・PCT）を作りません。
- `schema-not-found` と `not-run` を合格とは書きません。S1000D への準拠は判定しません。

## 入れ方

Claude Code では、次のコマンドで入れます。

```text
/plugin install experience-to-s1000d@shuji-bonji
```

必須の MCP サーバーは、Skill の `plugin.json` に依存として宣言してあります。MCP サーバーの設定（`S1000D_SPEC_DIR` など）は[導入手順](/s1000d-stack/ja/guide/getting-started/)にあります。

## 関連ページ

- [s1000d-writer-mcp](/s1000d-stack/ja/mcp/writer-mcp/): 変換と修正の適用を行うサーバーです。
- [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/): 書き込んだ CSDB を検証するサーバーです。
- [experiential-manual-model](https://github.com/shuji-bonji/experiential-manual-model): マニュアルの JSON の形式を定めたライブラリです。
- [ユースケース](/s1000d-stack/ja/use-cases/): 使い方 3 に、この Skill を使う流れがあります。
