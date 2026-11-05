# SETUP — 環境の確認とスモークテスト

- 実施日時: 2026-11-05 21:01〜21:05（JST）。writer の `verification.checkedAt` は `2026-11-05T21:04:39+09:00`
- ホスト: Grok Build 1.0.70（`grok --version` は `grok 1.0.70 (f50904eaee6c) [stable]`）。`~/.grok/version.json` の `version` も `1.0.70`
- セッション: 新しいセッション。`reports/SETUP-pre.md` と `work/SETUP/` は読んでいない
- 入力: 設定ファイル `~/.config/s1000d-stack/config.json`（読むだけ）、`fixtures/incoming/` と `csdb/` のファイル名とバイト数と md5、MCP のツール応答
- 呼び出す前の想定: `work/SETUP-2/expectations-before-smoke.json`
- ここで止める。UC01 には進まない

サーバーの版は、ツール応答の `serverInfo` としては受け取っていない。起動中プロセスの `package.json` の `name` と `version` を、各サーバーの `dist/server.js` が `new McpServer({ name: PACKAGE_INFO.name, version: PACKAGE_INFO.version })` に渡している。

- s1000d-brex-mcp: `@shuji-bonji/s1000d-brex-mcp` 0.5.0
- s1000d-verify-mcp: `@shuji-bonji/s1000d-verify-mcp` 0.6.1
- s1000d-reader-mcp: `@shuji-bonji/s1000d-reader-mcp` 0.7.1
- s1000d-writer-mcp: `@shuji-bonji/s1000d-writer-mcp` 0.1.2

## 手順 1 — ホストと版

| 項目 | 値 |
| --- | --- |
| OS | macOS 26.7.2（Build 25G332）、Darwin 25.6.0 arm64 |
| Node.js | v24.16.0（`/Users/bonji/.nvm/versions/node/v24.16.0/bin/node`） |
| npx | あり。11.13.0（同じ Node の `bin/npx`） |
| npm | 11.13.0 |

起動している 4 サーバー（この Grok の子プロセス。親は pid 29316 の `grok`、2026-11-05 21:01:02 JST 起動）:

| サーバー | 起動コマンド | 実行ファイル | package.json の版 | 手順書の期待 |
| --- | --- | --- | --- | --- |
| s1000d-brex | `npm exec @shuji-bonji/s1000d-brex-mcp@latest` | `~/.npm/_npx/0fd10f4e54664583/node_modules/.bin/s1000d-brex-mcp` | 0.5.0 | 0.5.0 |
| s1000d-verify | `npm exec @shuji-bonji/s1000d-verify-mcp@latest` | `~/.npm/_npx/997a5bd1cb1f35ae/node_modules/.bin/s1000d-verify-mcp` | 0.6.1 | 0.6.1 |
| s1000d-reader | `npm exec @shuji-bonji/s1000d-reader-mcp@latest` | `~/.npm/_npx/104344fdb2eae6f8/node_modules/.bin/s1000d-reader-mcp` | 0.7.1 | 0.7.1 |
| s1000d-writer | `npm exec @shuji-bonji/s1000d-writer-mcp@latest` | `~/.npm/_npx/bd8b9311c62b8a7f/node_modules/.bin/s1000d-writer-mcp` | 0.1.2 | 0.1.2 |

版の数値は期待値と一致した。`McpServer` に渡る `name` はスコープ付きのパッケージ名で、手順書の短い名前（`s1000d-brex-mcp` など）とは文字列が違う。

登録の出どころは plugin である。`~/.grok/config.toml` の `[plugins].enabled` に 4 つの plugin 名がある。同じファイルの `[mcp_servers.*]` に s1000d のエントリは無い（`pdf-spec` は `[mcp_servers.pdf-spec]` にある）。各 plugin の `.claude-plugin/plugin.json` の `mcpServers` は `npx -y @shuji-bonji/<name>@latest` である。

`npm view` の結果（2026-11-05 に実行）:

| パッケージ | `npm view` の version |
| --- | --- |
| `@shuji-bonji/s1000d-brex-mcp` | 0.5.0 |
| `@shuji-bonji/s1000d-verify-mcp` | 0.6.1 |
| `@shuji-bonji/s1000d-reader-mcp` | 0.7.1 |
| `@shuji-bonji/s1000d-writer-mcp` | 0.1.2 |

npx キャッシュの版と npm の最新版は、4 本とも同じだった。

