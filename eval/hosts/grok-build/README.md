# S1000D Stack — Grok Build 実機評価キット

Grok Build に plugin で入れた S1000D Stack（MCP 4 本・Skill 4 本）を、作った側（Claude）とは別のエージェントに使ってもらい、自然文の依頼から正しいツールと引数を選べるか、応答を正しく読めるか、境界を守るかを記録するための作業一式です。作成日は 2026-11-05（JST）です。

構成と物差しは、pdf-agent-stack の Grok Build 評価（`pdf-agent-stack/eval/hosts/grok-build/`、2026-11 の試用では E4）に合わせています。e2e（`e2e/`）は「決めた引数で呼んで、決めた結果が返るか」を確かめます。このキットは「依頼文から、エージェントが引数を作り、応答を読み、次の操作を決められるか」を確かめます。

> [!IMPORTANT]
> このファイル（README.md）は依頼者（shuji-bonji）が読むものです。Grok Build の作業場には複製しません。下の「依頼者の控え」に、作った側が期待する動きを書いているためです。作業場に置くのは `AGENTS.md`・`00-grok-build-setup.md`・`00-evaluation-criteria.md`・`00-report-template.md`・`instructions/` だけです。

## 対象の版（2026-11-05 に `npm view` と GitHub のタグで確認）

| 種類 | 名前 | 版 |
| --- | --- | --- |
| MCP | s1000d-brex-mcp | 0.5.0 |
| MCP | s1000d-verify-mcp | 0.6.1 |
| MCP | s1000d-reader-mcp | 0.7.1 |
| MCP | s1000d-writer-mcp | 0.1.2 |
| Skill | experience-to-s1000d / s1000d-publish / s1000d-review / s1000d-translate | 0.1.1 |
| 任意の MCP | xcomet-mcp（翻訳の採点） | Grok に登録済み |

## ファイル構成

| パス | 役割 | 作業場に置くか |
| --- | --- | --- |
| `README.md` | このファイル。事前準備・プロンプト・依頼者の控え | 置かない |
| `AGENTS.md` | Grok Build が作業場の直下で読む作業規則 | 置く |
| `00-grok-build-setup.md` | 環境の確認とスモークテスト | 置く |
| `00-evaluation-criteria.md` | 評価の 4 段階・境界違反・風合いの見方 | 置く |
| `00-report-template.md` | 報告書の型 | 置く |
| `instructions/UC01`〜`UC10` | ユースケースごとの指示書 | 置く |
| `fixtures/DMC-KENBAIKI-A-90-00-00-00A-040A-D_001-00_JA-JP.XML`・`fixtures/DMC-KENBAIKI-A-91-00-00-00A-040A-D_001-00_JA-JP.XML` | UC10 のエラー経路の検体（自作）。前者は KENBAIKI の BREX を途中で切ったもの、後者は空のファイル。CSDB の対象になるよう DMC の形の名前にしている | `fixtures/incoming/broken/` に置く |
| `fixtures/assets/` | 体験型マニュアルの `assets` が指す素材のダミー（1×1 の PNG 5 件、JT・GLB の中身の無いファイル）。e2e の `assetBaseDir` と同じ扱い | `fixtures/incoming/` の `img/`・`cad/` に置く |
| `reports/2026-11/` | 2026-11-05 の試用の報告書と、そのとき作られた CSDB | 置かない |

## Grok Build への登録の形（2026-11-05）

8 つの plugin を、GitHub のリポジトリから直接入れています（`grok plugin install https://github.com/shuji-bonji/<リポジトリ> --trust`）。

| 種類 | 実際に動くもの |
| --- | --- |
| MCP 4 本 | リポジトリの `.claude-plugin/plugin.json` の `mcpServers` に従い、`npx -y @shuji-bonji/<名前>@latest` で npm の公開版を起動する。リポジトリの中のソースやビルドは使われない。版は起動した時点の npm の最新版になる |
| Skill 4 本 | GitHub の既定のブランチ（main）の `skills/<名前>/SKILL.md`。2026-11-05 の時点で、4 本とも main とタグ `v0.1.1` が同じコミット |

