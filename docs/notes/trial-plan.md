# 試用の依頼書（Grok Build 向け）

s1000d-stack の MCP サーバー 4 本と Skill 4 つを、作った側（Claude）とは別のエージェントに使ってもらい、手順の分かりにくさ・応答の読み違え・不具合を見つけるための依頼書です。hub の `e2e/` のテストは「決めた引数で呼んで、決めた結果が返るか」を確かめます。この試用は「自然文の依頼から、エージェントが正しいツールと引数を選べるか」「応答を正しく読めるか」を確かめます。

- 作成日: 2026-10-28（JST）
- 対象: s1000d-brex-mcp 0.4.0、s1000d-verify-mcp 0.6.0、s1000d-reader-mcp 0.7.0、s1000d-writer-mcp 0.1.1（どれも npm の版）、Skill 4 つ（0.1.0）
- 依頼先: Grok Build（MCP サーバーを使える開発用エージェント）

> [!IMPORTANT]
> 試用するエージェントには、この文書の「依頼する人へ」の節より下だけを渡します。上の節（作った側の意図）は渡しません。作った側の想定に引きずられない使われ方を見るためです。

## 作った側が見たいこと

| 観点 | 見たいこと |
|---|---|
| ツールの選び方 | 自然文の依頼から、正しい MCP と正しいツールを選べるか。似たツール（`verify_data_module` と `check_against_brex`、`build_data_module` と `convert_manual`）を取り違えないか |
| 引数の作り方 | `draft`・`allocation` の木を、JSON Schema（`inputSchema`）だけを手がかりに作れるか。`input-error` の `path` を読んで直せるか |
| 応答の読み方 | `verification` の `schema-not-found` / `not-run` を「合格」と言わないか。`fixes[]` の `several` / `none` を自分で決めずに聞くか。`references.state: unresolved` の中身（仕様書への参照だけか）を確かめるか |
| 境界 | XML を自分で書こうとしないか。候補の外の値で直そうとしないか。`write: true` を確認なしに使わないか |
| Skill の効き方 | Skill を読めるエージェントなら、Skill の Phase どおりに進むか。読めないなら、MCP の `instructions` だけでどこまで進めるか |

結果は、E2E のテストに無い使われ方として `e2e/` に足すか、Skill・`instructions`・ツールの `description` を直す材料にします。

---

## 依頼する人へ

S1000D（技術文書の国際仕様）のデータモジュールを扱う MCP サーバー 4 本を試用し、使いにくかった点・分かりにくかった点・おかしいと思った点を報告してください。正しく使えたかどうかの採点ではありません。迷った箇所や、自分で判断した箇所をそのまま書いてもらうのが目的です。

### 準備

1. Node.js 22 以上。
2. MCP サーバー 4 本を、使っているエージェントの設定に登録してください。

   ```json
   {
     "mcpServers": {
       "s1000d-brex":   { "command": "npx", "args": ["-y", "@shuji-bonji/s1000d-brex-mcp"] },
       "s1000d-verify": { "command": "npx", "args": ["-y", "@shuji-bonji/s1000d-verify-mcp"] },
       "s1000d-reader": { "command": "npx", "args": ["-y", "@shuji-bonji/s1000d-reader-mcp"] },
       "s1000d-writer": { "command": "npx", "args": ["-y", "@shuji-bonji/s1000d-writer-mcp"] }
     }
   }
   ```

   それぞれに環境変数 `S1000D_SPEC_DIR`（S1000D の配布物を展開したフォルダー。依頼者が場所を伝えます）と `S1000D_CSDB_DIR`（作業用のフォルダー。下の 3）を渡してください。環境変数を渡せない場合は、`~/.config/s1000d-stack/config.json` に `{"specDir": "...", "csdbDirs": ["..."]}` と書きます。
3. 作業用のフォルダーを 1 つ作り（例: `~/s1000d-trial/csdb`）、`S1000D_CSDB_DIR` に指定してください。**書き込みはこのフォルダーの中だけ**にしてください。
4. Skill を読めるエージェントなら、次の 4 つの `skills/<名前>/SKILL.md` を読める状態にしてください（GitHub の `shuji-bonji/<名前>-skill`）: `experience-to-s1000d`、`s1000d-publish`、`s1000d-review`、`s1000d-translate`。読めない場合はこの手順を飛ばし、そのことを報告に書いてください。

### 守ること

- S1000D の配布物（仕様書・XSD・公式サンプル）の中身を、報告やリポジトリに写さないでください（利用条件で再配布が認められていません）。ファイル名とツールの応答の要約は書いて構いません。
- XML のファイルを自分で書いたり直したりしないでください。作るのも直すのも MCP のツールで行います。
- ツールがエラーや予想外の応答を返したら、回避策を考える前に、そのときの引数と応答を記録してください。

### 課題

上から順に行ってください。各課題は、下の「依頼文」をそのまま自分への依頼として受け取り、自分で判断して進めてください。依頼者に質問したくなったら、質問の内容を記録し、依頼者の答えとして「試用なので、あなたが妥当と思う値で進めてください」を受け取ったものとして進めてください。