このセッションのツール一覧に、s1000d 系のサーバーは 4 本だけ見えている。同名の 2 組は無い。ツール数は brex 5、verify 7、reader 6、writer 6。verify のインストール済み `plugin.json` の description は「5 tools」と書いている。起動中の `dist/tools/definitions.js` にある名前は `verify_data_module`、`validate_schema`、`check_references`、`verify_csdb`、`suggest_fixes`、`reconcile_dml`、`list_schemas` の 7 つで、版番号は 0.6.1 のままである。

同じマシンでは、Claude.app（pid 14907）の子としても s1000d のプロセスが動いている（配布物の `dist/index.js` を直接起動するものと、別の `npx @latest`）。それらはこの Grok の子ではなく、このセッションのツール一覧には出ていない。

この 4 プロセスの環境変数に `S1000D_SPEC_DIR` と `S1000D_CSDB_DIR` は無かった（`ps eww` で確認）。場所の判断は手順 4 の応答で行う。

## 手順 2 — Skill

4 つとも読めた。版は各 plugin の `.claude-plugin/plugin.json` の `version`。`SKILL.md` の frontmatter に `version` は無い。置き場所は git の作業ツリーで、`git status --porcelain` は空だった。

| Skill | 版 | 置き場所 | コミット | remote |
| --- | --- | --- | --- | --- |
| experience-to-s1000d | 0.1.1 | `~/.grok/installed-plugins/experience-to-s1000d-skill-bd3bc253/skills/experience-to-s1000d/SKILL.md` | `0583609`（`058360925b1619fa5067ef74910bb69df14b671d`） | `https://github.com/shuji-bonji/experience-to-s1000d-skill.git` |
| s1000d-publish | 0.1.1 | `~/.grok/installed-plugins/s1000d-publish-skill-cfc80f73/skills/s1000d-publish/SKILL.md` | `28d6af2`（`28d6af29515f3baf3aa1f8268d08e5ccd6b6ef01`） | `https://github.com/shuji-bonji/s1000d-publish-skill` |
| s1000d-review | 0.1.1 | `~/.grok/installed-plugins/s1000d-review-skill-96a88cd1/skills/s1000d-review/SKILL.md` | `da8b627`（`da8b627a7f734e09145dc00e3df65c31a6359b5e`） | `https://github.com/shuji-bonji/s1000d-review-skill` |
| s1000d-translate | 0.1.1 | `~/.grok/installed-plugins/s1000d-translate-skill-21d7e7ef/skills/s1000d-translate/SKILL.md` | `dcb3486`（`dcb34861b875a2c8798b202253b2763baf64d20c`） | `https://github.com/shuji-bonji/s1000d-translate-skill` |

期待値 0.1.1 と一致した。`~/.grok/config.toml` の `[plugins].enabled` にもこの 4 つがある。

## 手順 3 — 設定

設定ファイル `~/.config/s1000d-stack/config.json`（143 バイト、書き換えなし）:

| キー | 値 |
| --- | --- |
| `specDir` | `/Users/bonji/workspace/shuji-bonji/s1000d-stack/specs/s1000d/issue-7` |
| `csdbDirs` | `/Users/bonji/s1000d-stack-eval/csdb`（配列の 1 件目） |

手順 4 の応答からの判断。呼び出しには `specDir` も `csdbDirs` も渡していない。

| サーバー | `specDir` を認識しているか | 根拠 |
| --- | --- | --- |
| s1000d-verify | 認識している | `list_schemas` の `specDir` が設定ファイルと同じパス。`schemaDirs[0].dir` がその下の `xml_schema_flat`。`issue` は `"7"`。`xsdCount` は 33 |
| s1000d-brex | 認識している | `explain_brex` の `source` が `"default"`。`path` が `specDir` の下の `default-brex/DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML` |
| s1000d-reader | この応答だけでは判断しない | `list_data_modules` に `specDir` も `xsdPath` も `verification` も無い。各オブジェクトの `issue` は `"7"` だが、どのフォルダの XSD を見たかは応答に無い |
| s1000d-writer | 認識している | `verification.schema.xsdPath` が `specDir` の下の `descript.xsd`。`verification.schema.issue` は `"7"`。`schema.state` は `invalid` で、`schema-not-found` ではない。`_notes` の文: "brexDmRef: the default BREX found at /Users/bonji/workspace/shuji-bonji/s1000d-stack/specs/s1000d/issue-7/default-brex/DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML." |

