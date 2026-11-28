# Issue #14 の実測から分けて起こす Issue の下書き（2026-11-28）

Issue 4.2・4.1・4.0 の配布物でいまの MCP を動かした結果（[issue-4.2-survey.md](./issue-4.2-survey.md)、[issue-4.0-4.1-survey.md](./issue-4.0-4.1-survey.md)）から、別の Issue に分ける課題の下書きです。GitHub の Issue を起こす人が、題と本文をそのまま貼れるように書いています。起こしたら、この文書の該当する節に Issue の番号を書き足します。

> [!NOTE]
> 状態の列は 2026-11-29 のものです。2026-11-28 に、6 件とも GitHub の Issue にしました。F-5 は、利用者が「Issue 4.1 と Issue 4.0 系をどちらも対象にする」と決めたので（D-42）、版ごとの 2 件に分けています。下の節は、起こしたときの下書きです。その後の経過は、それぞれの Issue に書きます。

| 番号 | 題 | 版によるか | Issue | 状態（2026-11-29） |
|---|---|---|---|---|
| F-1 | Issue 4.2 に無い要素を、writer が組み立てる前に知らせる | Issue 4.2 | [#26](https://github.com/shuji-bonji/s1000d-stack/issues/26) | 済み。置けないものは入力の誤りにすると決めた（D-43）。いまの組み立てる側が書く要素と属性は、すべて Issue 4.2 にあり、断るものは無い。`authorityName`・`authorityDocument` は、節点の `authority` で書けるようにした（s1000d-core 0.20.0） |
| F-2 | 先頭に BOM がある XML を読めるようにする | よらない | [#23](https://github.com/shuji-bonji/s1000d-stack/issues/23) | core 0.19.0 で直した（公開はまだ） |
| F-3 | `content/refs` の `dmRef` の題名を、本文の読み取りの結果に入れる | よらない | [#24](https://github.com/shuji-bonji/s1000d-stack/issues/24) | core 0.19.0 と reader-mcp 0.17.0 で直した（公開はまだ） |
| F-4 | 配布物の中に同じ版の `xml_schema_flat/` が複数あるときの選び方を決める | よらない | [#25](https://github.com/shuji-bonji/s1000d-stack/issues/25) | core 0.19.0 で、写しを 1 つにまとめた。同じ版で中身の違う XSD は、利用者が設定で選ぶ（`S1000D_SCHEMA_DIR`・`schemaDirs`。2026-11-29 に決定し、core と verify・reader・writer の MCP に実装した） |
| F-5 | Issue 4.1 への対応 | Issue 4.1 | [#27](https://github.com/shuji-bonji/s1000d-stack/issues/27) | 読む・検証する側は済み（core のテストに数を固定した）。作る側は、プロセス DM の節の題名を入力の誤りにする（D-43） |
| F-5 | Issue 4.0 系への対応 | Issue 4.0 | [#28](https://github.com/shuji-bonji/s1000d-stack/issues/28) | 読む・検証する側は済み（BREX は元から決まりどおり。DML の `dmEntry` を読めるようにした）。作る側は、PM とコメントを `brexDmRef` 無しで組み立てる（s1000d-core 0.20.0。D-43 の「その後」） |

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
- [x] Issue 7 では `controlAuthority` に置き換わった `authorityName`・`authorityDocument` を、Issue 4.0〜4.2 向けの下書きで書けるようにする（2026-11-29。s1000d-core 0.20.0）

### 管理された内容の印（`authority`）

下書きの節点に `authority: { name, document? }` を書くと、その節点の要素に `authorityName`・`authorityDocument` が付きます。

| 対象の版 | 結果 |
|---|---|
| Issue 4.0・4.1・4.2 で、その版の XSD が `authorityName` を持たせている要素になる節点（節、手順、故障探求の手順、表、図、定義リストの項目、参照など） | 属性を書く |
| Issue 4.0 の `pmEntry` | `input-error`（`…/authority`）。`pmEntry` に付けられるのは Issue 4.1 から |
| 上の版で、`authorityName` を持てない要素になる節点（`para` など） | `input-error`（`…/authority`） |
| Issue 4.2 より後（`issue` を省いたときの Issue 7 を含む） | `input-error`（`…/authority`） |

- 要素の名前と、付けられるようになった版の対応は、core の `src/write/content/authority-elements.ts` にあります。Issue 4.0・4.1・4.2 の XSD（`descript`・`proced`・`process`・`fault`・`pm`）から取り出した 79 個です（Issue 4.0 から 56、4.1 から 22、4.2 から 1）。同じ名前の要素が、XSD によって属性を持ったり持たなかったりする所はありませんでした。
- reader は、`authorityName`・`authorityDocument` が書かれている要素の節点に、`authority: { name?, document? }` を返します。自作の DM で確かめました（4 つの版の Bike のサンプルには、この属性を書いた DM が 1 件もありません）。
- core の配布物付きのテストで、`authority` を付けた下書き（説明の節、手順、故障探求の手順）を Issue 4.0・4.1・4.2 向けに組み立て、それぞれの版の XSD で `valid` になることを確かめています。
- Issue 7 の `controlAuthority` は、書くことも読むこともまだしていません。

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
- Issue 4.0 は、BREX のルールに識別子（`brDecisionRef`）がありません。作る側は、PM・コメント・DML・プロセス・ACT が通りません。**訂正（2026-11-29）**: 最初は「`allowedObjectFlag` の型が違うので、いまの照合の結果は使えない」と書いていましたが、誤りでした。仕様書で確かめると、`0`・`1` の意味は Issue 7 と同じで、core は元から決まりどおりに照合しています（[issue-4.0-4.1-survey.md](./issue-4.0-4.1-survey.md) の「BREX の違い」）。
- 日本での実例として記録にあるのは、MRJ の供給企業に求められた Issue 4.0.1 です。

**決めること**:

- [ ] Issue 4.1 を対象に入れるか（F-2・F-3 の後に、テストに Issue 4.1 の数を足す）
- [ ] Issue 4.0 系を対象に入れるか。入れるなら、先に仕様書の Chap 4.10.2 で `allowedObjectFlag` の意味を確かめ、読む・検証するだけにするか、作る側まで対応するかを決める
