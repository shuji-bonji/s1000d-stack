# 既にある DM の構造を変える編集（案）

s1000d-core に、CSDB にあるデータモジュール（DM）の手順を足す・段落を削る・順を入れ替える操作を足すための設計です。

- 状態: **案**（2026-11-17 03:50 JST）。下の「決めること」の 5 つが決まるまで、実装は始めません
- 前提の決定: D-19（決定論的に確かめられることは core が行う）、D-27（書く処理も core に置く）、D-31（既にある DM は元の XML を保ったまま直す。読んだ木を下書きに写して作り直さない）
- 関連: [core-preliminary-rqmts.md](./core-preliminary-rqmts.md) の「3 つの経路」、[writer-mcp.md](./writer-mcp.md) の `apply_fixes`

## 目的

D-31 で、既にある DM の編集は「元の XML への操作」として行うと決めました。いま core にある操作は次の 2 つで、どちらも要素を足したり削ったりする編集には使えません。

| 操作 | できること | できないこと |
|---|---|---|
| `applyFix` | 検証で見つかった問題に、core が決めた候補を適用する | 利用者が決めた内容の追加・削除 |
| `applySegments` | 文を訳文に差し替える | 要素の追加・削除・移動 |

この文書は、3 つ目の操作（仮称 `editContent`）の形を決めます。

## 範囲

| 区分 | 内容 |
|---|---|
| 扱う | 既にある DM の本文に、節点を足す（insert）、節点を削る（remove）、節点を移す（move） |
| 扱わない | 文だけを直す編集（`applySegments` を同じ言語で使う経路。版と変更の印の扱いを確かめていないので、別に決める） |
| 扱わない | 検証の問題の修正（`applyFix`）、新しい DM の作成（`buildDataModule`） |
| 扱わない | 識別・状態部（`identAndStatusSection`）の編集。版の更新は「決めること 3」 |

## いまの core の実測（2026-11-17）

### 1. `applyFix` と `applySegments` が保っているもの

どちらも、`@xmldom/xmldom` で読み、DOM を変え、文書要素の全体を `XMLSerializer` で文字列に戻します。文書要素より前（XML 宣言、DOCTYPE の内部サブセット）は、元の文字列をそのまま付け直します（`src/xml/serialize.ts` の `serializeKeepingProlog`）。

Bike Samples の DMC 106 件と PMC 4 件を、何も変えずに読んで `serializeKeepingProlog` で戻し、元の文字列と比べました。

| 測ったもの | 値 |
|---|---|
| 元と同じ文字列に戻ったファイル | 110 件のうち 0 件 |
| `diff` で元の側から消える行 | 91,215 行のうち 26,258 行（29 %） |

確かめた原因は、開始タグの属性の並べ方です。Bike Samples は属性を 1 行に 1 つずつ書いていて、xmldom は属性の間の改行を空白 1 つにします。ほかの原因（空要素のタグの書き方、文字参照など）の内訳は数えていません。

> [!IMPORTANT]
> いまの 2 つの操作は、要素・属性・文は保ちますが、文字列は保ちません。Bike Samples の書き方の DM では、属性を 1 つ直すだけで、ファイルの行の約 3 割が変わります。Git の差分やレビューで、直した場所が見つけにくくなります。

### 2. 設計に使える既存の部品

| 部品 | 場所 | 使い道 |
|---|---|---|
| `ContentNode.location`（`path`・`line`・`column`） | `src/content/types.ts` | 編集する場所を指す。`readContent` の応答の `location.path` をそのまま渡せる |
| `Writer` の `para`・`proceduralStep`・`admonition`・`listEl`・`table`・`figure` | `src/write/content/common.ts` | 足す節点（`DraftNode`）から要素を組み立てる |
| `XsdIndex.allowedChildren` | `src/fix/xsd-index.ts` | その親に、その要素を、その位置に置けるかを確かめる |

### 3. 変更の印（XSD で確かめたこと）

Issue 7 の `proced.xsd` に、次の定義があります。core には、これらを読む・書くコードがありません（`src/content/read.ts`・`src/write/build.ts`・`src/write/content/common.ts` を `changeMark`・`changeType`・`reasonForUpdate` で検索して 0 件）。