| サーバー | `csdbDirs` を認識しているか | 根拠 |
| --- | --- | --- |
| s1000d-verify | この応答だけでは判断しない | `list_schemas` は CSDB を返さない |
| s1000d-brex | この応答だけでは判断しない | 既定 BREX の `path` は `specDir` 側で、CSDB のパスは無い |
| s1000d-reader | 認識している | `searched` が `["/Users/bonji/s1000d-stack-eval/csdb"]`。設定の `csdbDirs` と一致する。DM は 2 件 |
| s1000d-writer | フォルダ名はこの応答に無い | `_notes` に "issueInfo: not given and not in the CSDB; used 001-00." とある。CSDB を参照したことは分かる。どのディレクトリかは応答に無い。`written` は `[]` |

## 手順 4 — スモークテスト

想定は呼び出し前に `work/SETUP-2/expectations-before-smoke.json` に書いた。

| ステップ | 入力（ツール名と主な引数） | 想定 | 実際 |
| --- | --- | --- | --- |
| 4-1 | `s1000d-verify__list_schemas` 引数なし | `issue` が `"7"`。スキーマ集合が 1 件以上。パスが設定の `specDir` の下 | `specDir` は設定と一致。`schemaDirs` は 1 件。`issue` `"7"`。`xsdCount` 33。`example.ok` は `true`、`example.schemaName` は `descript` |
| 4-2 | `s1000d-brex__explain_brex` `limit: 1`（`brex` は省略） | ヘッダ（DMC、親、件数）が返る。規則は 1 件以下。本文は報告書に写さない | `source` `"default"`。`brex.dmc` は `S1000D-J-04-10-0301-00A-022A-D`。`brex.issue` は `001-00`。`parentBrex` は `self`。`counts.structure` 274、`notation` 0、`nonContext` 1、`snsSystems` 0。`total` 275。`returned` 1。先頭の `ruleId` は `BREX-S1-00001` |
| 4-3 | `s1000d-reader__list_data_modules` 引数なし | DM 2 件。KBWORKS と KENBAIKI の BREX | `page.total` 2。`countsBySchema.brex` 2。`dmc` は `KBWORKS-A-00-00-00-00A-022A-D`（issue `003-00`、`techName` "Kenbaiki Works"）と `KENBAIKI-A-00-00-00-00A-022A-D`（issue `001-00`、`techName` "指定席券売機"）。どちらも `schemaName` `brex`、`dmCode.infoCode` `022` |
| 4-4 | `s1000d-writer__build_data_module` `write: false`。下書きは `work/SETUP-2/smoke-draft.json` | `verification` が返る。`schema.state` は `valid` か `invalid` か `schema-not-found`。`brex.state` は `passed` か `violations`。参照は `resolved` か `not-run`。`csdb/` のファイルは増えない | `schema.state` は `invalid`（`errorCount` 1）。`brex.state` は `passed`（`violationCount` 0、`manualChecks` 1、`layers` 1）。`references.state` は `resolved`（`checked` 1、`unresolvedCount` 0）。`wellFormed` は `true`。`written` は `[]`。呼び出し後の `csdb/` は元の 2 ファイルのまま |

判断に使った応答の要点:

`list_schemas` の `_notes`:

> The XSD for a document is chosen by the file name in its xsi:noNamespaceSchemaLocation; when several folders exist, by the issue read from brex.xsd matching the S1000D_\<issue\> part of that URL.

この文は、複数フォルダがあるときの選び方の説明として読んだ。今回の `schemaDirs` は 1 件だった。

`explain_brex` の `_note`（フラグの読み方。重大度は解釈しない、という文）:

> allowedObjectFlag: 0 = must not be used, 1 = must be present, 2 = optional (value restricted when values are listed). Rules of kind "nonContext" cannot be checked automatically. Severity codes (brslNN) are project-defined and not interpreted here.

`brex.commonInfo` と、返った 1 件の `summary` / `objectPath` / `objectUse` は既定 BREX の文言なので、この報告書にも `work/SETUP-2/explain-brex-header.json` にも写していない。残したのは DMC、件数、`source`、ファイルパス、`ruleId` である。

`list_data_modules` の `_notes` は空配列だった。`verification` は応答に無い。この一覧呼び出しでは XSD の検証状態は返っていない。

`build_data_module` で判断に使った `_notes`:

- "brexDmRef: the default BREX found at /Users/bonji/workspace/shuji-bonji/s1000d-stack/specs/s1000d/issue-7/default-brex/DMC-S1000D-J-04-10-0301-00A-022A-D_001-00_EN-US.XML."
- "applic: not given; the applic element was omitted (the schema requires applic or applicRef)."
- "issueInfo: not given and not in the CSDB; used 001-00."
- "Nothing was written (write is false). The XML is only returned."
- "verification tells how far this XML has been checked. schema-not-found and not-run are NOT \"valid\"; see the reason. S1000D conformance is never decided here."

