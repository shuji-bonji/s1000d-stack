`issueNumber` は、データモジュールやデータ管理リストの発行番号を示す属性です。{{attr:inWork}} と組にして版を表します。

## 関連する決まり

- 最初の発行までは、作業中の版が `000`、最初の発行が `001` です（既定 BREX の BREX-S1-00030）。
- 1,000 未満の値は 3 桁で書きます（BREX-S1-00274）。1,000 から 9,999 までの値は 4 桁で書きます（BREX-S1-00275）。
- ファイル名では、発行番号と作業中番号を `_002-01` のように並べます。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/list_data_modules}} と {{tool:reader/read_data_module}}。`issueInfo` に入ります |
| 新しく作るときに決める | {{tool:writer/build_data_module}}。下書きの `issueInfo` を渡すか、`issuePolicy`（`increment-issue`・`increment-inwork`・`keep`）で決めます |
| 作業中の版を始める | {{tool:writer/start_revision}}。`issueNumber` は変えません |

発行の操作（`inWork` を `00` に戻し、`issueNumber` を上げる）は、このスタックにまだありません。
