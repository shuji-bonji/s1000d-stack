`infoCode` は、データモジュールコード（DMC）の一部で、データモジュールがどの種類の情報かを示す情報コードです。値は英数字 3 文字です。{{attr:infoCodeVariant}} と組にして書きます。

## 値の意味

情報コードの一覧は、仕様書の Chap 8.4.1 にあります。既定 BREX は、データモジュールの `infoCode` に 593 個、データ更新ファイルの `infoCode` に 13 個の値を定めています。このページには、ほかの決まりに出てくる値だけを挙げます。

| 値 | 意味 |
| --- | --- |
| `022` | BREX データモジュール |
| `024` | ビジネスルール文書 |
| `040` | 説明 |

## 関連する決まり

- BREX データモジュールは、`infoCode` が `022`、{{attr:itemLocationCode}} が `D` です（既定 BREX の BREX-S1-00268）。
- ビジネスルール文書のデータモジュールは、`infoCode` が `024`、`itemLocationCode` が `D` です（BREX-S1-00265）。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 値の意味を引く | {{tool:brex/lookup_value}}（`target` に `infoCode`、`value` に確かめたい値） |
| 情報コードで絞り込む | {{tool:reader/list_data_modules}} の `filter.infoCode` |
| 新しく作るときに決める | {{tool:writer/build_data_module}} の `allocation.rules.infoCodeByKind`。既定の値はありません。省略すると `input-error` を返します |

どの情報コードを使うかは、プロジェクトが決めます。ツールは情報コードを選びません。
