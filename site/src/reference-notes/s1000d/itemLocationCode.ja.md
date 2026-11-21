`itemLocationCode` は、データモジュールコード（DMC）の末尾の 1 文字で、情報がどの場所にある品目についてのものかを示す属性です。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `A` | 製品に取り付けた状態の品目についての情報です |
| `B` | 製品から取り外した主要な組立品に付いている品目についての情報です |
| `C` | 作業台の上の品目についての情報です |
| `D` | `A`・`B`・`C` の 3 つすべてに当てはまる情報です |
| `T` | 訓練についての情報です |

## 関連する決まり

- BREX データモジュールとビジネスルール文書のデータモジュールは、`itemLocationCode` が `D` です（既定 BREX の BREX-S1-00268、BREX-S1-00265）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。データモジュールコードの一部として返します |
| 新しく作るときに決める | {{tool:writer/build_data_module}} の `allocation.rules.itemLocationCode` |
