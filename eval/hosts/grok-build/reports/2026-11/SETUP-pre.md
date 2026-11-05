# SETUP — 環境の確認とスモークテスト

- 実施日時: 2026-11-05 19:51〜19:55（JST）
- ホスト: Grok Build `grok 1.0.70`（`f50904eaee6c`、channel `stable`）
- セッション: 新しいセッション。作業ディレクトリは製品リポジトリ `/Users/bonji/workspace/shuji-bonji/s1000d-stack`。作業場 `~/s1000d-stack-eval` では起動していない
- ここで止めたか: はい。UC01 には進んでいない

貼られた文書は 2026-10-28 の試用依頼書で、冒頭の注記が現行の手順を `eval/hosts/grok-build/` のキットだと書いていた。キットの開始プロンプトは、手順 1〜6 のあと `reports/SETUP.md` を書いて UC01 の前で止まる、とある。その範囲だけを行った。

開始時点で `~/s1000d-stack-eval` は無かった。設定ファイルは書き換えず、`csdb/` と `fixtures/incoming/` も作っていない。報告書と下書きを置くため、`reports/` と `work/SETUP/` だけを作った。

## 手順 1 — ホストと版

| 項目 | 値 |
| --- | --- |
| OS | macOS 26.7.2（Build 25G332）、Darwin 25.6.0 arm64 |
| Node.js | v24.16.0 |
| npx | ある。`/Users/bonji/.nvm/versions/node/v24.16.0/bin/npx` |
| npm | 11.13.0（プロセス環境の `npm_config_npm_version`） |

`initialize` の `serverInfo` はこのホストのツール結果には出てこない。動いているプロセスの `package.json` を、サーバーが `serverInfo` に渡す `PACKAGE_INFO`（`name` と `version` は `package.json` から読む）として記録した。4 プロセスとも環境変数 `S1000D_SPEC_DIR` / `S1000D_CSDB_DIR` は無い。

| サーバー | このセッションの登録 | プロセス（19:40 開始） | package.json の name / version | `npm view` |
| --- | --- | --- | --- | --- |
| s1000d-brex | plugin `s1000d-brex-mcp`（`~/.grok/installed-plugins/s1000d-brex-mcp-2f723db9`）。`npx -y @shuji-bonji/s1000d-brex-mcp@latest` | pid 17233、`~/.npm/_npx/0fd10f4e54664583` | `@shuji-bonji/s1000d-brex-mcp` 0.5.0 | 0.5.0 |
| s1000d-verify | plugin `s1000d-verify-mcp`（`…-fa1ceb14`）。`npx -y @shuji-bonji/s1000d-verify-mcp@latest` | pid 17209、`~/.npm/_npx/997a5bd1cb1f35ae` | `@shuji-bonji/s1000d-verify-mcp` 0.6.1 | 0.6.1 |
| s1000d-reader | plugin `s1000d-reader-mcp`（`…-39dabb6a`）。`npx -y @shuji-bonji/s1000d-reader-mcp@latest` | pid 17337、`~/.npm/_npx/104344fdb2eae6f8` | `@shuji-bonji/s1000d-reader-mcp` 0.7.1 | 0.7.1 |
| s1000d-writer | plugin `s1000d-writer-mcp`（`…-11a1b668`）。`npx -y @shuji-bonji/s1000d-writer-mcp@latest` | pid 17296、`~/.npm/_npx/bd8b9311c62b8a7f` | `@shuji-bonji/s1000d-writer-mcp` 0.1.2 | 0.1.2 |

期待値（brex 0.5.0 / verify 0.6.1 / reader 0.7.1 / writer 0.1.2）と、`npm view` と、npx キャッシュの版は一致した。依存の `@shuji-bonji/s1000d-core` は 4 本とも 0.8.2。writer の依存に `@shuji-bonji/experiential-manual-model` 0.1.0 がある。これらは別の MCP サーバーではない。