試用の日までに main やタグが進んだ場合は、`SETUP.md` の版と上の表を比べて、違いを所見にします。

## 事前準備（依頼者が手で行う）

### 1. Cursor のプライバシーの設定

2026-11-04 の E4 では、「Legacy (no storage)」のままだと `Request denied (403): Grok Build is not supported in Legacy (no storage).` が返りました。「Privacy Mode (no training)」にしてから起動してください。

### 2. 設定ファイル `~/.config/s1000d-stack/config.json`

plugin の `.claude-plugin/plugin.json` の `mcpServers` には `env` がありません。pdf 側の F-22 のとおり、plugin に環境変数を渡す手段もありません。そのため、4 本のサーバーは環境変数ではなく設定ファイルから `specDir` と `csdbDirs` を読みます（s1000d-core の `stack-config.ts`。読む順番は環境変数 → 設定ファイル）。

2026-11-05 の時点のファイルには `specDir` しかありません。`csdbDirs` を足して、次の内容にしてください（元の内容は試用の後に戻すために控えておきます）。

```json
{
  "specDir": "/Users/bonji/workspace/shuji-bonji/s1000d-stack/specs/s1000d/issue-7",
  "csdbDirs": ["/Users/bonji/s1000d-stack-eval/csdb"]
}
```

> [!WARNING]
> この設定ファイルは、Claude 側の s1000d 系 MCP（`-dev` を含む）のうち環境変数を渡していないものも読みます。試用が終わったら元に戻してください。

### 3. 作業場を作る

作業場はリポジトリの外に置きます（E4 と同じ扱い）。

```bash
HUB=~/workspace/shuji-bonji/s1000d-stack
KIT=$HUB/eval/hosts/grok-build
EVAL=~/s1000d-stack-eval

mkdir -p $EVAL/{csdb,work,reports} $EVAL/fixtures/incoming/{dml,broken}
cp $KIT/AGENTS.md $KIT/00-grok-build-setup.md $KIT/00-evaluation-criteria.md $KIT/00-report-template.md $EVAL/
cp -R $KIT/instructions $EVAL/

# プロジェクトの CSDB の初期状態: 自作の BREX 2 層（組織 KBWORKS → プロジェクト KENBAIKI）
cp $HUB/e2e/fixtures/csdb-base/*.XML $EVAL/csdb/
# 入力（読み取り専用）
cp $HUB/lib/experiential-manual-model/examples/kenbaiki.manual.json $EVAL/fixtures/incoming/
cp $HUB/e2e/fixtures/dml/*.XML $EVAL/fixtures/incoming/dml/
cp $KIT/fixtures/DMC-KENBAIKI-A-9?-*.XML $EVAL/fixtures/incoming/broken/
cp -R $KIT/fixtures/assets/img $KIT/fixtures/assets/cad $EVAL/fixtures/incoming/
chmod -R a-w $EVAL/fixtures/incoming
```

### 4. 起動と確認

```bash
cd ~/s1000d-stack-eval
grok inspect
```

次の 3 点を確かめてから `grok` を起動します。

| 確かめること | 理由 |
| --- | --- |
| `Project Instructions` に `AGENTS.md` が出る | 2026-11-05 の `grok inspect` は、CWD が `s1000d-stack` のときも `specs/s1000d/issue-7` のときも `Project Instructions (None)` だった。作業場の直下で起動したときだけ `AGENTS.md` が読まれる |
| `MCP Servers` の s1000d 系が `s1000d-brex`・`s1000d-verify`・`s1000d-reader`・`s1000d-writer` の 4 本だけで、どれも `plugin:` から起動している | `-dev` などが混ざると、どちらのサーバーの結果か分からなくなる（E4 の pdf-writer-dev と同じ） |
| `Skills` に `experience-to-s1000d`・`s1000d-publish`・`s1000d-review`・`s1000d-translate` が出る | 2026-11-05 の `grok inspect` では 4 つとも出ている |

## 開始プロンプト（最初のセッションに貼る）