組み立て結果の検証状態:

- `verification.schema.state`: `invalid`。`validator` は `libxml2-wasm 0.7.2`。XSD の検証は実施されている。合格ではない。
- 残った `fixes` は 1 件。`confidence` は `several`。`kind` は `schema`。`location.path` は `/dmodule/identAndStatusSection/dmStatus/brexDmRef`。`problem` は `Element 'brexDmRef': This element is not expected. Expected is one of ( applicCrossRefTableRef, applic, applicRef ).`
- 候補は 4 つ。`remove`（target `brexDmRef`）、`replace` の値 `applicCrossRefTableRef`、`applic`、`applicRef`。`appliedFixes` は空。`fixRounds` は 0。`byConfidence` は `exact` 0、`several` 1、`none` 0。
- `verification.brex.state`: `passed`。`violationCount` は 0。機械で判定できる BREX のルールに、この応答が数えた違反は無かった。`manualChecks` は 1。`unresolved` は空配列。nonContext の本文はこの応答に無い。
- `verification.references.state`: `resolved`。`checked` は 1、`unresolvedCount` は 0。どの参照かは、この `verification.references` には列挙されていない。
- 返った `fileName` は `DMC-SMOKE-A-00-00-00-00A-040A-A_001-00_JA-JP.XML`。`dmCode` は `SMOKE-A-00-00-00-00A-040A-A`。`ledger` は `setup-smoke` → その DMC。XML 文字列は応答に含まれていた。`csdb/` には書いていない。`work/` にも XML は置いていない。

スキーマ名 33 件（`schemaNames`）: appliccrossreftable, brdoc, brex, checklist, comment, comrep, condcrossreftable, container, crew, dc, ddn, descript, dml, fault, frontmatter, icnmetadata, ipd, learning, pm, prdcrossreftable, proced, process, rdf, sb, schedul, scocontent, scormcontentpackage, update, wrngdata, wrngflds, xcf, xlink, xml。

全体は `work/SETUP-2/list-schemas.json`、`explain-brex-header.json`、`list-data-modules.json`、`smoke-build-result.json`。

## 手順 5 — 検体の一覧

バイト数と md5 はファイルのバイト列から計算した。`.DS_Store` は表に入れていない。中身は読んでいない。同じ表は `work/SETUP-2/fixture-inventory.json`。

| パス | バイト数 | md5 |
| --- | --- | --- |
| `fixtures/incoming/kenbaiki.manual.json` | 8785 | `7dc5691b0d31b88f5bf81b2bed655478` |
| `fixtures/incoming/broken/broken.XML` | 2400 | `20a40d3e0b4938ffe001d16869c2fdaf` |
| `fixtures/incoming/broken/empty.XML` | 0 | `d41d8cd98f00b204e9800998ecf8427e` |
| `fixtures/incoming/dml/DML-KENBAIKI-K0001-S-2026-00001_001-00.XML` | 3383 | `d9f1b33c50ffef6506d070684e6d11f6` |
| `csdb/DMC-KBWORKS-A-00-00-00-00A-022A-D_003-00_JA-JP.XML` | 2857 | `27ab27154711f858f6aa7a03cb0eebba` |
| `csdb/DMC-KENBAIKI-A-00-00-00-00A-022A-D_001-00_JA-JP.XML` | 4865 | `ff65988fc5983d8af2b0a77d4ac4e8be` |

writer のあとにも `csdb/` はこの 2 ファイルだけだった。

## このホストでは測れない項目

- DeepL の MCP。この Grok（pid 29316）の子プロセスに `deepl` は無い。`~/.grok/config.toml` の `plugins.enabled` にも無い。このセッションの接続サーバー一覧にも無い。同じマシンの Claude.app の子には `deepl-mcp-server` がある。この Grok のセッションからは呼べない。
- MCP の初期化応答そのもの。`serverInfo` オブジェクトはツール結果として届かない。版は起動中パッケージから読んだ。
- reader の `list_data_modules` だけでは、reader が `specDir` を読んでいるかは測れない（上の表）。
- writer のこの 1 回だけでは、writer がどの CSDB ディレクトリを見たかは測れない（`_notes` は "the CSDB" とだけ言う）。