| 定義 | 内容 |
|---|---|
| `changeAttGroup` | 属性 `changeType`（`add`・`delete`・`modify`）、`changeMark`、`reasonForUpdateRefIds`（IDREFS） |
| `reasonForUpdate` | `id`・`updateReasonType`・`updateHighlight` の属性と、`simplePara` を持つ要素 |

どの要素にどう付けるかの決まり（仕様書の章）は、まだ読んでいません。

## 案

### 操作

```mermaid
flowchart LR
  R["readContent<br>location.path を得る"] --> E["editContent<br>insert / remove / move"]
  D["DraftNode<br>足す節点 1 つ"] --> E
  E --> C{"断る理由が<br>あるか"}
  C -->|ある| X["1 つも適用しない<br>理由と場所を返す"]
  C -->|ない| S["元の文字列の<br>その範囲だけを書き換える"]
  S --> V["読み直して DOM と比べる"]
  V --> O["新しい XML"]
```

| 操作 | 入力 | 動き |
|---|---|---|
| `insert` | 基準の節点の `path`、位置（`before`・`after`・`first-child`・`last-child`）、足す節点（`DraftNode` 1 つ） | `Writer` で要素を組み立て、その位置に入れる |
| `remove` | 削る節点の `path` | その要素を、子孫ごと取り除く |
| `move` | 移す節点の `path`、行き先の `path` と位置 | 要素を、中身を変えずに行き先へ移す |

節点 1 つを別の内容に置き換える操作（replace）は、最初の版に入れません。置き換えは、reader が読んでいない属性や下書きに書けない構造を落とすので、D-31 でやめた「作り直す」と同じ結果になるためです。

### 決まり

| 項目 | 決まり |
|---|---|
| 場所の指し方 | `edits[]` の `path` は、すべて編集の前の文書の `location.path` で書く。core は最初に全部の場所を見つけてから適用する（前の編集で番号がずれることを、呼ぶ側が計算しなくてよい） |
| 全部か無しか | 1 つでも断る理由があれば、1 つも適用しない。断った編集ごとに、理由と場所を返す |
| 足す節点 | `DraftNode` で渡す。XML の文字列は受け取らない（LLM が XML を書かない、という Skill の原則と同じ）。書ける構造は `buildDataModule` と同じ部分集合 |
| 値を補わない | 足す節点に `id` が無ければ、`id` を付けない。検証を通すための要素も足さない |
| XSD の確認 | 親がその要素をその位置に受け取れるかを `XsdIndex` で確かめる。XSD が無ければ確かめずに適用し、`notes` に書く |
| 適用の後の検証 | core の `editContent` は検証しない。writer-mcp のツールが、`apply_fixes` と同じように検証し直して `verification` を返す |

### 断る理由

| 理由 | 起きるとき |
|---|---|
| `location-not-found`・`location-ambiguous` | `path` が 0 個か 2 個以上の節点を選ぶ |
| `not-allowed-here` | XSD で、その親がその要素をその位置に受け取れない |
| `parent-would-be-invalid` | 削ると、親が XSD の求める子を失う（例: 手順が 1 つしか無い `mainProcedure` から、その手順を削る） |
| `id-referenced` | 削る節点（子孫を含む）の `id` を、残る部分の `internalRef` などが指している。指している場所の `path` を返す |
| `id-duplicate` | 足す節点の `id` が、文書に既にある |
| `unsupported-node` | 最初の版の対象でない種類の節点 |
| `move-into-self` | 移す節点の中に、行き先がある |

別の DM からの参照（`dmRef/@referredFragment` が、削る節点の `id` を指している場合）は、core の `editContent` では確かめません。DM 1 件の文字列だけを受け取る関数だからです。writer-mcp のツールが CSDB を調べて、応答で知らせます。

### 対象の節点（最初の版）

| 対象 | S1000D の要素 | 理由 |
|---|---|---|
| 手順 | `proceduralStep` | 依頼の例（手順を足す、入れ替える）の中心 |
| 段落 | `para`、`levelledPara` の中の段落 | 依頼の例（段落を削る） |
| 警告・注意・注記 | `warning`・`caution`・`note` | 手順の前に足す依頼が多いと見込む |
| リストの項目 | `listItem` | 段落と同じ頻度で直す |

表の行、図、`preliminaryRqmts` の品目、プロセス DM と故障探求 DM の節点は、次の版にします。

### 文字列の保ち方

「いまの core の実測」の 1 のとおり、DOM を直列化し直す方法では、触っていない行も変わります。構造を変える編集では、次の方法を提案します。