```text
この作業場は S1000D Stack（S1000D のデータモジュールを扱う MCP サーバー 4 本と Skill 4 つ）の実機評価用です。AGENTS.md と 00-grok-build-setup.md を読み、00-grok-build-setup.md の手順 1〜6 を順に行ってください。

- 製品のコードと、fixtures/incoming/ の中身は変更しないでください。
- 書き込んでよいのは csdb/・work/・reports/ の中だけです。
- 期待した結果と違っても止めずに、違ったことを記録して次の手順に進んでください。
- reports/SETUP.md を書いたら止まり、UC01 には進まないでください。
```

## UC ごとのプロンプト（UC01 から番号順に 1 本ずつ）

各 UC は新しいセッションで始めても、同じセッションで続けても構いません。どちらにしたかは報告書に書いてもらいます。UC02 以降は前の UC が `csdb/` に書いた DM を使うので、番号順に回してください。

```text
AGENTS.md を読んでから、instructions/UCnn-….md を実行してください。指示書の「依頼文」を、利用者からの依頼としてそのまま受け取ってください。
手順の番号どおりに進め、番号の付いた手順を飛ばさないでください。飛ばすときは理由を報告書に書いてください。
終わったら reports/UCnn.md を 00-report-template.md の型で書いてください。推測で埋めず、呼べなかったものは「未実施」と理由を書いてください。
```

## 最後のセッションに貼るプロンプト

```text
reports/SETUP.md と reports/UC01.md〜UC10.md を読み、reports/SUMMARY.md を書いてください。
1. UC ごとの 4 段階の評価と、境界違反 6 項目の件数の表
2. UC ごとに使った Skill と、Skill の Phase を飛ばした箇所の一覧（UC × Skill）
3. 迷った箇所と、自分で決めた値の一覧（UC ごと）
4. 新しく見つけた問題。それぞれ「入力（ツール名と主な引数）」「想定」「実際（応答のフィールド名と値）」を書く
5. ツールの説明（description）・inputSchema・応答の _notes と、実際の動作が違った箇所
報告書に書いてあることだけを使い、文章で評価を上書きしないでください。
```

## 結果の置き場

Grok が `~/s1000d-stack-eval/reports/` に書いた報告書を、このキットの `reports/2026-11/` に複製します。`csdb/` にできた DM は、自作の BREX と自作のマニュアルから作ったものなので、`reports/2026-11/csdb/` に複製して構いません（S1000D の配布物の中身は入っていません）。

---

## 依頼者の控え（Grok Build には渡さない）

### このキットで新しく確かめること

| 点 | 内容 |
| --- | --- |
| 本物の XSD と自作 BREX の組み合わせ | e2e の spec モード（`S1000D_SPEC_TESTS=1`）は、自作 BREX に頼るテストを飛ばす。このキットは `specDir` に Issue 7 の配布物を、CSDB に自作 BREX 2 層を置くので、e2e で通していない組み合わせになる |
| plugin 経由の起動と設定ファイル | e2e は `S1000D_CONFIG` を存在しない場所に向けて環境変数で渡す。このキットは plugin の `npx -y …@latest` と `~/.config/s1000d-stack/config.json` で動かす |
| 引数の作り方 | `draft`・`allocation`・`selections` の木を、エージェントが `inputSchema` だけを手がかりに作れるか |
| Skill の効き方 | Skill の Phase どおりに進むか。Report の見出しが各 Skill の `references/report.md` と一致するか |

### 自作 BREX（`e2e/fixtures/csdb-base`）の規則

| 層 | 規則 | 起きること |
| --- | --- | --- |
| 組織 KBWORKS（連鎖の終端。自分自身を `brexDmRef` で指す） | KBW-00001 すべての DM は `brexDmRef` を持つ / KBW-00002 国コードは JP か US | en-US は通り、fr-FR は違反になる（UC08） |
| プロジェクト KENBAIKI（`brexDmRef` は KBWORKS） | KB-00001 責任企業は `K0002` だけ / KB-00002 情報コードは 022・040・130・411 と 500~599 / KB-00003 機密区分は 01・02・03 / KB-00100 非文脈ルール | K0001 は `exact` で自動修正、機密区分 09 は `several`（01・02・03）、手動確認が出る |