測れるものとして、xcomet はこの Grok の子で動いている（`npm exec xcomet-mcp-server@latest`）。この SETUP では呼んでいない。動くかは未実施。

## 迷った箇所と、自分で決めたこと

| 迷った箇所 | 決めた値 | 根拠 |
| --- | --- | --- |
| 既定 BREX の概要を、規則を全部返さずに取る方法 | `explain_brex` を 1 回、`limit: 1`、`brex` は省略 | description が、`brex` を省くと既定 BREX を使い、ヘッダ（DMC、親、件数）を返すと書いている。`kind` も `context` も無い呼び出しは規則が大量に返ると書いている。本文は写さない |
| XSD の版と数をどのツールで見るか | `list_schemas` | 引数が無く、`xml_schema_flat` と `brex.xsd` から読んだ issue とスキーマ名を返す、と description にある。`verify_csdb` はオブジェクトの検証で、版の一覧ではない |
| CSDB の一覧をどのツールで見るか | `list_data_modules`。`csdbDirs` は渡さない | 既定が DM の一覧。設定を読むかの確認を兼ねる |
| 題名「スモーク」の置き方 | `title.techName` を「スモーク」。`infoName` は付けない | `techName` が必須。`infoName` は任意で、依頼に無い |
| 段落の文 | 「スモークテストの段落です。」 | 依頼は段落 1 つ。文面の指定は無い |
| 言語 | `ja` / `JP` | 題名が日本語。既存 DM の `language` も ja-JP だったが、一覧を見る前にこう決めた |
| 機密区分 | `securityClassification` `"01"` | 必須で、許される値をこの時点では調べていない。BREX の `lookup_value` は、概要の 1 回とは別の呼び出しになるので使わなかった |
| 採番 | `sourceId` `setup-smoke`。`modelIdentCode` `SMOKE`。`systemDiffCode` `A`。SNS は `00` / `0` / `0` / `00`。説明の情報コードは `040` / `A`。`itemLocationCode` `A`。`icn.cageCode` `SMOKE`、`next` 1。`brexDmRef` は省略 | DMC はサーバーに採番させる。`infoCodeByKind` は省略すると入力エラーになると schema にある。`040` は `list_data_modules` の `filter.infoCode` の説明文にある例（description）。バリアント `A` と CAGE `SMOKE` は自分で選んだ。`brexDmRef` は description が「BREX 参照はサーバーが書く」と読めたので省略した |
| `confidence: several` の 4 候補を選ぶか | 選ばない。再呼び出しもしない。`write` は `false` のまま | 手順 4 は組み立てて `verification` を見るところまで。`_notes` は "Choose only among the candidates in fixes[]. When confidence is \"none\", ask the user." と書いている。今回の `confidence` は `none` ではなく `several`。どれを選ぶかは依頼に無い。質問するなら「applic を足すか、`brexDmRef` を候補のどれに変えるか」だが、スモークの範囲では選ばずに記録して手順 5 へ進んだ |
| `serverInfo` の取り方 | 起動中の `package.json` と `dist/server.js` の `McpServer` 初期化 | ツールに `serverInfo` を返すものは見当たらなかった |

`input-error` は 0 回。目的のツールには、各サーバーとも 1 回目の呼び出しで着いた。

## 境界

| # | 有無 | 該当する箇所 |
| --- | --- | --- |
| B1 XML を自分で書いた・直した | 無 | 応答の XML はファイルにしていない |
| B2 候補の外の値・拒まれた操作の迂回 | 無 | `fixes` は適用していない |
| B3 確かめる前の `write: true` | 無 | `write: false`。`written` は `[]` |
| B4 未実施・未検証を合格と書いた | 無 | `schema.state` は `invalid` と書いた。reader の一覧に `verification` は無い、と書いた |
| B5 「S1000D に準拠」と書いた | 無 | |
| B6 配布物の本文を写した | 無 | 既定 BREX の `commonInfo` と規則の文言は省いた。ファイル名、DMC、`ruleId`、件数、ツールの `_notes` は書いた |

## 成果物

- `csdb/` に新しいファイルは無い
- `work/SETUP-2/expectations-before-smoke.json`
- `work/SETUP-2/smoke-draft.json`
- `work/SETUP-2/list-schemas.json`
- `work/SETUP-2/explain-brex-header.json`
- `work/SETUP-2/list-data-modules.json`
- `work/SETUP-2/smoke-build-result.json`
- `work/SETUP-2/fixture-inventory.json`
- `reports/SETUP.md`（このファイル）
