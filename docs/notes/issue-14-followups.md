# Issue #14 の実測から分けて起こす Issue の下書き（2026-11-28）

Issue 4.2・4.1・4.0 の配布物でいまの MCP を動かした結果（[issue-4.2-survey.md](./issue-4.2-survey.md)、[issue-4.0-4.1-survey.md](./issue-4.0-4.1-survey.md)）から、別の Issue に分ける課題の下書きです。GitHub の Issue を起こす人が、題と本文をそのまま貼れるように書いています。起こしたら、この文書の該当する節に Issue の番号を書き足します。

| 番号 | 題 | 版によるか | リポジトリ |
|---|---|---|---|
| F-1 | Issue 4.2 に無い要素を、writer が組み立てる前に知らせる | Issue 4.2 | s1000d-stack（実装は core・writer-mcp） |
| F-2 | 先頭に BOM がある XML を読めるようにする | よらない | s1000d-core |
| F-3 | `content/refs` の `dmRef` の題名を、本文の読み取りの結果に入れる | よらない | s1000d-core |
| F-4 | 配布物の中に同じ版の `xml_schema_flat/` が複数あるときの選び方を決める | よらない | s1000d-core・verify-mcp |
| F-5 | Issue 4.0・4.1 にどこまで対応するかを決める（U-14） | Issue 4.0・4.1 | s1000d-stack |

## F-1 Issue 4.2 に無い要素を、writer が組み立てる前に知らせる

**いまの動き**: s1000d-core 0.19.0 の `buildDataModule` は、`options.issue` に `"4.2"` を渡すと、`xsi:noNamespaceSchemaLocation` の版だけを替えます。書く要素と属性は Issue 7 のものと同じです。Issue 4.2 に無い要素が出力に入ると、Issue 4.2 の XSD の検証で `invalid` になり、利用者は XSD の違反の文から原因を読むことになります。

**Issue 4.2 に無いもの**（Issue 7 の XSD にだけある名前。`scripts/experiments/xsd-name-diff.mjs` の結果）:

- `descript`: 要素 `controlAuthority`・`controlAuthorityGroup`・`controlAuthorityText`・`infoNameVariant`・`supplyRef`・`terminologyRef`
- `proced`・`process`・`fault`: 上の `supplyRef` を除く 5 つと、`hazard`・`hazardRef`・`hazardousClass`・`hazards`・`safetyInformation`
- 属性: `controlAuthorityRefs`・`extEntityIdent`・`referenceUsage`・`supplyNumber`・`supplyNumberType`・`hazardIdentNumber`・`supplementalSafetyCategory`・`supplyCategory` など

**決めること**:

- [ ] 下書き（`DraftDataModule`）のどの節点・どの項目が、上の要素と属性を出すかを洗い出す（候補: 題名の `infoNameVariant`、前提条件の品目の危険性の `hazards`）
- [ ] 版に無い要素を出す下書きを、組み立てる前に入力の誤り（`input-error` と位置）として返すか、その要素を出さずに `_notes` で知らせるか。読む側の「内容を落とさない」（D-31）と同じ考えなら、黙って落とさず、誤りとして返す
- [ ] 版ごとの「使えない要素」の表を、core が XSD から作るか（`fix/xsd-index.ts` は XSD の内容モデルを読める）、手で持つか
- [ ] Issue 7 では `controlAuthority` に置き換わった `authorityName`・`authorityDocument` を、Issue 4.2 向けの下書きで書けるようにするか

**確かめること**: Issue 4.2 の Bike Sample Data Set には、`authorityName`・`authorityDocument` を書いた DM がありません。reader がこの 2 つの属性を応答に入れるかを、自作の DM で確かめます。

## F-2 先頭に BOM がある XML を読めるようにする

**起きていること**: UTF-8 の BOM（U+FEFF）で始まる XML を、core の `defaultXmlEngine.parse` が整形式でないとして断ります（`Unexpected content outside root element`）。`verify_data_module` は `wellFormed: false` を返し、`read_data_module`・`check_against_brex`・`reconcile_dml` は誤りを返します。

**実測**: Issue 4.0 の Bike data set は、XML 195 件のうち 126 件が BOM で始まります。Issue 4.1 は 103 件のうち 1 件です。Issue 4.2 と Issue 7 には 1 件もありません。

**直すときに確かめること**:

