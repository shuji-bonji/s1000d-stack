# 実在の TM を使った確認の引き継ぎ（2 回目、2026-11-15 14:10 JST）

次のチャットで続きを始めるための文書です。1 回目の引き継ぎは [tm-eval-handoff.md](./tm-eval-handoff.md)、要望の一覧は [tm-eval-requests.md](./tm-eval-requests.md)、ここまでの作業の記録は [tm-eval-progress.md](./tm-eval-progress.md) にあります。

> [!WARNING]
> 題材から作ったもの（`manual.json`、切り出した図、変換した XML）は社内の確認用です。配布しません。リポジトリにも入れません。公開してよいのは、自分たちの観察だけです。

## 最初に読むもの

1. この文書
2. [tm-eval-progress.md](./tm-eval-progress.md) の「RD-3」と「残り」の節
3. 評価フォルダーの `NOTES.md` の「第 3 回」の節（`/Users/bonji/s1000d-stack-eval/tm-9-6115-749-10/NOTES.md`）

## いまの状態（2026-11-15 14:05 JST に確かめた）

| リポジトリ | 版 | `origin/main` との差 | 補足 |
|---|---|---|---|
| s1000d-core | 0.9.1（npm に公開済み） | 一致 | 段落の中のリストと、`dmNode` が指す DM を読む修正が入っている |
| experiential-manual-model | 0.3.0（公開済み） | 一致 | |
| s1000d-writer-mcp | 0.2.0 | 2 コミット先（`601e53e` W-10、`5a97182` lock） | CHANGELOG は「未リリース」の節 |
| s1000d-reader-mcp | 0.8.0 | 2 コミット先（`2154c17`、`ad55420` lock） | 同上。`content.notReadElements` を返す |
| s1000d-verify-mcp | 0.7.0 | 2 コミット先（`4c4c14a`、`2471a66` lock） | 同上 |
| s1000d-brex-mcp | 0.6.0 | 2 コミット先（`656cf5f`、`bb71254` lock） | 同上 |
| s1000d-stack（hub） | — | 文書のコミットの分だけ先 | |

MCP 4 本は、`package.json` が `@shuji-bonji/s1000d-core` を `^0.9.0` で指定し、`package-lock.json` と `node_modules` は 0.9.1 です。Mac で `S1000D_SPEC_TESTS=1 npm test` が 4 本とも通り（reader 32 件、verify 40 件、brex 26 件、writer 51 件）、`npm run build` も済んでいます（2026-11-15 14:02 JST）。

## 最初にやること

1. Claude Desktop を起動し直したかを利用者に確かめる。起動し直すと、core 0.9.1 の読み取りの修正が `-dev` 版に反映される
2. 反映を確かめる。`s1000d-reader-dev` の `read_data_module` で用語の DM（`AMMPS5KW-A-10-20-00-05A-040A-D`、`csdbDirs` は評価フォルダーの `csdb-0.3`）を読み、`kind: "list"` の節点が返れば反映されている。0.9.0 のままだと、文の無い段落 1 つだけが返る

## 残っている作業

| 順 | 作業 | 待つもの・注意 |
|---|---|---|
| 1 | （済み、writer-mcp `85428f1`、2026-11-15 14:20 JST）R11: writer が `dmRef` の `dmTitle` に `infoName` を書く。いまは `techName`（マニュアルの題名）だけなので、「次に進む: 」の参照や PM の項目に、行き先の作業の名前が出ない | 無し。作業前の要件の `reqTechInfo` の参照には `infoName` が入っているので、書き方の違いを core の `dmRefEl` と writer-mcp の両方で確かめる |
| 2 | （済み、2026-11-15 23:15 JST。識別子を `natoStockNumber` で書く。model 0.4.0 `4137a87`・core 0.10.0 `682dde2`・writer-mcp `e642dd8`。経緯は [tm-eval-progress.md](./tm-eval-progress.md) の「材料 4 品目の書き方」）見本の材料 4 品目の書き方を決める | 元の文書は材料を「消耗品の一覧の品目番号」で示していて、部品番号と数量が無い。W-10 の後は、この 3 つの手順 DM は作られない。`reqQuantity` は文でも書ける。識別子は `supplyRqmtRef`（`supplyRqmtNumber` が必須）が近い形だが、使い方を仕様書で確かめていない。core が書ける識別子は `identNumber` だけ（core の設計の 5） |
| 3 | Bike Samples で、読み取りの結果に無いテキスト節点 66 個を減らす | `displayText`（15）、`partNumber`（7）、`faultDescr`（6）など。`src/content/coverage.spec.test.ts` の上限を、減った数に下げる |
| 4 | W-4 → W-5 → RD-2（hotspot） | core に足す形は、XSD の `hotspot` と配布物の実測から決める（D-31） |
| 5 | 仕様書のプロセス DM の章を読んでから W-6 | |
| 6 | M-4〜M-7 と W-9、その後に優先 3 | |