### UC ごとの期待（採点ではなく、報告を読むときの手がかり）

| UC | 期待する動き | 見落としやすい点 |
| --- | --- | --- |
| SETUP | brex `list_notations` または `explain_brex`、verify `list_schemas`、reader `list_data_modules`（BREX 2 件）、writer `build_data_module`（`write` を付けない） | `serverInfo` の版を `npm view` と比べるか。設定ファイルが読まれていないとき、`_notes` の `configPath` の文を読むか |
| UC01 | brex `explain_brex`（既定 BREX）→ `explain_brex` / `lookup_value`（KENBAIKI） | 既定 BREX の DMC のシステム差異コードを決め打ちしないか。KENBAIKI → KBWORKS の連鎖を書くか |
| UC02 | Skill experience-to-s1000d。writer `convert_manual`（`write: false`）→ 結果の確認 → `write: true` → verify `verify_csdb` | 情報コード（`infoCodeByKind`）を KB-00002 の許可値の外で決めて `several` になったとき、候補から選ぶか。`notRepresented` と `ledger` を報告するか。責任企業の `exact` の自動修正（`appliedFixes[]`）に気づくか |
| UC03 | reader `list_data_modules` → `read_data_module`（`section: "outline"`）→ 本文 → `read_publication_module` | 全文を読む前に outline で当たりを付けるか。`securityClassification` を見てから本文を出すか |
| UC04 | Skill s1000d-publish。writer `build_data_module`（kind `proced`、注意は `admonition` の `caution`）→ `write: true` → verify `verify_data_module` | `applic` を省いて XSD に落ちたとき、`fixes[]` か `_notes` を読んで直せるか。`input-error` の `path` を読むか |
| UC05 | 違反の下書き → `build_data_module` → `appliedFixes[]`（K0001 → K0002）と `fixes[]`（09 → 01・02・03）→ `apply_fixes`。05 は `rejected` の `candidate-not-offered` | 候補の外の値で直さないか。`exact` が自動で適用済みであることに気づくか。2 回目の書き込みの `write-conflict` を `overwrite: true` で黙って上書きしないか |
| UC06 | verify `reconcile_dml` → reader `list_data_modules`（`include` に DML）の `reconciliation` | 2 つの件数が一致するかを比べるか。採番の違いによる不一致を「DM の欠陥」と書かないか |
| UC07 | Skill s1000d-review。reader（outline）→ verify `suggest_fixes` → brex `check_against_brex` の `manualChecks` → writer `create_comment` | 指摘を観点 A・B・C に分けるか。`originator` の必須を `input-error` から読めるか。comment DM を verify に通すか |
| UC08 | Skill s1000d-translate。writer `extract_segments` → 訳す → xcomet → `apply_segments`（en-US）。fr-FR は KBW-00002 の違反 | プレースホルダー `{1}` を保つか。DMC が同じで言語だけ違うことに気づくか。DeepL の MCP が Grok に無いとき「未実施」と書くか |
| UC09 | 古い `skeletonHash` で `apply_segments` → `skeleton-mismatch` → 取り出し直して適用 | `skeletonHash` を作り直して通そうとしないか。元の DM の新しい版を XML の手書きで作らないか |
| UC10 | verify `verify_csdb` → エラー経路（存在しないパス・存在しないフォルダー・壊れた XML・空のファイル） | `references.state: unresolved` のうち仕様書への参照だけのものを問題として数えないか。エラーの分類（入力の誤り・ファイルの破損・未検証）を書き分けるか |

### 報告を受け取った後

1. 不具合の候補は、`e2e/` に再現のテストを足してから直す。期待値は緩めない。
2. ツールの取り違え・引数の作り違えが多い箇所は、ツールの `description`・`inputSchema`・`instructions` を直す（MCP の版を上げる）。
3. Skill の Phase どおりに進まなかった箇所は、SKILL.md を直す（Skill の版を上げる）。
4. 結果の要約を ROADMAP の進捗に 1 行で記録する。
