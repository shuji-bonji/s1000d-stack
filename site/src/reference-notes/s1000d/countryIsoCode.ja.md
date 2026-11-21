`countryIsoCode` は、その言語が使われる国を示す属性です。値は ISO 3166 の 2 文字のコードで、大文字で書きます。`language` 要素に、{{attr:languageIsoCode}} と組にして書きます。

## 関連する決まり

- ファイル名の末尾には、言語と国を `_JA-JP` のように大文字で並べます。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。`language` に入ります |
| 新しく作るときに書く | {{tool:writer/build_data_module}} の `draft.language` |
| 翻訳した版を作る | {{tool:writer/apply_segments}} の `language` |
