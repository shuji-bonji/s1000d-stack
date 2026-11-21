`infoCodeVariant` は、データモジュールコード（DMC）の一部で、情報コードの枝番です。値は英数字 1 文字です。{{attr:infoCode}} と組にして書きます。決まりは、仕様書の Chap 4.3.7 にあります。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。データモジュールコードの一部として返します |
| 新しく作るときに決める | {{tool:writer/build_data_module}} の `allocation.rules.infoCodeByKind`。種類ごとに、`infoCode` と `infoCodeVariant` の両方を渡します |
