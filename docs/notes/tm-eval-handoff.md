# 実在の TM を使った確認の引き継ぎ（2026-11-15）

実在の技術マニュアルを体験型マニュアルに写し、S1000D に変換して、model と基盤（writer・reader）で表せないものを実測した作業の引き継ぎです。次のチャットは、この文書と `NOTES.md` を読めば続きから始められます。

> [!WARNING]
> 題材から作ったもの（`.emanual`、切り出した図、変換した XML）は社内の確認用です。配布しません。リポジトリにも入れません。公開してよいのは、表せなかったものの一覧（自分たちの観察）だけです。

## 題材と置き場所

- 題材: ARMY TM 9-6115-749-10（5 kW AMMPS 発電機の操作員用の手引き、2011-02-01、292 ページ）。表紙に DISTRIBUTION STATEMENT A の表示があります。
- 使わないもの: 2017 年版の TM 9-6115-639-13&P（Distribution Restriction Code C）。
- 置き場所: `/Users/bonji/s1000d-stack-eval/tm-9-6115-749-10/`（リポジトリの外）

| ファイル | 内容 |
|---|---|
| `NOTES.md` | 記録の本体。写した範囲、表せなかったもの、変換と検証の結果、reader で読んだ結果 |
| `ammps-5kw-sample.emanual`、`ammps-5kw-sample.html` | 体験型マニュアル（14 Topic、図 20 枚、押せる場所 76 か所） |
| `manual/manual.json`、`manual/assets/` | 変換の入力 |
| `manual/manual.ledger.json` | 台帳（sourceId と DMC・ICN の対応）と `icnNext: 21` |
| `csdb/` | 変換した DM 25 件、PM 1 件、ICN 20 件 |
| `verify-csdb-report.json` | `verify_csdb` の全件の詳細 |
| `src/build.mts`、`src/hs.json` | Manual を組み立てるスクリプトと、ホットスポットの座標の一部 |

## 済んだこと

1. experiential-manual-model 0.2.0 で、操作パネル、制御装置の画面、始動の手順、機材の概要と各部、始動しないとき、冷却系統の手入れを写しました。`validateManual` はエラー 0 件・警告 0 件です。
2. Experiential Manual Editor とエクスポートした HTML で開けることを、Linux の Chromium と、利用者の Mac で確かめました。
3. s1000d-writer-mcp の `convert_manual` で CSDB に書き込みました。採番は試作用の値です（モデル識別コード `AMMPS5KW`、SNS `10`/`2`/`0`/`00`、情報コード `040A`・`520A`・`130A`・`411A`、CAGE コード `K0001`、機密区分 `01`）。
4. s1000d-verify-mcp の `verify_csdb` で、26 件とも XSD（Issue 7）の違反なし、機械で検査できる BREX のルールで違反なし、参照はすべて解決、を確かめました。S1000D への準拠の判定ではありません。
5. s1000d-reader-mcp の `read_data_module` で、4 件の DM を読みました。残りの 21 件と PM は読んでいません。

## 分かったこと（要望の材料）

材料は 3 種類あり、どれも `NOTES.md` に 1 件ずつ記録してあります。

| 種類 | 件数 | 例 |
|---|---|---|
| model で表せず、別の形で書いたもの | 15 件 | 作業前の要件、Topic 全体にかかる警告、文中の参照、同時押し、時間による遷移、別の作業を呼んで戻る、故障探求の 3 段（症状・原因・対処の手順） |
| writer が DM に入れなかったもの（`notRepresented`） | 9 種類、112 件 | 押せる場所の形と座標 76 件、`Step.targetRef` 11 件、`Step.next` 5 件 |
| reader で読んで分かったもの | 4 件（R1〜R4） | 下の表 |

| # | 見つかったこと |
|---|---|
| R1 | 画面の手順の文が崩れる（「[Exit] — メイン画面に戻るを押す。」）。writer は `Hotspot.label` に「を押す」を付けて文を作るが、見本の `label` には名前と説明の両方を入れていた |
| R2 | 手順 DM と故障探求 DM の `preliminaryRqmts` が、安全の要件（`reqSafety`）を含めてすべて「none」になる。この状態で XSD にも BREX にも通る |
| R3 | プロセス DM の `dmIf` の条件が、reader では「unknown」（`expression`、`variableRef`）になり、条件の文が読めない |
| R4 | プロセス DM の画面の並びが 1 本の列になり、枝分かれが表れない |

model の段階で文や表に直した 15 件は、`notRepresented` に出ません。基盤の不足を測るには、3 種類を合わせて見る必要があります。

## 次にやること

1. 3 種類の材料を「model 0.3.0 への要望」「core / writer への要望」「reader への要望」に振り分け、優先順を付けた一覧にする。
2. R1 を見本の側で直すか（`label` を名前だけにして変換し直す）、model にホットスポットの説明の場所を足すまで待つかを決める。
3. 残りの DM（21 件）と PM を reader で読むかを決める。

## 未決のこと

- WP 0010 の残りの症状、WP 0002 の各部の説明（Figure 4〜12）を写すか。
- 採番の値を、試作用のままにするか。

## あわせて行った変更

Experiential Manual Editor で、「体験」のときに手順・説明・困ったときの図が表示されない不具合を直しました（コミット `ec3282a`、push はしていません）。`main` は `origin/main` より 7 コミット先です。