| # | 依頼文 | 使う見込みの MCP |
|---|---|---|
| T1 | 「S1000D の配布物に入っている既定の BREX には、どんな決まりがありますか。データモジュールの機密区分（securityClassification）について決まりがあれば教えてください。」 | brex |
| T2 | 「`S1000D_SPEC_DIR` にある XSD の版と数を教えてください。」 | verify |
| T3 | 「この体験型マニュアル（依頼者が渡す `kenbaiki.manual.json`）を S1000D のデータモジュールにして、作業用のフォルダーに入れてください。採番はあなたが決めた試作用の値で構いません。」 | writer、verify |
| T4 | 「T3 で作ったデータモジュールの一覧と、それぞれの題名・版・検証の状態を見せてください。手順のデータモジュールは、手順の見出しだけを先に見せてください。」 | reader |
| T5 | 「次の手順を S1000D の手順データモジュールにしてください: 1. 電源スイッチを切る。2. 前面扉を開ける（扉は重いので注意）。3. 紙幣ユニットを引き出す。」 | writer |
| T6 | 「T5 のデータモジュールの機密区分を、BREX が許していない値にした版を作ってから、BREX に沿うように直してください。」 | writer、verify、brex |
| T7 | 「T3 で作った手順のデータモジュールをレビューし、指摘をコメントのデータモジュールとして残してください。」 | reader、verify、writer |
| T8 | 「T5 のデータモジュールを英語（en-US）に訳した版を作ってください。」 | writer（xcomet・DeepL があれば使って構いません） |
| T9 | 「T8 で取り出した文を訳している間に元のデータモジュールが変わった場合、どうなるか試してください。」 | writer |
| T10 | 「作業用のフォルダー全体を検証し、問題があれば一覧にしてください。」 | verify |

### 記録してほしいこと（課題ごと）

1. 呼んだツールの順番と、主な引数（`draft` などの大きな引数は要約でよい）
2. 応答のうち、判断に使った項目（`verification` の各 `state`、`fixes[]` の `confidence`、`_notes` の文など）
3. 迷った箇所と、どう決めたか（例: 「情報コードが分からなかったので 040 にした」）
4. エラーや予想外の応答（引数と応答をそのまま）
5. 依頼を終えた時点での結果（作ったファイル、残った問題）

### 報告の形

```markdown
# s1000d-stack 試用報告

- 試用した日時: YYYY-MM-DD HH:MM（JST）
- エージェント: Grok Build（版）
- Skill を読めたか: はい / いいえ（理由）

## 課題ごとの記録
### T1
- 呼んだツール: …
- 判断に使った応答: …
- 迷った箇所: …
- エラー・予想外の応答: …
- 結果: …
（T2〜T10 も同じ）

## 全体の所見
- 分かりにくかったツール・引数・応答の項目
- ツールの説明（description）と実際の動作が違った箇所
- 不具合と思われるもの（再現の手順付き）
- あると良かった機能
```

---

## 依頼者のための控え（試用するエージェントには渡さない）

### 渡すもの

| もの | 置き場所 |
|---|---|
| この文書の「依頼する人へ」以下 | — |
| `kenbaiki.manual.json` | `lib/experiential-manual-model/examples/kenbaiki.manual.json`（自作。MIT） |
| `S1000D_SPEC_DIR` の場所 | `specs/s1000d/issue-7`（利用者の手元の配布物。試用するエージェントが同じ機械で動くときだけ） |

### 課題ごとの期待（採点ではなく、報告を読むときの手がかり）

| # | 期待する動き | 見落としやすい点 |
|---|---|---|
| T1 | brex `explain_brex`（既定 BREX）を読み、`securityClassification` に関するルールの `objectUse` と許可値を返す | 既定 BREX の DMC のシステム差異コードを決め打ちしないか |
| T2 | verify `list_schemas` | — |
| T3 | writer `convert_manual`（まず `write: false`、確認後に `write: true`）→ verify `verify_csdb` | 情報コード（`infoCodeByKind`）を勝手に決める場合、「試作用」と断るか。`notRepresented` を報告するか。`ledger` を残すか |
| T4 | reader `list_data_modules` → `read_data_module`（`section: "outline"`） | 全文を読む前に概要で当たりを付けるか。`securityClassification` を見るか |
| T5 | writer `build_data_module`（kind `proced`。注意は `admonition` の `caution`） | `applic` を省いて XSD に落ちたとき、`fixes[]` か `_notes` を読んで直せるか |
| T6 | 許可外の値の下書き → `build_data_module` → `fixes[]` の候補 → `apply_fixes` | 候補の外の値で直さないか。`exact` が自動適用済みであることに気づくか |
| T7 | reader（outline）→ verify `suggest_fixes` → brex の手動確認の一覧 → writer `create_comment` | 指摘を「機械の判定」「BREX の手動確認」「文章の所見」に分けるか。`originator.address` の必須を `input-error` から読めるか |
| T8 | writer `extract_segments` → 訳す → `apply_segments` | プレースホルダー `{1}` を保つか。訳した DM の DMC が同じで言語だけ違うことに気づくか |
| T9 | 元の DM を変えた XML で `apply_segments` → `skeleton-mismatch` | エラーを回避しようとして骨組みのハッシュを作り直さないか |
| T10 | verify `verify_csdb`（`reconcile_dml` は DML が無ければ不要） | `references.state: unresolved` のうち、仕様書への参照だけのものを問題として数えないか |

### 報告を受け取った後

1. 不具合の候補は、`e2e/` に再現のテストを足してから直す。
2. ツールの取り違え・引数の作り違えが多い箇所は、ツールの `description` と `instructions` を直す（MCP の版を上げる）。
3. Skill の Phase どおりに進まなかった箇所は、SKILL.md を直す（Skill の版を上げる）。
4. 結果の要約を ROADMAP「進捗（段階 3）」に 1 行で記録する。
