`internalRefTargetType` は、`internalRef`（同じデータモジュールの中への参照）が、どの種類の対象を指しているかを示す属性です。省略できます。

## 値の意味

| 値 | 指す対象 |
| --- | --- |
| `irtt01` | 図 |
| `irtt02` | 表 |
| `irtt03` | マルチメディア |
| `irtt04` | 補給品 |
| `irtt05` | 支援器材 |
| `irtt06` | 予備品 |
| `irtt07` | 段落 |
| `irtt08` | 手順 |
| `irtt09` | グラフィック |
| `irtt10` | マルチメディアオブジェクト |
| `irtt11` | ホットスポット |
| `irtt12` | パラメーター |
| `irtt13` | ゾーン |
| `irtt14` | 作業場所 |
| `irtt15` | サービスブレティンの資材セット |
| `irtt16` | アクセスポイント |
| `irtt51`〜`irtt99` | プロジェクトが意味を決める値です |

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。`internalRef` の参照に、書かれた値のまま入ります |
| 参照先があるかを確かめる | {{tool:verify/check_references}}。`internalRef` が指す `id` が、同じデータモジュールにあるかを確かめます |
| 値が許可されているかを確かめる | {{tool:brex/lookup_value}} |
