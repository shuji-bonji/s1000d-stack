`issueType` は、データモジュールなどの CSDB オブジェクトの版が、どういう状態の版かを示す属性です。値は 8 つです。

## 値の意味

| 値 | 意味 |
| --- | --- |
| `new` | 最初の発行までの版です。`issueNumber` は、作業中の版では `000`、最初の発行では `001` です |
| `changed` | 変更があり、その変更を変更の印で示している版です |
| `revised` | 全体を改訂していて、変更の印を持たない版です |
| `status` | 識別・状態部の情報を更新した版です |
| `deleted` | 削除した版です。データモジュールは CSDB から物理的には消さず、この値で削除済みと示します |
| `rinstate-changed` | 削除したデータモジュールを復帰させた版で、変更を変更の印で示しているものです |
| `rinstate-revised` | 削除したデータモジュールを復帰させた版で、変更を変更の印で示していないものです |
| `rinstate-status` | 削除したデータモジュールを復帰させた版で、状態の情報だけが変わったものです |

## 値の選び方

次の表は目安です。プロジェクトのビジネスルールに定めがあれば、そちらに従ってください。

| 場面 | 値 |
| --- | --- |
| 新しく作り、まだ一度も発行していない | `new` |
| 発行済みの版に手順を足し、足した場所を変更の印で示す | `changed` |
| 全体を書き直した。変更の印は付けない | `revised` |
| 機密区分や品質保証の状態だけを変えた。本文は変えていない | `status` |

## 関連する決まり

- 値ごとの決まりは、既定 BREX の BREX-S1-00030（`new`）、BREX-S1-00031（`deleted`）、BREX-S1-00032（`changed`・`rinstate-changed`）、BREX-S1-00033（`revised`・`rinstate-revised`）、BREX-S1-00034（`status`・`rinstate-status`）にあります。
- `issueType` が `changed` でない版は、`issueNumber` が `001` より大きければ、`reasonForUpdate` が 1 つ以上必要です（既定 BREX の BREX-S1-00038）。
- 仕様書の Chap 3.9.5.1 の Table 3 は、`001-00` の次の作業中の版（`001-01`）の `issueType` を `new` としています。既定 BREX の BREX-S1-00030 は、この組み合わせを違反にします。2 つは食い違っています。

## このスタックでは

| 操作 | ツール |
| --- | --- |
| 読む | {{tool:reader/read_data_module}}。識別・状態部（`identAndStatus`）に入ります |
| 作業中の版を始めるときに決める | {{tool:writer/start_revision}} の `issueType`。省略できません。`changed`・`revised`・`status` から利用者が選びます |
| DML と照合する | {{tool:verify/reconcile_dml}}。DML の行の `issueType` を、書かれた値のまま返します |

どのツールも `issueType` の値を選びません。値の意味の解釈もしません。
