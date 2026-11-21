`changeMark` は、変更した要素の横に、変更バーなどの目印を表示するかどうかを示す属性です。{{attr:changeType}}・{{attr:reasonForUpdateRefIds}} と組にして書きます。省略できます。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `1` | 目印を表示します |
| `0` | 目印を表示しません |

## 関連する決まり

- 編集上の変更には、変更の印を付けません（既定 BREX の BREX-S1-00044、Chap 3.9.5.2.1.1 の Para 2.1.1）。
- `changeType` を書かずに `changeMark` を書いた要素は、足した要素として扱われます（Chap 3.9.5.2.1.1 の Para 2.4.1）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。節点と参照の `change.changeMark` に入ります |
| 編集のときに付ける | {{tool:writer/edit_data_module}} の `marking.changeMark`。`marking` を渡すときは省略できません |

ツールは `changeMark` の値を選びません。利用者が決めた値を受け取ります。