`grok inspect --json`（cwd は製品リポジトリ）の `mcpServers` に s1000d 系は次の 4 本だけあり、どれも `source.type: plugin` だった。

- `s1000d-brex`
- `s1000d-verify`
- `s1000d-reader`
- `s1000d-writer`

`-dev` や同名の二組は、このセッションのツール一覧には無い。同じ機械には 19:13 開始の別プロセスがある（Claude の disclaimer 経由で、製品リポジトリの `mcp/*/dist/index.js` と、別の `npx -y …@latest`）。このセッションのツール呼び出しは、19:40 開始の plugin 経由のプロセスに対応する。

plugin の説明文と、接続されたツール数:

| plugin | plugin.json の説明が言う本数 | このセッションで見えたツール |
| --- | --- | --- |
| s1000d-brex-mcp 0.5.0 | 5 | 5（`explain_brex`、`lookup_sns`、`lookup_value`、`list_notations`、`check_against_brex`） |
| s1000d-verify-mcp 0.6.1 | 5（説明に名前があるのは `verify_data_module` / `validate_schema` / `check_references` / `verify_csdb` / `list_schemas`） | 7。上の 5 つに `suggest_fixes` と `reconcile_dml` がある |
| s1000d-reader-mcp 0.7.1 | 6 | 6 |
| s1000d-writer-mcp 0.1.2 | 6 | 6 |

## 手順 2 — Skill

4 つとも読めた。版はどれも 0.1.1。`grok inspect` の `skills` に出ていて、置き場所は GitHub から入れた plugin の git チェックアウト（`git describe` はどれも `v0.1.1`）。製品リポジトリの `skill/` ではない。

| 名前 | 版 | コミット | 置き場所 |
| --- | --- | --- | --- |
| experience-to-s1000d | 0.1.1 | `0583609` | `~/.grok/installed-plugins/experience-to-s1000d-skill-bd3bc253/skills/experience-to-s1000d/SKILL.md` |
| s1000d-publish | 0.1.1 | `28d6af2` | `~/.grok/installed-plugins/s1000d-publish-skill-cfc80f73/skills/s1000d-publish/SKILL.md` |
| s1000d-review | 0.1.1 | `da8b627` | `~/.grok/installed-plugins/s1000d-review-skill-96a88cd1/skills/s1000d-review/SKILL.md` |
| s1000d-translate | 0.1.1 | `dcb3486` | `~/.grok/installed-plugins/s1000d-translate-skill-21d7e7ef/skills/s1000d-translate/SKILL.md` |

この SETUP では Skill の Phase は実行していない。中身を手順の判断に使うのは UC からにする。

## 手順 3 — 設定

`~/.config/s1000d-stack/config.json`（88 バイト、2026-11-05 19:00 更新）。読んだだけで、書き換えていない。

| キー | 値 |
| --- | --- |
| specDir | `/Users/bonji/workspace/shuji-bonji/s1000d-stack/specs/s1000d/issue-7` |
| csdbDirs | キーが無い |

4 プロセスの環境に `S1000D_SPEC_DIR` と `S1000D_CSDB_DIR` は無い。plugin.json の `mcpServers` にも `env` は無い。

手順 4 の応答から判断したこと:

| サーバー | specDir | csdbDirs | 根拠 |
| --- | --- | --- | --- |
| s1000d-verify | 認識している | 認識していない（空） | `list_schemas` の `specDir` が設定ファイルの値と一致し、`schemaDirs[0].issue` が `"7"`、`xsdCount` が 33。`_notes` の 1 文目が `No CSDB folders: set S1000D_CSDB_DIR, add "csdbDirs" to /Users/bonji/.config/s1000d-stack/config.json, or pass "csdbDirs".` |
| s1000d-brex | 認識している | この呼び出しでは未使用 | `explain_brex` を引数 `brex` なしで 1 回呼び、`source` が `"default"`。`path` が `specDir` の下の `default-brex/DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML`。応答に `csdbDirs` の言及は無い |
| s1000d-reader | この呼び出しでは未使用 | 認識していない | `list_data_modules` が失敗。本文は `{"error":"No CSDB folders. Pass \"csdbDirs\" or set S1000D_CSDB_DIR."}` |
| s1000d-writer | 認識している | 認識していない（空） | `_notes` に既定 BREX のパス（上と同じ `default-brex/` のファイル）と、`descript.xsd` の issue `"7"`。最後の `_notes` が verify と同じ「No CSDB folders」で、同じ `config.json` のパスを指している |

