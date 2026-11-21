---
title: s1000d-writer-mcp
description: LLM が XML を書かずにデータモジュールを作り、検証して直し、既にあるデータモジュールの構造を編集し、発行済みの版から作業中の版を始めて変更の印を付け、翻訳用に文を出し入れする MCP サーバーの設定とツールを説明します。
---

`s1000d-writer-mcp` は、S1000D® のデータモジュールを LLM が **XML を書かずに**作るための MCP サーバーです。LLM は題名・段落・手順・参照先を木の形（下書き）で渡し、採番の規則を添えます。サーバーが DMC や ICN を付けて XML を組み立て、XSD・BREX・参照で検証し、直し方が 1 つに決まる修正だけを自動で適用します。残った修正は候補を付けて返します。ツールは 9 つで、データモジュールの作成、体験型マニュアルの変換、修正の適用、既にあるデータモジュールの構造の編集、作業中の版の開始、更新の理由の追加、コメントデータモジュールの作成、翻訳用の文の取り出しと書き戻しを行います。

[GitHub](https://github.com/shuji-bonji/s1000d-writer-mcp) / [npm](https://www.npmjs.com/package/@shuji-bonji/s1000d-writer-mcp)

## 3 つの方針

- **LLM に XML を書かせません。** 新しく作るときの入力は下書き（`draft`）の木だけで、LLM が書いた XML を渡す入口はありません。DMC・ICN・BREX の参照は、LLM が考え出さずに、採番の規則からサーバーが付けます。既存の XML を渡せるのは `apply_fixes`・`edit_data_module`・`start_revision`・`add_reason_for_update`・`extract_segments`・`apply_segments` です。節点を足す・取り除く・移すのは `edit_data_module` だけで、足す中身は XML ではなく下書きの節点で渡します。
- **候補の外の値で直しません。** 修正を適用するとき、サーバーは候補を計算し直し、その候補と一致する選択だけを適用します。値を自由に書き込む入口はありません。
- **既定では書き込みません。** 組み立てた XML は応答に返すだけです。CSDB への書き込みは、`write: true` を渡したときだけ行います。

## できること

| ツール | 内容 |
| --- | --- |
| [`build_data_module`](/s1000d-stack/ja/reference/stack/writer/build-data-module/) | 下書き 1 件（説明・手順・プロセス・故障探求・パブリケーションモジュール）と採番の規則から、データモジュールを 1 件組み立てます。組み立てたあとに XSD・BREX・参照を検証し、`exact` の修正だけを最大 `maxFixRounds` 回（既定 3）まで自動で適用します。残った修正は `fixes[]` に候補付きで返します |
| [`convert_manual`](/s1000d-stack/ja/reference/stack/writer/convert-manual/) | 体験型マニュアル（[`@shuji-bonji/experiential-manual-model`](https://www.npmjs.com/package/@shuji-bonji/experiential-manual-model)）を、Topic ごとのデータモジュールとパブリケーションモジュール 1 件に変換します。各データモジュールは `build_data_module` と同じ流れで組み立てて検証します。データモジュール・パブリケーションモジュール・ICN の相互の参照は、CSDB に今回作ったデータモジュールを重ねた上で解決します。変換で表せなかったものは `notRepresented` に件数で返します |
| [`apply_fixes`](/s1000d-stack/ja/reference/stack/writer/apply-fixes/) | 既存のデータモジュールに、`fixes[]` で返した候補の中から選んだ修正を適用します。選択は候補の写しでなければならず、候補の外の値や範囲に合わない値は、理由を付けて `rejected[]` に入れます。適用後に再検証します |
| [`edit_data_module`](/s1000d-stack/ja/reference/stack/writer/edit-data-module/) | 既にある手順・説明のデータモジュールに、節点を足す・取り除く・移す編集を行います。場所は `location.path` で指し、足す節点は下書きの節点（`step`・`para`・`admonition`・`listItem`）で渡します。元の文字列の編集した範囲だけを書き換え、ほかは 1 文字も変えません。`marking` を渡さなければ、版と変更の印（`changeType` など）は変えません。`marking` を渡すと、作業中の版に変更の印を付けます。編集で XSD のエラーが増えた結果は書き込みません |
| [`start_revision`](/s1000d-stack/ja/reference/stack/writer/start-revision/) | 発行済みのデータモジュールから、作業中の版を始めます。`inWork` を `01` にし、`issueNumber` はそのまま、`issueType` は渡された値（`changed`・`revised`・`status`。サーバーは選びません）にします。前の版の変更の印と更新の理由を消し、`changeType="delete"` の要素を取り除きます。発行済みの版は変えず、作業中の版を新しいファイルとして書きます。`reason` を渡すと、同じ呼び出しで更新の理由を 1 つ足します |
| [`add_reason_for_update`](/s1000d-stack/ja/reference/stack/writer/add-reason-for-update/) | 作業中の版の識別・状態部に、更新の理由（`reasonForUpdate`）を 1 つ足します。本文には触らず、変更の印も付けません。変更の印を付けない変更（編集上の変更 `urt01`、`issueType` が `revised`・`status` の版）の理由を書くときに使います |
| [`create_comment`](/s1000d-stack/ja/reference/stack/writer/create-comment/) | コメントデータモジュール（`comment`）を組み立てて検証します。連番は、省略すると CSDB の次の番号になります |
| [`extract_segments`](/s1000d-stack/ja/reference/stack/writer/extract-segments/) | データモジュールから、人が読む文（題名・段落・手順・警告・表のセル・図の題）を翻訳用に取り出します。インライン要素は `{1}` `{2}` の記号に置き換え、骨組みの照合に使う `skeletonHash` を返します |
| [`apply_segments`](/s1000d-stack/ja/reference/stack/writer/apply-segments/) | 訳した文を元のデータモジュールに戻します。DMC は同じで、言語だけが変わります。取り出したあとにデータモジュールが変わっていれば、`skeleton-mismatch` で止まります |

## 下書きと採番の規則

### 下書き（`draft`）

下書きは、データモジュールの種類（`kind`: `descript` / `proced` / `process` / `fault` / `pm`）、言語、題名、機密区分（`securityClassification`）と、本文の節点の木（`body`）からなります。節点の種類（section / para / list / table / figure / admonition / step など）の名前は、[s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) の `read_data_module` が返す節点と同じです。ただし、下書きに書ける構造は、reader が読める構造の一部です。CSDB にあるデータモジュールを読んで下書きに写し、作り直すと、下書きに書けない要素と属性が新しい版から無くなります。既にあるデータモジュールを直すときは、`apply_fixes`（検証で見つかった問題）、`edit_data_module`（節点を足す・取り除く・移す）、`apply_segments`（翻訳）を使ってください。

- `kind` ごとに置ける節点が決まっています。合わない節点は、XML を組み立てる前に `input-error` で返します。これは入力の形の検査で、XSD 検証の代わりではありません。
- 参照は文に埋め込まず、節点の `refs` に書きます。
- 機密区分は省略できません。値は解釈せず、そのまま書きます。

### 採番の規則（`allocation`）

`allocation` には、モデル識別コード・システム差異コード・SNS・種類ごとの情報コード（`rules.infoCodeByKind`）・ICN に使う CAGE コードを渡します。

- **情報コードの既定はありません。** 省略すると `input-error` です。情報コードの意味はプロジェクトが決めるため、利用者に聞いてから渡してください。
- **サーバーは状態を持ちません。** 採番の台帳（`ledger`）は入力で受け取り、応答で返します。前の応答の `ledger` をそのまま渡すと、同じ `sourceId` には同じ DMC、同じ素材には同じ ICN が付きます。台帳を保管するのは呼び出す側です。
- CSDB に同じデータモジュールがあり、下書きに版（`issueInfo`）が無いときは、`issuePolicy` で決めます。既定は発行番号を上げる `increment-issue` で、作業中番号を上げる `increment-inwork`、版を変えない `keep` も選べます。

```mermaid
flowchart TB
  D["下書き（draft）＋ 採番の規則（allocation）"] --> B["1. 採番して XML を組み立てる<br/>DMC・ICN・版・BREX の参照"]
  B --> V["2. 検証<br/>XSD・BREX・参照"]
  V -->|"違反あり"| F["3. 修正の候補を計算"]
  F -->|"exact（候補が 1 つ）"| A["自動で適用<br/>appliedFixes[]"]
  A --> V
  F -->|"several / none"| R["fixes[] に候補を付けて返す"]
  R -->|"利用者が候補から選ぶ"| AF["apply_fixes"]
  AF --> V
  V -->|"違反なし、または残りは利用者の判断"| O["応答: xml ＋ verification ＋ fixes[]<br/>write: true のときだけ CSDB に書く"]
```

## 応答の読み方

すべての応答の末尾には、その応答で何が起きたかを文で書いた `_notes` が付きます。

### 検証状態（`verification`）

XSD・BREX・参照の各工程の状態です。形と意味は [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/) の検証状態と同じです。XSD が見つからなければ `schema-not-found`、省いた工程は `not-run` と明記され、どちらも `valid` ではありません。サーバーは検証の結果を伝えるだけで、S1000D への準拠は判定せず、違反の重大度も解釈しません。

### 自動で適用した修正（`appliedFixes[]`）

自動で適用するのは、`confidence` が `exact` で、候補がちょうど 1 つの修正だけです。たとえば、BREX が責任企業を 1 つに決めているときの置き換えや、BREX が禁じている要素の削除です。適用した修正は、変更前後の値つきで `appliedFixes[]` に返します。自動の修正は、結果を確かめてから使ってください。`maxFixRounds: 0` で自動の修正を止められます。

### 残った修正（`fixes[]`）の適用

`fixes[]` には、自動で直せなかった修正が候補付きで入ります。`confidence` が `several` のときは候補が複数ある（または範囲・正規表現で示された値）ことを、`none` のときは候補が無いことを表します。`none` は、利用者に聞いてください。

候補から選んだ修正は、候補の `location` と 1 件の候補を写して `apply_fixes` の `selections[]` に渡します（`{ location, action, target?, value?, position? }`。候補に `position` があるときは、それも写します）。サーバーは候補を計算し直して照合し、次のいずれかに当たる選択は適用せず、理由を付けて `rejected[]` に返します。

| `reason` | 意味 |
| --- | --- |
| `candidate-not-offered` | その位置と候補を持つ修正が、提案の中に無い |
| `value-not-allowed` | 範囲や正規表現の候補で、渡した値が範囲や形に合わない |
| `provide-is-not-a-document-change` | `provide` の候補は文書ではなく製品の値を与えるものなので、`product` に渡す |

適用した修正は `applied[]` に、変更の内容つきで返します。適用後は再検証し、残った修正を `fixes[]` に返します。

### 入力の誤り（`input-error`）

下書きや採番の規則の誤りは、ツールの失敗（`isError`）ではなく `error: { code: "input-error", path, detail }` で返します。`path` は誤りの位置です（例: `/body[1]`、`/allocation/rules/infoCodeByKind/proced`）。その位置を直して、もう一度呼んでください。このほかに、想定している停止として `skeleton-mismatch`（取り出したあとにデータモジュールが変わった）と `write-conflict`（同じ名前のファイルがある）があります。

### 書き込みの規則

- `write: true` を渡したときだけ、`csdbDirs` の最初のフォルダー（無ければ `S1000D_CSDB_DIR` の最初）に `DMC-….XML` を書きます。書き先が無ければ書かず、理由（`no-csdb-dir`）を `writeSkipped` に返します。
- 同じ名前のファイルがあるときは上書きしません（`write-conflict`）。`overwrite: true` を渡すと上書きします。
- XSD に違反する XML は書きません（`schema-invalid`）。`allowInvalid: true` を渡すと書きます。XSD が見つからない `schema-not-found` は違反ではなく、未検証として書きます。
- `convert_manual` は、`write: true` のとき、図などの原本を ICN のファイル名でコピーします。
- `apply_fixes` に `path` を渡して `write: true` にすると、そのファイルを直接書き換えます。`xml` を渡したときは、データモジュール自身の名前で最初のフォルダーに書きます。
- `edit_data_module` も、`path` を渡して `write: true` にすると、そのファイルを直接書き換えます（版を変えないので、ファイル名は変わりません）。編集で XSD のエラーが増えた結果と、取り除いた `id` をほかのデータモジュールが指している結果は、`allowInvalid: true` を渡しても書きません。
- `start_revision` は、`write: true` のとき、作業中の版を新しいファイル名で書きます。`path` を渡したときは同じフォルダーに、`xml` を渡したときは最初のフォルダーに書きます。発行済みの版のファイルは変えません。同じ名前のファイルがあれば `write-conflict` です。
- `add_reason_for_update` は、`path` を渡して `write: true` にすると、そのファイルを直接書き換えます。
- 書いたパスは、応答の `written[]` に入ります。

## 既にあるデータモジュールの構造を編集する

`edit_data_module` は、CSDB にある手順（`proced`）・説明（`descript`）のデータモジュールに、節点を足す（`insert`）・取り除く（`remove`）・移す（`move`）編集を行います。データモジュールを下書きから作り直さず、元の XML の文字列のうち、編集した範囲だけを書き換えます。属性の並べ方、改行、コメントなど、触っていない部分は 1 文字も変わりません。

```mermaid
flowchart LR
  R["s1000d-reader-mcp<br/>read_data_module<br/>includeLocation: true"] -->|"location.path"| E["edit_data_module<br/>edits[]"]
  E --> C{"断る理由が<br/>あるか"}
  C -->|"ある"| X["何も適用しない<br/>refusals[]"]
  C -->|"ない"| V["編集した範囲だけを書き換え<br/>検証し直す"]
  V -->|"XSD のエラーが増えた"| N["書き込まない<br/>newSchemaErrors[]"]
  V -->|"増えていない"| W["write: true のときだけ<br/>元のファイルに書く"]
```

### 編集の書き方（`edits[]`）

| `op` | 書く項目 |
| --- | --- |
| `insert` | `to`（基準の節点の場所）、`position`、`node`（足す節点。下書きの節点 1 つ） |
| `remove` | `at`（取り除く節点の場所） |
| `move` | `at`（移す節点の場所）、`to`（基準の節点の場所）、`position` |

- 場所は、[s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/) の `read_data_module` を `includeLocation: true` で呼んだ応答にある、各節点の `location.path` を写します（例: `/dmodule/content/procedure/mainProcedure/proceduralStep[2]`）。場所を自分で組み立てないでください。
- 複数の編集を渡すときも、場所はすべて編集の前の文書のものを書きます。前の編集でずれる番号を、呼ぶ側が計算する必要はありません。
- `position` は、基準の節点の前後（`before`・`after`）か、基準の節点の中（`first-child`・`last-child`）です。
- 取り除ける・移せる要素は、`proceduralStep`・`para`・`warning`・`caution`・`note`・`listItem` です。足せる節点は、`step`・`para`・`admonition`・`listItem` です。
- 足す節点に `id` が無ければ、サーバーは `id` を付けません。検証を通すための値も補いません。

### 応答の読み方

| 項目 | 内容 |
| --- | --- |
| `applied` | `false` のときは、1 つも適用されていません。1 つでも断る理由があれば、すべての編集を適用しません |
| `refusals[]` | 断った編集ごとの理由と場所です。たとえば、`released-issue`（発行済みの版）、`location-not-found`（場所が節点を選ばない）、`unsupported-node`（対象でない要素）、`not-allowed-here`（その親がその要素を子に取れない）、`id-referenced`（取り除く節点の `id` を、同じデータモジュールのほかの場所が指している）、`id-duplicate`（足す節点の `id` が既にある）があります |
| `newSchemaErrors[]` | 編集の前には無かった XSD のエラーです。1 つでもあれば、その結果は書き込みません。要素の並びの順は XSD が決めているので（手順の中では、警告・注意が段落より前です）、位置か編集を変えて、元の文書に対して呼び直してください。この結果は `apply_fixes` には渡せません |
| `referencedFromOtherObjects[]` | 取り除いた `id` を、CSDB のほかのデータモジュール・パブリケーションモジュールの `dmRef` が指している場所です。1 つでもあれば書き込みません。指している側を先に直すか、編集をやめるかを決めてください |
| `verification` | 編集の後の検証状態です |
| `fixes[]` | 編集の前からあった問題への修正候補です |
| `changes[]` | 適用した編集です。`marking` を渡したときは、付けた印（`mark`）が入ります。`kept: true` は、取り除かずに `delete` の印を付けて残した節点です |
| `reasonForUpdate` | `marking` を渡したときに、付けた印が指す更新の理由です。`added: true` は、この呼び出しで足したものです |

### `marking` を渡さないとき、版と変更の印は変えません

`marking` を渡さない `edit_data_module` は、版（`issueInfo`）も、変更の印（`changeType`・`changeMark`・`reasonForUpdate`）も変えません。

- 発行済みの版（`issueInfo` の `inWork` が `00`）は、`released-issue` で断ります。S1000D の決まりに沿って直すときは、下の「発行済みのデータモジュールを直す」のとおり、先に作業中の版を始めてください。
- 試作や練習で、版を変えずに書き換えてよい場合だけ、`allowReleasedIssue: true` を渡すと編集できます。`marking` を渡したときは、`allowReleasedIssue: true` があっても、発行済みの版を断ります。

## 発行済みのデータモジュールを直す

S1000D では、発行済みのデータモジュール（`issueInfo` の `inWork` が `00`）を直すときに、作業中の版へ進め、変更した場所に変更の印を付け、識別・状態部に更新の理由（`reasonForUpdate`）を書きます。0.6.0 から、そのための入口が 3 つあります。

```mermaid
flowchart LR
  A["発行済みの版<br/>012-00"] -->|"start_revision"| B["作業中の版<br/>012-01（新しいファイル）"]
  B -->|"edit_data_module<br/>marking.reason"| C["変更の印と<br/>更新の理由が付く"]
  C -->|"edit_data_module<br/>marking.reasonRefId"| C
  B -->|"add_reason_for_update"| D["更新の理由だけが<br/>増える"]
```

### 作業中の版を始める（`start_revision`）

- `issueType`（`changed`・`revised`・`status`）は必須です。サーバーは選びません。変更の種類は書き手が決めるものなので、利用者に聞いてから渡してください。発行番号が `001` の版から始めるときだけ、`new` も渡せます。このときは、既定 BREX の BREX-S1-00030 に違反することを `_notes` で知らせます。
- 結果は、`issueNumber` がそのままで `inWork` が `01` の、新しい文書です。`write: true` のときは、新しいファイル名（応答の `fileName`。`_012-00_` が `_012-01_` になります）で書きます。発行済みの版のファイルは変えません。
- 前の版の変更の印（`changeType`・`changeMark`・`reasonForUpdateRefIds`）と更新の理由を消し、`changeType="delete"` の要素を取り除きます。消した数と、取り除いた要素の場所は、応答の `removed` に入ります。
- `issueType` が `revised`・`status` の版は、更新の理由が 1 つも無い状態で始まります。発行番号が `002` 以降のときは、既定 BREX の BREX-S1-00038 に違反するので、`reason` を渡して、同じ呼び出しで理由を 1 つ足してください。理由を足せないときは、版も始めません。
- 既に作業中の版（`already-in-work`）と、`issueType` が `deleted` の版（`deleted-issue`）は断ります。

### 変更の印を付ける（`edit_data_module` の `marking`）

`marking` を渡すと、編集した場所に変更の印を付けます。印を付けられるのは、作業中の版で、`issueType` が `changed`・`status`・`rinstate-changed`・`rinstate-status` のときだけです。

| 編集 | 付く印 |
| --- | --- |
| `insert` | 足した要素に `changeType="add"` が付きます |
| `remove` | 要素を取り除かずに、`changeType="delete"` を付けて残します（`changes[].kept` が `true`）。この作業中の版で足した要素は、印を付けずに取り除きます |
| `move` | 同じ親の中の移動だけを受け付け、親に `changeType="modify"` が付きます。親が変わる移動は `move-across-parents`、変更の印を持てない親の中の移動は `parent-not-markable` で断ります |

| 項目 | 内容 |
| --- | --- |
| `marking.reason` | その理由による最初の編集で渡します。`text`（理由の文）と `updateReasonType` が必須です。識別・状態部に更新の理由を 1 つ足し、付けた印がそれを指します。`id` を省くと、文書に無い値（`rfu-0001` の形）を作ります |
| `marking.reasonRefId` | 同じ理由による 2 回目からの編集で渡します。識別・状態部に既にある更新の理由の `id` です。更新の理由は増えません |
| `marking.changeMark` | `"1"` か `"0"` で、必須です。変更線などの表示を出すかどうかを表し、プロジェクトが決めます |

- `reason` と `reasonRefId` は、どちらか一方だけを渡します。1 回の呼び出しの編集は、すべて同じ理由を指します。理由が違う編集は、呼び出しを分けてください。
- 編集上の変更（`updateReasonType` が `urt01`）には、変更の印を付けられません（`editorial-reason`）。`marking` を渡さずに編集し、理由は `add_reason_for_update` で足します。
- 節点を別の内容に置き換えるときは、同じ呼び出しで、元の節点の `remove` と、その隣への `insert` を渡します。元の節点は `delete` の印で残り、新しい節点に `add` の印が付きます。
- 応答の `reasonForUpdate`（`added` が `true` なら、この呼び出しで足したもの）と `changes[].mark` に、印が指す理由と付けた印を返します。
- サーバーは、理由の文・`updateReasonType`・`changeMark` を補いません。

### 更新の理由だけを足す（`add_reason_for_update`）

作業中の版の識別・状態部に、更新の理由を 1 つ足します。本文には触らず、変更の印も付けません。編集上の変更（`urt01`）の理由と、`issueType` が `revised`・`status` の版の理由に使います。発行済みの版は `released-issue` で断ります。`path` を渡して `write: true` にすると、そのファイルを直接書き換えます。

### 行わないこと

- 発行（`inWork` を `00` に戻し、発行番号を上げること）は行いません。発行日と品質保証の状態も変えません。
- 文の一部への変更の印（`changeInline`）と、表・図への変更の印は付けません。

## 体験型マニュアルの変換

`convert_manual` は、体験型マニュアルの Topic の種類ごとに、次のデータモジュールを作ります。

| マニュアルの要素 | 出力 |
| --- | --- |
| マニュアル全体 | パブリケーションモジュール 1 件。目次の並びは Topic の順 |
| 説明（`description`） | `descript` |
| 手順（`procedure`） | `proced` |
| 故障探求（`troubleshooting`） | `fault` |
| 画面遷移（`screenFlow`） | `process` 1 件と、画面ごとの `proced` |
| 用語集 | 用語集のデータモジュール（全 Topic を変換するときだけ） |
| 適用範囲（`scopes`） | データモジュールの適用性 |
| 素材（`assets`） | ICN を採番し、図への参照を入れる |

変換で表せなかったもの（ホットスポットの座標、`scopeRefs` の一部など）は、黙って捨てずに `notRepresented` に件数で返します。

## 翻訳用の文の出し入れ

`extract_segments` と `apply_segments` は、翻訳そのものではなく、文の出し入れだけを行います。訳すのは LLM か人で、訳の採点も別の道具で行います。

- 取り出す対象は、人が読む文だけです。属性値・DMC・ICN・適用性の式・`id` は取り出しません。
- 文の中のインライン要素（強調や参照など）は `{1}` `{2}` の記号になります。訳文にも同じ記号を残してください。
- 戻すときは、`extract_segments` が返した `skeletonHash` を渡します。取り出したあとにデータモジュールが変わっていれば、`skeleton-mismatch` で止まります。
- 未知の `id`、重複した `id`、記号が合わない文は適用せず、`unapplied[]` に入れて元の文を残します。
- 戻した結果は検証して返します。

## できないこと

- **LLM が書いた XML は受け取りません。** 組み立てるのは下書きからだけです。`edit_data_module` で足す中身も、XML ではなく下書きの節点で渡します。
- **発行はしません。** `start_revision` は作業中の版を始めるだけです。`inWork` を `00` に戻して発行番号を上げる操作はありません。発行日と品質保証の状態も変えません。
- **表・図・前提条件の品目を足す・取り除く・移すこと、段落の文を書き換えることは、まだできません。** 文の一部への変更の印（`changeInline`）と、表・図への変更の印も付けられません。
- **候補の外の値では直しません。**
- **検証を省きません。** 組み立てた XML は必ず検証して返します。
- **S1000D への準拠は判定せず、違反の重大度も解釈しません。** 違反の中身は [`s1000d-verify-mcp`](/s1000d-stack/ja/mcp/verify-mcp/)、BREX のルールの説明は [`s1000d-brex-mcp`](/s1000d-stack/ja/mcp/brex-mcp/) で読んでください。`commentType` や `commentPriorityCode` なども、列挙のまま書き、意味は付けません。
- **翻訳はしません。** 文を取り出して戻すだけです。
- **図の作成や、制限言語（STE）の判定はしません。** 図は ICN を採番して参照を入れるだけで、STE の辞書は同梱しません。
- **段落の中のインライン要素（強調など）は、下書きでは表せません。**
- ACT・CCT・PCT は作りません。適用性は、下書きの `applic` と、既存の適用性リポジトリを前提にします。適用範囲も決めないので、`build_data_module` の下書きに `applic` が無いときは、組み立てずに `input-error`（`path` は `/applic`）を返します。

## 設定

| 環境変数 | 内容 |
| --- | --- |
| `S1000D_SPEC_DIR` | S1000D の配布物を展開したフォルダー。XSD と既定 BREX をこの下から探します |
| `S1000D_CSDB_DIR` | プロジェクトのデータモジュールが置かれたフォルダー。`:`（Windows は `;`）区切りで複数指定できます。BREX の連鎖・参照先・既存の版をここから探し、最初のフォルダーが書き込み先になります |

```json
{
  "mcpServers": {
    "s1000d-writer": {
      "command": "npx",
      "args": ["-y", "@shuji-bonji/s1000d-writer-mcp"],
      "env": {
        "S1000D_SPEC_DIR": "/path/to/s1000d/issue-7",
        "S1000D_CSDB_DIR": "/path/to/project/csdb"
      }
    }
  }
}
```

ツールの引数 `csdbDirs` でフォルダーを指定することもできます（先頭が書き込み先）。渡したときは、そのフォルダーだけを使い、`S1000D_CSDB_DIR` と設定ファイルの `csdbDirs` は使いません（足し合わせません）。存在しないフォルダーは使わず、応答の `_notes` に書きます（先頭のフォルダーはまだ無くてもよく、`write: true` のときに作ります）。環境変数が無いときは、設定ファイル `~/.config/s1000d-stack/config.json`（`XDG_CONFIG_HOME` があればその下、`S1000D_CONFIG` で場所を変更可）の `specDir` と `csdbDirs` を読みます。書き方は[導入手順](/s1000d-stack/ja/guide/getting-started/)にあります。

既定は stdio です。`--http` を付けると Streamable HTTP（既定 `http://127.0.0.1:3000/mcp`。`--host` / `--port` / `--path` で変更）で起動し、CSDB 製品のサーバーや Web アプリから HTTP で呼べます。loopback に束縛したときは `Host` と `Origin` を localhost 系に限り、それ以外のアドレスでは検査しません。このサーバーはファイルを書き込めるので、認証の無い公開は避け、製品側のリバースプロキシや認証の後ろに置いてください。認証・権限・マルチテナントはサーバーでは持ちません（[CSDB 製品に組み込む](/s1000d-stack/ja/use-cases/embedding/)の「製品側に残す責務」）。

## 関連ページ

- 作った結果を読むには [s1000d-reader-mcp](/s1000d-stack/ja/mcp/reader-mcp/)、違反の詳細と修正の提案を見るには [s1000d-verify-mcp](/s1000d-stack/ja/mcp/verify-mcp/) を使います。
- XML の組み立て・採番・修正の適用・文の出し入れの処理は、共有ライブラリの[書く側の機能](/s1000d-stack/ja/lib/s1000d-core/#書く側の機能)にあります。
- 使う場面は[ユースケース](/s1000d-stack/ja/use-cases/)の使い方 3、全体の位置づけは[全体構成](/s1000d-stack/ja/guide/architecture/)にあります。
