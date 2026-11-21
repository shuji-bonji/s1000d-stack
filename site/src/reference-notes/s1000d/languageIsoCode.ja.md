`languageIsoCode` は、データモジュールの言語を示す属性です。`language` 要素に、{{attr:countryIsoCode}} と組にして書きます。

## 値の意味

値は、ISO 639 の言語コードです。簡易化した言語には、ISO 639 のコードと重ならない別のコードを使います。

| 値の例 | 意味 |
| --- | --- |
| `en`、`ja` | ISO 639 のコード（英語、日本語） |
| `sx` | ASD-STE100（Simplified Technical English）で書いたデータモジュール |

## 関連する決まり

- ファイル名の末尾には、言語と国を `_JA-JP` のように大文字で並べます。
- 翻訳したデータモジュールは、データモジュールコードが同じで、言語と国だけが違います。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。`language` に入ります |
| 新しく作るときに書く | {{tool:writer/build_data_module}} の `draft.language` |
| 翻訳した版を作る | {{tool:writer/apply_segments}} の `language`。データモジュールコードは変えず、言語だけを変えます |