## 手順 4 — スモークテスト

呼び出す前に置いた想定と、返ってきた値。

| ステップ | 入力（ツール名と主な引数） | 想定 | 実際 |
| --- | --- | --- | --- |
| 1 | `s1000d-verify` `list_schemas`、引数なし | `specDir` が設定ファイルのパス。`schemaDirs` が 1 件以上。`issue` があり、`xsdCount` が 1 以上。`schema-not-found` は出ない | `specDir` は設定ファイルと同じ。`schemaDirs` は 1 件。`issue` は `"7"`。`xsdCount` は 33。スキーマ名は 33 個（`descript`、`proced`、`brex`、`comment` などを含む）。失敗はしていない |
| 2 | `s1000d-brex` `explain_brex`、`limit: 1`。`brex` は省略 | 既定 BREX の header（DMC、件数）が 1 回で返る。規則の本文は報告書に写さない | `source: "default"`。`brex.dmc` は `S1000D-J-04-10-0301-00A-022A-D`。`issue` は `001-00`。`parentBrex` は `"self"`。`counts` は structure 274、notation 0、nonContext 1、snsSystems 0。`total` 275、`returned` 1。ファイル名は `DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML` |
| 3 | `s1000d-reader` `list_data_modules`、引数なし | 設定に `csdbDirs` が無く作業場も無いので、BREX の DM 2 件は返らない。空、または CSDB が無い旨 | ホストは `Failed to call list_data_modules` とした。本体は `{"error":"No CSDB folders. Pass \"csdbDirs\" or set S1000D_CSDB_DIR."}`。`error.code` は無い。件数は返っていない |
| 4 | `s1000d-writer` `build_data_module`。下書きは題名「スモーク」、段落 1 つ、`kind: descript`。`write` は付けない。`applic` は inputSchema が任意なので付けない。引数の全体は `work/SETUP/smoke-draft.json` | 入力エラーにはならない。`written` は空。`verification` が返る。`schema.state` は `valid` か `invalid`。`schema-not-found` にはしない。CSDB にファイルはできない | 入力エラーは無い。`written` は `[]`。`fileName` は `DMC-SMOKE-A-00-00-00-00A-040A-A_001-00_JA-JP.XML`。`dmCode` は `SMOKE-A-00-00-00-00A-040A-A`。`verification.schema.state` は `invalid`（`errorCount` 1、issue `"7"`）。`brex.state` は `passed`（`layers` 1、`violationCount` 0、`manualChecks` 1）。`references.state` は `resolved`（`checked` 1、`unresolvedCount` 0）。`fixes[0].confidence` は `several`。`appliedFixes` は空。XML は `work/` に置いていない |

判断に使った応答（XML と、配布物の規則本文は除く）:

```json
{
  "schema": { "state": "invalid", "issue": "7", "errorCount": 1 },
  "brex": { "state": "passed", "layers": 1, "violationCount": 0, "manualChecks": 1 },
  "references": { "state": "resolved", "checked": 1, "unresolvedCount": 0 },
  "byConfidence": { "exact": 0, "several": 1, "none": 0 },
  "written": []
}
```

