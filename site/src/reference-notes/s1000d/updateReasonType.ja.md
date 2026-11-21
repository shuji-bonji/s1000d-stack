`updateReasonType` は、データモジュールを改版したときに書く更新の理由（`reasonForUpdate`）が、どの種類の変更かを示す属性です。省略できます。`reasonForUpdate` は、`dmStatus`、`pmStatus`、`imfStatus`、`scormContentPackageStatus`、`targetDmStatus` と、`frontmatter.xsd` の `frontMatterDmEntry`・`frontMatterPmEntry`・`frontMatterExternalPubEntry` の中に書きます。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `urt01` | 編集上の変更です。技術的な変更を含みません。この理由に結び付く変更の印は付けません |
| `urt02` | 技術的な変更です。`issueType` が `revised` の版でなければ、この理由に結び付く変更の印が必要です |
| `urt03` | マークアップだけの変更です。技術的な内容に影響し、`issueType` が `changed` の版であれば、変更の印を付けます |
| `urt04` | 適用性の記述だけの変更です。技術的な内容に影響しないとき、または `issueType` が `changed` でないときは、変更の印を付けません |
| `urt05` | 参照の記述だけの変更です。変更の印の扱いは `urt04` と同じです |
| `urt51`〜`urt99` | プロジェクトが意味を決める値です |

## 値の選び方

次の表は目安です。プロジェクトのビジネスルールに定めがあれば、そちらに従ってください。

| 場面 | 値 |
| --- | --- |
| 誤字を直した。手順の意味は変わらない | `urt01` |
| 手順を足した。締め付けの値を変えた | `urt02` |
| 要素の入れ子や属性だけを直した。表示される文は変わらない | `urt03` |
| 対象の機種を足した。手順の内容は変わらない | `urt04` |
| 参照先だけを直した。手順の内容は変わらない | `urt05` |

## 関連する決まり

- `updateReasonType` を書かない `reasonForUpdate` は、技術的な変更として扱われます（Chap 3.9.5.2.1.1 の Para 2.2）。
- 同じ理由による変更は、同じ `reasonForUpdate` を指します（Chap 3.9.5.2.1.1 の Para 2.1.3）。
- `issueType` が `changed` でない版は、`issueNumber` が `001` より大きければ、`reasonForUpdate` が 1 つ以上必要です（既定 BREX の BREX-S1-00038）。
- ハイライトのデータモジュールに載せるかどうかは、{{attr:updateHighlight}} で示します。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。`identAndStatus.reasonForUpdates[]` の `updateReasonType` に入ります |
| 更新の理由だけを足す | {{tool:writer/add_reason_for_update}} |
| 作業中の版を始めるときに足す | {{tool:writer/start_revision}} の `reason` |
| 変更の印と一緒に足す | {{tool:writer/edit_data_module}} の `marking.reason` |
| 値が許可されているかを確かめる | {{tool:brex/lookup_value}}（`target` に `updateReasonType`、`value` に確かめたい値） |

どのツールも、`updateReasonType` の値を選びません。利用者が決めた値を受け取ります。値の意味の解釈もしません。
