---
title: updateReasonType
description: S1000D Issue 7 の属性 updateReasonType（更新の理由の種類）に書ける値、値の選び方、関連する決まり、S1000D Stack のツールでの扱いを説明します。
---

:::note[このページについて]
S1000D® Issue 7 の内容を、このプロジェクトが自分の言葉でまとめた非公式の手引きです。2026-07-16 付けの配布物をもとに書いています。このプロジェクトは ASD とは無関係です（[仕様書の扱いと商標](/s1000d-stack/ja/guide/license/)）。正式な定義は、仕様書の Chap 3.9.6.1（Table 82）と、[S1000D Issue 7 のデータ辞書](https://users.s1000d.org/S1000D_DD_7/Files/attributes/updateReasonType.xml)にあります。
:::

`updateReasonType` は、データモジュールを改版したときに書く更新の理由（`reasonForUpdate`）が、どの種類の変更かを示す属性です。省略できます。

## 付く要素

`updateReasonType` が付く要素は `reasonForUpdate` だけです。`reasonForUpdate` は、次の要素の中に書きます。

| 親の要素 | スキーマ |
| --- | --- |
| `dmStatus` | データモジュールのスキーマ 21 本（`descript.xsd`、`proced.xsd` など） |
| `pmStatus` | `pm.xsd`（パブリケーションモジュール） |
| `imfStatus` | `icnmetadata.xsd` |
| `scormContentPackageStatus` | `scormcontentpackage.xsd` |
| `targetDmStatus` | `update.xsd` |
| `frontMatterDmEntry`、`frontMatterPmEntry`、`frontMatterExternalPubEntry` | `frontmatter.xsd` |

## 書ける値

書ける値は、XML スキーマと BREX（Business Rules Exchange）の 2 段階で決まります。

| 定めるもの | 内容 |
| --- | --- |
| XML スキーマ | 型は `updateReasonTypeAttType` です。値は `urt01` から `urt99` までの 99 個の列挙です |
| 既定 BREX（BREX-S1-00242） | `urt01`〜`urt05` と、範囲 `urt51~urt99` だけを許可します。対象はすべてのスキーマです |

`urt06`〜`urt50` は、XML スキーマの検証は通りますが、既定 BREX との照合では違反になります。

既定 BREX は、値ごとに下位の BREX での調整のしかたも定めています。

| 値 | `valueForm` | `valueTailoring` |
| --- | --- | --- |
| `urt01`〜`urt05` | `single` | `lexical` |
| `urt51~urt99` | `range` | `restrictable` |

## 値の意味

| 値 | 意味 |
| --- | --- |
| `urt01` | 編集上の変更です。内容は変わっていますが、技術的には重要でないと判断された変更です |
| `urt02` | 技術的な変更です。内容が変わっていて、見直しが必要な変更です |
| `urt03` | マークアップだけの変更です |
| `urt04` | 適用性だけの変更です |
| `urt05` | 参照している側の構造の一意識別子の変更です |
| `urt51`〜`urt99` | プロジェクトが意味を決める値です |

## 値の選び方

次の表は目安です。プロジェクトのビジネスルールに定めがあれば、そちらに従ってください。

| 場面 | 値 |
| --- | --- |
| 誤字を直した。手順の意味は変わらない | `urt01` |
| 手順を足した。締め付けの値を変えた | `urt02` |
| 要素の入れ子や属性だけを直した。表示される文は変わらない | `urt03` |
| 対象の機種を足した | `urt04` |

## 関連する決まり

- `urt01` の理由には、変更の印（`changeType`・`changeMark`）を結び付けません（Chap 3.9.5.2.1.1 の Para 2.2）。
- `updateReasonType` を書かない `reasonForUpdate` は、技術的な変更として扱われます（同じ Para 2.2）。
- 同じ理由による変更は、同じ `reasonForUpdate` を指します（Chap 3.9.5.2.1.1 の Para 2.1.3）。
- `issueType` が `revised` または `status` の版は、`issueNumber` が `000` か `001` でなければ、`reasonForUpdate` が必要です（既定 BREX の BREX-S1-00038）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | [s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) の `read_data_module`。識別・状態部の `reasonForUpdates[]` に `updateReasonType` が入ります |
| 更新の理由だけを足す | [s1000d-writer-mcp](/s1000d-stack/ja/mcp/writer-mcp/) の `add_reason_for_update` |
| 作業中の版を始めるときに足す | s1000d-writer-mcp の `start_revision`（`reason`） |
| 変更の印と一緒に足す | s1000d-writer-mcp の `edit_data_module`（`marking.reason`） |
| 値が許可されているかを確かめる | [s1000d-brex-mcp](/s1000d-stack/ja/mcp/brex-mcp/) の `lookup_value`（`target` に `updateReasonType`、`value` に確かめたい値） |

どのツールも、`updateReasonType` の値を選びません。利用者が決めた値を受け取ります。値の意味の解釈もしません。

## 出典

- 仕様書の Chap 3.9.6.1（Table 82）、Chap 3.9.5.2.1.1
- 既定 BREX の BREX-S1-00242、BREX-S1-00038
- [S1000D Issue 7 のデータ辞書の `updateReasonType`](https://users.s1000d.org/S1000D_DD_7/Files/attributes/updateReasonType.xml)。初めて開くときは、表示までに時間がかかります