`schema.state` は `invalid` なので、XSD の検証を済んだことにはしていない。`brex.state` は `passed` で、機械で判定できるルールの `violationCount` は 0。`manualChecks` は 1 なので、人が見る項目が 1 件残っている。`fixes[0]` は `confidence: "several"` で候補が 4 つ（`brexDmRef` を消す、または `applicCrossRefTableRef` / `applic` / `applicRef` に置き換える）。候補は選んでいない。

従った `_notes`:

- `Nothing was written (write is false). The XML is only returned.` — `write` を付けなかった。`written` は空だった。
- `verification tells how far this XML has been checked. schema-not-found and not-run are NOT "valid"` — 状態は上の JSON の語のまま書いた。
- `Choose only among the candidates in fixes[]. When confidence is "none", ask the user.` — 今回の confidence は `several`。候補の外の値は使っていない。この手順は組み立てて `verification` を見ることまでなので、`apply_fixes` は呼んでいない。
- `applic: not given; the applic element was omitted (the schema requires applic or applicRef).` — 呼び出しのあとで読んだ。2 回目の組み立てはしていない。

`list_schemas` の `_notes` も、CSDB が無いことと、XSD は `xsi:noNamespaceSchemaLocation` のファイル名で選ぶことを書いていた。CSDB を足す操作はしていない（下の「迷った箇所」）。

目的のツールまでの呼び出しは、4 本とも 1 回。`convert_manual` と `build_data_module` は取り違えていない（渡されたのは体験型マニュアルではない）。`check_against_brex` は使っていない（概要は `explain_brex`）。`input-error` は 0 回。

## 手順 5 — 検体の一覧

`~/s1000d-stack-eval` は開始時に無かった。`fixtures/incoming/` と `csdb/` は、報告書を書いた時点でも無い。ファイルは 0 件で、バイト数と md5 は取れない。

このセッションで作ったのは次だけ。

| パス | 役割 |
| --- | --- |
| `~/s1000d-stack-eval/reports/SETUP.md` | この報告書 |
| `~/s1000d-stack-eval/work/SETUP/smoke-draft.json` | `build_data_module` に渡した引数 |
| `~/s1000d-stack-eval/work/SETUP/smoke-verification.json` | 応答のうち判断に使った項目。XML は入れていない |

## 手順 6 — このホストでは測れない項目

1. MCP の `initialize` が返す `serverInfo` そのもの。版は、プロセスの `package.json` と `npm view` で見ている。
2. DeepL の MCP。`grok inspect` の `mcpServers` に無い。
3. 作業場の `csdb/` にある BREX 2 件の一覧。フォルダーが無く、`list_data_modules` は件数の前に失敗した。
4. `fixtures/incoming/` のファイル名、バイト数、md5。フォルダーが無い。
5. xcomet は接続されている（plugin `xcomet-mcp` 0.7.0、`~/.claude/plugins/cache/shuji-bonji/xcomet-mcp/0.7.0`）。この SETUP では呼んでいない。

`grok inspect` の `projectInstructions` は空配列だった。cwd が製品リポジトリのためで、作業場の `AGENTS.md` はプロジェクト指示として読まれていない。キットの `AGENTS.md` と `00-grok-build-setup.md` は、こちらでファイルを開いて読んだ。

同じ理由で、キットの `README.md`（作業場に置かない、と書いてあるファイル）も開いている。そこには依頼者の控え（UC ごとの期待する動き）がある。貼られた 2026-10-28 の依頼書にも、作った側の期待が書いてあった。このセッションは、その両方を見た状態でスモークを行った。UC をこのセッションの続きで行うと、その期待を見たあとの操作になる。

## 迷った箇所と、自分で決めたこと

