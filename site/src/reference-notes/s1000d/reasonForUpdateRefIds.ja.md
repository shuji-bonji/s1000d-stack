`reasonForUpdateRefIds` は、変更の印を付けた要素から、その変更の理由である `reasonForUpdate` の `id` を指す属性です。{{attr:changeType}}・{{attr:changeMark}} と組にして書きます。省略できます。型は `xs:IDREFS` なので、空白で区切って複数の `id` を書けます。

## 関連する決まり

- 同じ理由による変更は、同じ `reasonForUpdate` を指します（Chap 3.9.5.2.1.1 の Para 2.1.3）。
- 編集上の変更（{{attr:updateReasonType}} が `urt01`）の `reasonForUpdate` を指す変更の印は付けません（Chap 3.9.5.2.1.1 の Para 2.2）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。節点と参照の `change.reasonForUpdateRefIds` に入ります |
| 新しい理由を足して、それを指す | {{tool:writer/edit_data_module}} の `marking.reason` |
| 既にある理由を指す | {{tool:writer/edit_data_module}} の `marking.reasonRefId`。値は `identAndStatus.reasonForUpdates[].id` です |

`marking` は、`reason` と `reasonRefId` のどちらか一方だけを受け取ります。その理由による最初の編集には `reason`、2 回目からの編集には `reasonRefId` を使います。
