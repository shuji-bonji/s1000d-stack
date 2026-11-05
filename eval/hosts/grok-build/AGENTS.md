# S1000D Stack 実機評価 — Grok Build 作業規則

このディレクトリは実装リポジトリではありません。MCP と Skill を呼び出して、報告書を書く作業場です。

## 目的

S1000D Stack が Grok Build 上で使えるかを測る。依頼文から正しいツールと引数を選べるか、応答の検証状態を正しく読めるか、サーバーの判定を文章で上書きしないか、失敗を隠さないかを記録する。正しく使えたかどうかの採点ではない。迷った箇所と、自分で決めた値をそのまま書くことが目的。

## 登場するもの

| 名前 | 役割 |
| --- | --- |
| s1000d-brex | BREX（プロジェクトや組織が決めた、使ってよい要素・属性・値の決まり）を読み、DM を BREX に照合する |
| s1000d-verify | XSD による検証・BREX の照合・参照の解決をまとめて、検証状態（`verification`）を返す。CSDB 全体の検証、DML との照合 |
| s1000d-reader | DM とパブリケーションモジュールを、XML ではなく構造として読む。適用性の判定 |
| s1000d-writer | 構造化した下書きから DM を組み立てる。修正の適用、comment DM、翻訳用の文の取り出しと書き戻し |
| Skill 4 つ | experience-to-s1000d（体験型マニュアル → CSDB）、s1000d-publish（下書き → DM）、s1000d-review（レビュー → comment DM）、s1000d-translate（DM の翻訳） |

## 作業場の形

```text
s1000d-stack-eval/
  AGENTS.md
  00-grok-build-setup.md
  00-evaluation-criteria.md
  00-report-template.md
  instructions/        # UC01〜UC10 の指示書
  csdb/                # プロジェクトの CSDB。書き込んでよい
  work/                # 下書きの JSON、台帳、メモ。書き込んでよい（XML は置かない）
  reports/             # 報告書。書き込んでよい
  fixtures/incoming/   # 受け取った入力。読み取り専用
```

## やってよいこと

- MCP ツールを呼び出す
- `csdb/` に、MCP のツールの `write: true` で DM を書く
- `work/` に、下書き・採番の台帳・訳文などの JSON や Markdown を置く
- `reports/` に Markdown の報告書を書く

## やってはいけないこと

- XML のファイルを自分で書く・直す・消す（シェル・エディター・ファイル操作のどれでも）。作るのも直すのも MCP のツールで行う
- サーバーが拒んだ操作（`rejected`、`skeleton-mismatch` など）を、値や `skeletonHash` を作り直して通す
- `fixes[]` の候補の外の値で直す
- `write: true` を、同じ内容を書き込まずに組み立てた結果（`verification`）を確かめる前に使う
- `csdb/`・`work/`・`reports/` の外に書き込む。`fixtures/incoming/` を変える
- S1000D の配布物（仕様書・XSD・既定 BREX・公式サンプル）の本文を、報告書に写す（利用条件で再配布が認められていない）。ファイル名・DMC・規則の ID と、ツールの応答の要約は書いてよい
- 製品のコードを書き換える

## 言い切りの強さ

| 書いてよい言い方 | 書いてはいけない言い方 |
| --- | --- |
| 「XSD の検証で `schema.state` が `valid` だった」 | 「S1000D に準拠している」「S1000D に適合している」 |
| 「機械で判定できる BREX のルールに違反が無かった（`brex.state: passed`）」 | 「BREX に完全に従っている」「問題なし」 |
| 「`schema-not-found` のため XSD の検証は未実施」 | 「XSD の検証に合格した」 |
| 「`references.state` は `unresolved`。内訳は …」 | 参照が確かめられていないのに「参照は正しい」 |
| 「xcomet の得点は 0.xx」 | 「訳は正しい」 |

「無い」と「確かめていない」を混ぜない。`schema-not-found`・`not-run`・`no-csdb`・`incomplete` は「未実施」または「未検証」と書き、合格の側に数えない。

## 依頼者への質問

試用中は依頼者に質問できない。質問したくなったら、質問の内容を報告書の「迷った箇所」に書き、依頼者の答えとして「試用なので、あなたが妥当と思う値で進めてください」を受け取ったものとして進める。`write: true` の確認も同じ扱いにする。ただし、書き込みの前に `write: false`（または `write` を付けない呼び出し）で同じ内容を組み立て、その `verification` を報告書に残すこと。

## 呼び出しの原則

- エラーや予想外の応答が返ったら、回避策を考える前に、そのときの引数と応答を報告書に記録する
- 応答の `_notes` は読む。判断に使った文は報告書に写す
- 大きな引数（`draft`・`allocation` など）は、報告書では要約でよい。全体は `work/` に JSON で残す
- 応答のフィールド名は、応答に出てきた名前で書く。名前を推測で書かない

## 報告書

各ユースケースの終了時に `reports/UCnn.md` を `00-report-template.md` の型で書く。推測で埋めない。呼べなかったツールは「未実施」と理由を書く。
