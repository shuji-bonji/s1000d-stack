`changeType` は、要素に付ける変更の印のうち、変更の種類を示す属性です。{{attr:changeMark}}・{{attr:reasonForUpdateRefIds}} と組にして書きます。省略できます。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `add` | 要素を足しました |
| `modify` | 要素を変えました |
| `delete` | 要素を取り除きました |

## 関連する決まり

- `changeType` を書かずに `changeMark` を書いた要素は、足した要素として扱われます（Chap 3.9.5.2.1.1 の Para 2.4.1）。
- `add` または `delete` の印を付けた要素の子には、印を付ける必要がありません。子に付けた印は、表示のときに無視されます。
- `modify` の印を付けた要素の中には、`add`・`modify`・`delete` の印を付けた要素を置けます。
- `issueType` が `changed` でない版には、変更の印を置けません（既定 BREX の BREX-S1-00036。ルールの XPath は、`changed`・`status`・`rinstate-changed`・`rinstate-status` の版を対象から外しています）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。節点と参照の `change` と、データモジュール全体の一覧 `changeMarks[]` に入ります |
| 編集のときに付ける | {{tool:writer/edit_data_module}} の `marking`。足した要素に `add`、取り除く要素に `delete` を付けます。同じ親の中で移した要素は、親の要素に `modify` を付けます |
| 次の版を始めるときに消す | {{tool:writer/start_revision}}。前の版の印を消し、`delete` の印が付いた要素を取り除きます |

`delete` の印が付いた要素を次の版で取り除くことは、仕様書の読んだ範囲に明記が無く、このスタックの解釈です。