| 迷った箇所 | 決めたこと | 根拠 |
| --- | --- | --- |
| 貼られた文書は T1〜T10 を順に行う形で、注記はキットの手順 1〜6 で止まる形だった | キットの最初のセッションとして SETUP だけを行い、UC01 には進まない | 注記が「以下は 2026-10-28 時点の版で、記録として残しています」と書いていた。キットの開始プロンプトが `reports/SETUP.md` のあとで止まる、と書いていた |
| 作業場と `csdbDirs` が無い。設定を足すか | 設定ファイルは書き換えない。`csdb/` と検体はコピーしない。`reports/` と `work/SETUP/` だけ作る | 手順書が「足りないものを自分で入れたり、設定ファイルを書き換えたりしない」と書いていた。この設定ファイルは他のホストの s1000d 系サーバーも読む |
| 既定 BREX の概要を `list_notations` と `explain_brex` のどちらで取るか | `explain_brex` を `limit: 1` で 1 回 | ツール説明が、header（DMC、親 BREX、件数）を返すと書いていた。説明が、絞りなしの既定 BREX は規則が数百件になる、とも書いていた |
| スモークの採番、情報コード、機密区分 | `modelIdentCode` `SMOKE`、`systemDiffCode` `A`、SNS `00-0-0-00`、情報コード `040` / バリアント `A`、`itemLocationCode` `A`、企業コード `SMOKE`、`securityClassification` `"01"`、言語 `ja-JP`、`sourceId` `smoke-setup` | 手順は題名と段落だけを指定している。`040` は reader の `list_data_modules` の `filter.infoCode` の説明例（description）を使った。機密区分は inputSchema が文字列必須で、許可値の列挙は無かった。`01` はこちらの試用値 |
| `applic` を付けるか | 付けない。失敗しても 2 回目は呼ばない | inputSchema は `applic` を必須にしていない。手順はサーバーごとに 1 回で、失敗しても次へ進む、と書いていた |
| `fixes[]` の `several`（4 候補）をどれにするか | 選ばない | この手順の目的は `verification` を見ること。`_notes` は候補の中から選ぶ、と書いていて、候補は 4 つだった |
| 応答の XML と、既定 BREX の `commonInfo`・規則の `objectUse` を報告書に残すか | 残さない。DMC、件数、ファイル名、`verification` の state、`_notes` の運用文だけを残す | 作業規則が、配布物の本文を報告書に写さない、と書いていた |

## 予想外だった応答

1. `list_data_modules` の失敗は、文字列の `error` だけだった。`error.code` は無い。writer の説明は、形の悪い下書きを `error.code` `"input-error"` と `path` で返す、と書いている。reader のこの失敗は、その形ではなかった。
2. writer の最後の `_notes` は「References cannot be resolved」と書いている。同じ応答の `references.state` は `resolved`、`checked` は 1、`unresolvedCount` は 0。調べた 1 件は、`_notes` がパスを書いている既定 BREX への `brexDmRef` だと思う。CSDB が無いことと、この 1 件が解決したことは、同じ応答の中で言い方が違っている。
3. XSD のエラーは `brexDmRef` がここでは期待されない、期待されるのは `applicCrossRefTableRef`、`applic`、`applicRef` のどれか、だった。`_notes` は、付けなかったのは `applic` で、スキーマは `applic` か `applicRef` を要求する、と書いている。`fixes[]` の候補には `brexDmRef` を消す、と `applicCrossRefTableRef` に置き換える、も入っている。`confidence` は `several` のままなので、こちらでは選んでいない。
4. verify の plugin 説明はツールを 5 本と書き、接続されているのは 7 本だった（手順 1 の表）。

## 次に人が行うこと

UC01 に進む前に、キットの事前準備（作業場の作成、`config.json` への `csdbDirs` の追加、`csdb/` と `fixtures/incoming/` の配置）が済んでいるかを確認する。設定ファイルを変えると、環境変数を渡していない他の s1000d 系サーバーも読む。試用のあと、元の内容に戻す対象になる。

UC を、このセッションの続きではなく、作業場を cwd にした新しいセッションで始めると、`AGENTS.md` がプロジェクト指示になり、この報告書に書いた「期待する動きを既に読んだ」状態を切り離せる。