## 決まっていること

| 項目 | 決定 |
|---|---|
| D-31 | s1000d-core は S1000D の構造（XSD と配布物の実測）を出発点にする。読む側は落とさない。新しく作る側は明記した部分集合で、値を補わない。既にある DM は元の XML を保ったまま直す |
| W-10（2026-11-15） | 識別子か数量の無い品目がある Topic の DM は作らない。`convert_manual` は `dataModules[]` のその行に `input-error` と品目の場所を返し、ほかの DM は作る |
| 依存（2026-11-15） | MCP 4 本とも core `^0.9.0` 以上にする |

## 評価フォルダーの中身

`/Users/bonji/s1000d-stack-eval/tm-9-6115-749-10/`

| 場所 | 内容 |
|---|---|
| `src/build.mts` | 見本を組み立てるスクリプト（model 0.4.0 の形。2026-11-15 23:05 JST に、冷却系統の材料 4 品目へ `natoStockNumber` などを足した）。`MODEL_DIST=<model の dist/index.js> node src/build.mts` で `manual/manual.json` を出力する |
| `manual/manual.json` | model 0.4.0 の形の見本（0.3.0 の形に、品目の `natoStockNumber` を足したもの）。`manual.0.2.0.json` は前の形の控え |
| `manual/manual.ledger.json` | 採番の台帳（`icnNext` は 21） |
| `csdb-0.3/` | 第 3 回の変換の結果（DM 23 件、PM 1 件、ICN 20 件）。W-10 の前に書いたので、冷却系統の 3 件は `reqSupplies` が `noSupplies` のまま |
| `csdb-r11/` | R11 の確認の結果（DM 20 件、PM 1 件。冷却系統の 3 件は W-10 のとおり作っていない） |
| `csdb-nsn/` | 材料 4 品目を NSN で書いた後の変換の結果（2026-11-15 23:08 JST。DM 23 件、PM 1 件、ICN 20 件）。応答は `csdb-nsn.convert.json`、`verify_csdb` の報告は `csdb-nsn.verify.json` |
| `csdb/` | 第 2 回の変換の結果（model 0.2.0 の形） |
| `NOTES.md` | 記録。R1〜R14 と、材料 4 品目を NSN で書いた結果 |

## 作業の仕方で分かっていること

- Mac 側の Linux VM（`device_bash`）は、`node_modules` が macOS 用なので vitest が動きません。空きも 75 MB ほどです。テストは GitHub から clone したクラウド側で実行し、変えたファイルを Mac に書いてから VM で `git commit` しています。`tsc` と、ビルドした JS を node で動かすことは VM でもできます。
- クラウド側から Mac にファイルを書くとき、直前に書き換えたファイルは、古い内容で書かれることがあります。書いた後に、VM 側で `sha256sum` を比べて確かめてください。
- VM での削除の許可は、時間がたつと切れます。`git commit` が `.git/HEAD.lock` と `tmp_obj_*` を残すので、コミットの後に削除の許可を確かめ、残っていれば消してください。
- `convert_manual` と `read_publication_module` の応答は大きいので、まとめて読むときは、VM で core を直接呼ぶスクリプトのほうが扱いやすいです。
- 文書は、Project と hub（`s1000d-stack/docs/`）の両方に置きます。
