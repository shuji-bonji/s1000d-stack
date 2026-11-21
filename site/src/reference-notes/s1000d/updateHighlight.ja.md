`updateHighlight` は、更新の理由（`reasonForUpdate`）をハイライトのデータモジュールに載せるかどうかを示す属性です。省略できます。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `1` | この更新の理由を、ハイライトのデータモジュールに載せます |
| `0` | この更新の理由を、ハイライトのデータモジュールに載せません |

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。`identAndStatus.reasonForUpdates[]` の `updateHighlight` に入ります |
| 更新の理由と一緒に書く | {{tool:writer/add_reason_for_update}} と {{tool:writer/start_revision}} の `reason.updateHighlight`、{{tool:writer/edit_data_module}} の `marking.reason.updateHighlight` |

どのツールも値を選びません。渡す値は `"0"` か `"1"` で、省略できます。
