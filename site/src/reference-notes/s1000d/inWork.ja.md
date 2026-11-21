`inWork` は、データモジュールの作業中番号を示す属性です。{{attr:issueNumber}} と組にして版を表します。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `00` | 発行済みの版です |
| `01`〜`99` | 作業中の版です。最初は `01` で、発行前のデータモジュールを変えるたびに上げます |

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。`issueInfo` に入ります |
| 作業中の版を始める | {{tool:writer/start_revision}}。`inWork` を `01` にして、新しいファイルに書きます。発行済みの版のファイルは変えません |
| 発行済みの版を守る | {{tool:writer/edit_data_module}} は、`inWork` が `00` の版を、`allowReleasedIssue: true` を渡したときだけ編集します。`marking` を渡した編集は、この値を渡しても断ります |

発行の操作（`inWork` を `00` に戻し、`issueNumber` を上げる）は、このスタックにまだありません。