1. xmldom が返す要素の開始位置（行と列）から、元の文字列の中の位置を求める
2. 開始タグから対応する終了タグまでを小さな走査器でたどり、要素の範囲（開始と終了の位置）を求める。コメント、CDATA、処理命令は読み飛ばす
3. 編集は、元の文字列の範囲に対して行う

| 操作 | 文字列への操作 |
|---|---|
| `insert` | 組み立てた要素を直列化し、基準の要素の前後に入れる。字下げは、基準の要素の行頭の空白を写す |
| `remove` | 要素の範囲と、その前の空白（行頭から要素まで）を削る |
| `move` | 要素の範囲の文字列を切り取り、行き先に入れる。**移した要素の中身は 1 文字も変わらない** |

安全のために、文字列を書き換えた結果を読み直し、DOM で同じ操作をした結果と節点ごとに比べます。違っていたら適用せず、`internal-mismatch` で断ります。

### テスト

| 種類 | 内容 |
|---|---|
| 自作の DM | 属性を複数行に書いた DM で insert・remove・move を行い、編集した範囲の外が元の文字列と一致することを確かめる |
| 配布物（Bike Samples） | 対象の要素すべてで、走査器が求めた範囲の文字列を読むと、xmldom の同じ節点と同じ要素になることを確かめる |
| 配布物（Bike Samples） | 手順 DM の全件で、最後の手順を先頭に移し、元の位置に戻すと、元の文字列に戻ることを確かめる |

### 公開の形と順序

| 順 | 作るもの | 内容 |
|---|---|---|
| 1 | core: 要素の範囲を求める走査器 | 配布物のテストで、範囲の対応を固定する |
| 2 | core: `editContent` の `remove` と `move` | 足す節点の組み立てが要らないので先に作る |
| 3 | core: `insert` | `Writer` を、文書の一部を組み立てる用途で使えるようにする |
| 4 | writer-mcp: ツール（仮称 `edit_data_module`） | `write: false` が既定。変わった範囲、検証の結果、別の DM からの参照を返す |
| 5 | Skill | `s1000d-publish` の「CSDB にある DM を直したいと頼まれたとき」に行を足すか、別の Skill にする |

## 決めること

| # | 項目 | 選択肢 | 提案 |
|---|---|---|---|
| 1 | 文字列の保ち方 | A: いまと同じ（文書要素の全体を直列化し直す）／B: 編集した範囲だけを書き換える | B。D-31 の「触っていない部分を 1 文字も変えない」に、文字列として届くのは B だけ |
| 2 | 最初の版の対象 | 上の 4 種類（手順、段落、警告・注意・注記、リストの項目）／もっと狭く（手順だけ）／もっと広く（表の行、品目も） | 上の 4 種類 |
| 3 | 版と変更の印 | A: `editContent` は版も変更の印も変えない（`apply_fixes` と同じ）／B: 最初の版から `changeType`・`changeMark`・`reasonForUpdate` を書く | A で始め、仕様書の変更の印の章を読んでから B を別の版で足す。A の間は、writer-mcp の応答に「版と変更の印は変えていない」と書く |
| 4 | replace を入れるか | 入れない／入れる | 入れない（作り直しと同じ結果になる） |
| 5 | `applyFix`・`applySegments` を B に寄せるか | 寄せる／寄せない／`editContent` の後で決める | `editContent` の後で決める。走査器ができてから、2 つの操作の差分がどれだけ減るかを測って判断する |

## 残っている点

| 項目 | 内容 |
|---|---|
| 走査器の難しさ | 文字参照や CDATA の中の `<`、属性の値の中の `>` を正しく読み飛ばす必要がある。配布物のテストで範囲の対応を確かめるまで、実装の大きさは見積もれない |
| 字下げ | 足す要素の中の字下げ（子の要素の改行と空白）を、周りの書き方に合わせるかどうか。最初の版は、基準の要素の行頭の空白だけを写す |
| 改行の種類 | 元の文字列が CRLF のときに、足す要素の改行を合わせるかどうか。Bike Samples の改行の種類は数えていない |
| 手順の番号 | S1000D の `proceduralStep` は番号の属性を持たないので、移しても番号を書き換える必要は無い。本文の文が「手順 3 を参照」のように番号を書いている場合は、core では直せない |