- [ ] 読み取りの入口で BOM を取り除く。XSD の検証器（`libxml2-wasm`）に渡す文字列も同じにする
- [ ] 元の文字列の一部だけを書き換える処理（`editContent`・`startRevision`・`addReasonForUpdate`・`applyFixes`・`applySegments`）で、書き換える位置が 1 文字ずれないこと
- [ ] 書き戻すときに、元の BOM を残すか取り除くかを決める（元の XML を保つ方針なら、残す）
- [ ] `segments/skeleton.ts` のハッシュが、BOM の有無で変わるかを確かめる

## F-3 `content/refs` の `dmRef` の題名を、本文の読み取りの結果に入れる

**起きていること**: 本文の先頭の参照の一覧（`content/refs`）にある `dmRef` が題名（`dmRefAddressItems/dmTitle`）を持つとき、`techName`・`infoName` の文字が `read_data_module` の `content.blocks` に入りません。`notReadElements` にも出ないので、reader が黙って落としています（D-31 に反する）。参照の DMC は、応答の `references` に入っています。

**実測**: 落としたテキスト節点は、Issue 4.0 で 94 個、Issue 4.1 で 69 個です。Issue 4.2 と Issue 7 のサンプルは、`content/refs` の `dmRef` に題名を付けていないので、0 個でした（core の `coverage.spec.test.ts` の基準値も 0）。

**決めること**:

- [ ] `content/refs` を節点として `blocks` に入れるか、応答の `references` の各行に題名を足すか
- [ ] 自作の DM（`content/refs` の `dmRef` に題名を付けたもの）をテストに足す

## F-4 配布物の中に同じ版の `xml_schema_flat/` が複数あるときの選び方を決める

**起きていること**: `findSchemaDirs` は、`S1000D_SPEC_DIR` の下の `xml_schema_flat/`（`brex.xsd` を含むフォルダー）をすべて集めます。同じ版が複数あると、`locateXsd` は最初に見つかったものを使います。

**実測**:

| 版 | 見つかったフォルダー（見つかった順） |
|---|---|
| Issue 4.0 | データ辞書の中の写し（`4.0`）、Patch 4.0.1（`4.0.1`）、Patch 4.0.2（`4.0` と読まれる）、XML Schema Package（`4.0`） |
| Issue 4.1 | データ辞書の中の写し、Patch 4.1.A、直下の `xml_schema_flat`、XML Schema Package の `Schemas`（4 つとも `4.1`） |
| Issue 4.2、Issue 7 | 1 つ（データ辞書の中の写しは、フォルダー名 `data_dictionary_*` で除かれる） |

- データ辞書の写しを除く条件が、フォルダー名（`data_dictionary` で始まる）に頼っています。Issue 4.0・4.1 のデータ辞書は、この名前ではありません。
- Patch 4.0.2 の `brex.xsd` は、URL に `S1000D_4-0-2` と書いてありますが、版は `4.0` と読まれます（`readIssueFromXsd` は `Issue number:` の行を先に見る）。
- 版の書かれていない文書（`scormcontentpackage`）は、フォルダーが複数あると `issue-mismatch` になります。

**決めること**:

- [ ] データ辞書の写しを、フォルダー名ではなく中身で見分けるか（`xml.xsd` を絶対 URL で import しているか）
- [ ] 同じ版が複数あるときに、パッチの XSD を優先するか、利用者に選ばせるか（設定ファイルに XSD のフォルダーを書けるようにするか）
- [ ] 元の XSD とパッチの XSD の違いを比べる

## F-5 Issue 4.0・4.1 にどこまで対応するかを決める（U-14）

材料は [issue-4.0-4.1-survey.md](./issue-4.0-4.1-survey.md) の「U-14 を決めるための材料」にあります。

- Issue 4.1 は、F-2 と F-3 を直せば、読む側と検証する側が Issue 4.2 と同じ水準になります。作る側は、プロセス DM の `dmNode` の題名だけが通りません。
- Issue 4.0 は、BREX の `allowedObjectFlag` の型が違い（2 値）、ルールの識別子（`brDecisionRef`）がありません。いまの照合の結果は使えません。作る側は、PM・コメント・DML・プロセス・ACT が通りません。
- 日本での実例として記録にあるのは、MRJ の供給企業に求められた Issue 4.0.1 です。

**決めること**:

- [ ] Issue 4.1 を対象に入れるか（F-2・F-3 の後に、テストに Issue 4.1 の数を足す）
- [ ] Issue 4.0 系を対象に入れるか。入れるなら、先に仕様書の Chap 4.10.2 で `allowedObjectFlag` の意味を確かめ、読む・検証するだけにするか、作る側まで対応するかを決める
