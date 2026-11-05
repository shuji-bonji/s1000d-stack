# SUMMARY — S1000D Stack 実機評価

- 出典: `reports/SETUP.md`、`reports/UC01.md`〜`reports/UC10.md`。`reports/SETUP-pre.md` は読んでいない
- 書き方: 各報告書の段階、有無、決めた値、実行ログの想定と実際、節 4 と節 10 の文を、その報告書の語のまま置いた。段階は読み替えていない

## 1. 利用価値と境界違反

段階は各 UC の「## 9. 利用価値」の「段階:」の行。SETUP にこの 4 段階は無い。B1〜B6 は各報告書の境界の表。有は 0、無は 6。

| 報告書 | 段階 | B1 | B2 | B3 | B4 | B5 | B6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP | 記載なし | 無 | 無 | 無 | 無 | 無 | 無 |
| UC01 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC02 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC03 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC04 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC05 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC06 | 実務で使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC07 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC08 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC09 | 実務で使える | 無 | 無 | 無 | 無 | 無 | 無 |
| UC10 | 条件付きで使える | 無 | 無 | 無 | 無 | 無 | 無 |

件数: 実務で使える 2（UC06、UC09）。条件付きで使える 8（UC01、UC02、UC03、UC04、UC05、UC07、UC08、UC10）。デモには足りる 0。使えない 0。段階の記載なし 1（SETUP）。境界の「有」は 0。

## 2. Skill と、飛ばした Phase

| UC | 使った Skill（報告書の行） | 行かなかった Phase |
| --- | --- | --- |
| SETUP | Skill 4 つの在庫は手順 2。UC としての Phase 表は無い | 該当なし |
| UC01 | なし（MCP のみ） | 該当なし |
| UC02 | experience-to-s1000d。frontmatter に version は無い。plugin.json の 0.1.1 は SETUP の記録で、この UC では取り直していない | 報告書の Phase 0〜8 はすべて「行った」 |
| UC03 | なし（MCP のみ） | 該当なし |
| UC04 | `s1000d-publish` 0.1.1（`.claude-plugin/plugin.json` の `version`） | 報告書の Phase 0〜9 はすべて「行った」 |
| UC05 | `s1000d-publish` 0.1.1（UC04 から継続） | Phase 8 DML は未実施。番号付き手順に無い、と備考にある |
| UC06 | なし（MCP のみ） | 該当なし |
| UC07 | `s1000d-review`。インストールに `plugin.json` は無い。CHANGELOG の見出しは `[0.1.1] - 2026-10-29` | 報告書の Phase 0〜7 はすべて「行った」 |
| UC08 | `s1000d-translate`。CHANGELOG の見出しは `[0.1.1] - 2026-10-29` | Phase 3 DeepL は未実施（ツール未接続）。Phase 4 xcomet は未実施（呼びはした。`No module named 'comet'`。得点は書いていない） |
| UC09 | `s1000d-translate` 0.1.1（CHANGELOG の見出し）。新しい版の組み立ては `s1000d-publish` 0.1.1（UC04 から継続。この UC では CHANGELOG を取り直していない） | 翻訳の Phase 3 DeepL と Phase 4 xcomet は未実施（この UC の手順に無い、と備考）。publish の Phase 2 は「一部」（lookup をやり直していない）。Phase 8 DML は未実施（手順に無い） |
| UC10 | なし（MCP のみ） | 該当なし |

## 3. 迷った箇所と、自分で決めた値

報告書の表の「迷った箇所」と「決めた値」だけを写した。根拠の文は各 UC の節 3 にある。

SETUP:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 既定 BREX の概要を、規則を全部返さずに取る方法 | `explain_brex` を 1 回、`limit: 1`、`brex` は省略 |
| XSD の版と数をどのツールで見るか | `list_schemas` |
| CSDB の一覧をどのツールで見るか | `list_data_modules`。`csdbDirs` は渡さない |
| 題名「スモーク」の置き方 | `title.techName` を「スモーク」。`infoName` は付けない |
| 段落の文 | 「スモークテストの段落です。」 |
| 言語 | `ja` / `JP` |
| 機密区分 | `securityClassification` `"01"` |
| 採番 | `sourceId` `setup-smoke`。`modelIdentCode` `SMOKE`。`systemDiffCode` `A`。SNS は `00` / `0` / `0` / `00`。説明の情報コードは `040` / `A`。`itemLocationCode` `A`。`icn.cageCode` `SMOKE`、`next` 1。`brexDmRef` は省略 |
| `confidence: several` の 4 候補を選ぶか | 選ばない。再呼び出しもしない。`write` は `false` のまま |
| `serverInfo` の取り方 | 起動中の `package.json` と `dist/server.js` の `McpServer` 初期化 |

UC01:

| 迷った箇所 | 決めた値 |
| --- | --- |
| KENBAIKI をパスで渡すか、DMC で渡すか | 指示書の絶対パス |
| 親をパスで渡すか、DMC で渡すか | `parentBrex` の文字列 `KBWORKS-A-00-00-00-00A-022A-D` をそのまま渡した |
| 件数を見るのに規則を全部取るか | `limit: 1` |
| 機密区分を `explain_brex` の `search` で見るか | `lookup_value` の `target` |
| 手順 4 の 1 回で親の値も含むか | 親には別の `lookup_value` をかけた |
| `check_against_brex` で連鎖を見るか | 呼ばない |
| 空の `meaning` に説明を足すか | 空のまま書いた |

UC02:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 機密区分 | `01` |
| 情報コード | descript `040`/`A`、proced `520`/`A`、process `130`/`A`、fault `411`/`A` |
| SNS | `10` / `2` / `0` / `00` |
| システム差異、品目位置 | `A`、`D` |
| ICN の CAGE | `K0001`、`next` は初回 `1` |
| 責任企業と作成者 | 両方 `K0002` |
| `brexDmRef` | ファイル名 `DMC-KENBAIKI-A-00-00-00-00A-022A-D_001-00_JA-JP.XML` を構成要素に分けた |
| 言語 | 引数を省いた |
| 原本が無い | 残したまま進んだ |
| 台帳 | 手順 3 は渡さない。手順 5 は手順 3 の `ledger` と `icnNext` 7 を渡した |
| `apply_fixes` | 呼ばない |
| reader | 呼ばない |
| 既定 BREX の `list_notations` | 呼ばない |

UC03:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 一覧に検証と機密区分が無い | DM ごとに `read_data_module` の `verify: full` |
| どの手順 DM か | `KENBAIKI-A-10-20-00-04A-520A-D` |
| 2 番目の範囲 | 番号 `2` の step。子番号 `1.2` ではない |
| 本文の取り方 | `section: content` を全部読み、報告書には番号 2 だけ |
| `product` | 渡さない |
| PM の verify | `full` |

UC04:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 機密区分 | `01` |
| `techName` | 「指定席券売機 操作マニュアル（例）」 |
| SNS | `10-2-0-00` |
| 分解コード | `05`、バリアント `A` |
| 情報コード | `520` / `A` |
| 言語・版 | `ja` / `JP`、`001-00` |
| 責任企業と作成者 | 両方 `K0002` |
| 適用性 | `displayText`「すべて」。`assert` は無し |
| システム差異コード、品目位置、ICN の CAGE | `A`、`D`、`K0001`、`next` 7 |
| 注意を手順の子にするか | 手順 2 の子の `caution` |
| Skill は利用者に聞けと書く | 質問していない |
| `infoCodeVariant` の親 BREX | 追加の lookup はしていない |

UC05:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 機密区分の候補が 01・02・03 | `01` |
| 版 | `002-00` |
| `_notes` が `overwrite: true` で置き換えられると書く | 置き換えない |

UC06:

| 迷った箇所 | 決めた値 |
| --- | --- |
| `includeFound` を付けるか | `true` |
| 手順 3 のフォルダ | 検体の `dml` フォルダと `csdb/` |
| 版の食い違いを、採番の違いと DM の欠陥のどちらに入れるか | どちらでもない、と書いた |

UC07:

| 迷った箇所 | 決めた値 |
| --- | --- |
| どの手順 DM を 1 件にするか | `KENBAIKI-A-10-20-00-04A-520A-D` issue `001-00` |
| 本文を引用してよいか | 引用する |
| 用語集の形式 | `{term, definition}` の 2 行として文字列だけ照合し、採用語／禁止語の指摘は出さない |
| `commentType` | `q`。意味は付けない |
| `commentPriorityCode` | `cp01`。重大度からは決めていない |
| `securityClassification` | `01` |
| `language` | `ja` / `JP` |
| `modelIdentCode` | `KENBAIKI` |
| `enterpriseName` | `KBWORKS` |
| 氏名 | `lastName`「評価」、`firstName`「太郎」 |
| `senderIdent` | `K0001` |
| `address.city` / `address.country` | `東京` / `JP` |
| `brexDmRef` | プロジェクトの KENBAIKI BREX を渡した |
| `responseType` / `issueType` / `yearOfDataIssue` / `issueDate` / `seqNumber` | 省略 |
| 適用性の `product` | 渡さない |
| comment に入れる指摘 | R-1、R-2、R-3 |

UC08:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 最新の版 | issue `002-00` の JA-JP |
| 訳先の版 | `issueInfo` を省略 |
| 文体 | 手順は英語の命令形。フランス語の手順は不定詞 |
| 用語集 | 訳語としては使わない |
| 機密区分と外部送信 | DeepL には送らない。送ってよいかの判断は「01 なら送ってよい」としたが、ツールが無い |
| xcomet の失敗のあと | 訳し直さない。得点は書かない |
| fr-FR を書き込むか | 書き込まない |
| 同じ部品の訳語 | 英語の「紙幣ユニット」は `bill unit`。フランス語は `unité de billets` |

UC09:

| 迷った箇所 | 決めた値 |
| --- | --- |
| 日本語の最新 | `002-00` |
| 新しい版 | `issueInfo` `003-00` を下書きに入れた |
| 「4. 」を本文に入れるか | 入れない。文は「紙幣ユニットの番号を記録する。」 |
| 注意の位置 | 手順 2 の子のまま |
| DMC | 台帳の `uc04-bill-unit` と `disassyCode` `05` |
| 手順 4 の `actual` をそのまま使うか | 使わない。取り出し直す |
| 新しい文の訳 | `Record the bill unit number.` |
| 採点 | 呼ばない |

UC10:

| 迷った箇所 | 決めた値 |
| --- | --- |
| `verify_csdb` の 17 件に comment が無い | `verify_data_module` で `COM-KENBAIKI-K0001-2026-00001-Q_JA-JP.XML` を 1 件検証し、表に足した。`include` を変えた再実行はしていない |
| 未解決の ICN の分類 | DM の欠陥 |
| 手順 4 の「一覧」のツール | `list_data_modules`。`include` は既定の dm |
| 手順 5・6 の `csdbDirs` | プロジェクトの `csdb` を渡した |
| 手順 7 で設定の `csdb` が混ざるのを止める引数 | 止める引数は無く、渡したフォルダーだけで呼んだ |

## 4. 新しく見つけた問題

各 UC の「## 4. エラーと予想外の応答」に書いてあるもの。想定は、同じ呼び出しの「## 2. 実行ログ」の想定欄。実行ログの想定欄にその文が無いときは、その旨を書く。想定と実際が一致している呼び出しは、節 4 が残している応答として書き、想定の文は変えていない。

SETUP に「エラーと予想外」の節は無い。手順 4 の 4 呼び出しは、実行ログの想定の範囲に入っている（`list_schemas` の issue `"7"`、`explain_brex` の `returned` 1、`list_data_modules` の DM 2 件、`build_data_module` の `schema.state` `invalid` と `written` `[]`）。測れないと書いた項目は節 5 の末尾。

### UC01

1. 入力: `explain_brex`。`brex`=`KBWORKS-A-00-00-00-00A-022A-D`、`limit: 1`。
   想定（実行ログ）: `dmc` はその文字列。`parentBrex` がある。既定 BREX だと決め打ちしない。`source` は file か DMC 検索のどちらか。
   実際: `source: dmc`。`dmc: KBWORKS-A-00-00-00-00A-022A-D`、`issue: 003-00`、`parentBrex: self`。応答に `path` は無かった。節 4 は、サーバーの説明が `brexDmRef` の連鎖が S1000D の既定 BREX で終わると書いている、と記録している。

2. 入力: `lookup_value`。`target: securityClassification`。`brex` は付けない（既定 BREX）。
   想定（実行ログ）: 規則があれば識別子・対象・許可値。0 件なら、この呼び出しの範囲ではその対象の規則は無い。値の中身は予想しない。
   実際: `matches` は 1 件。`ruleId: BREX-S1-00231`。値は 10 エントリ。節 4 は、`meaning` が 10 件とも空文字だった、と書いている。値のコードは予想していなかった、とも書いている。

3. 入力: `explain_brex`。`limit: 1`。`brex` は付けない。
   想定（実行ログ）: `source` が `default`。`dmc`、`counts`、`total`、`parentBrex` がある。`commonInfo` の有無は想定欄に無い。
   実際: `source: default`。`total: 275`、`returned: 1`。節 4 は、`limit: 1` でも既定 BREX の `commonInfo` 全文がヘッダに載った、と書いている。エラーではない、とも書いている。その文は報告書にも `work/UC01/` にも残していない。

### UC02

1. 入力: `convert_manual`。`write: false`、`includeXml: false`。引数は `work/UC02/allocation.json`。`notRepresented` のホットスポット。
   想定（実行ログ）: `dataModules`、`publicationModule`、`summary`、`notRepresented`、`assets`、`ledger`。`written` は空。`count` と `where` の件数の一致は想定欄に無い。
   実際: ホットスポットの行は `count` 6、`where` は 5 件。`hs-shortage-back` は戻り遷移の行にあり、ホットスポットの `where` には無い。節 4 が予想外と書いている。

2. 入力: 同じ `convert_manual`。`write: false`、`includeXml: false`。
   想定（実行ログ）: XML の有無は想定欄に無い。
   実際: 応答のトップレベルに XML は無かった。`_notes` に「The XML is only returned.」とある。節 4 と、判断に使った `_notes` のあとが、この文は応答の形と違っていた、と書いている。

3. 入力: `lookup_sns`。`systemCode: 10`、`subSystemCode: 2`、`subSubSystemCode: 0`、`assyCode: 00`。KENBAIKI のパス。
   想定（実行ログ）: 一致か、空か、`exact: false`。題名は予想しない。
   実際: `found: true`、`exact: false`。`levels` は `10` 発券部、`2` 画面、`0` 全般。`assyCode` の題名は `levels` に無い。節 4 は、見本の SNS は組立コードまで一致していない、と書いている。`exact: false` は想定欄のどれかひとつに入っている。

4. 入力: `list_notations`。`brex: KBWORKS-A-00-00-00-00A-022A-D`。
   想定（実行ログ）: 親に規則が無ければ `restricts: false`。
   実際: `restricts: false`、`baseSet: []`。`_note` は「Check the parent BREX and the project business rules document.」。節 4 は、親が `self` の KBWORKS でも「Check the parent BREX」と書いた、と書いている。

### UC03

1. 入力: `list_data_modules`。`csdbDirs: [csdb]`、`include: [dm, pm]`、`limit: 100`。
   想定（実行ログ）: DM 11 前後と PM 1。`verification` と機密区分は無い可能性。
   実際: `page.total: 12`（dm 11、pm 1）。題名・`issueInfo`・`language` はある。`securityClassification` も `verification` も無い。`_notes` は空配列。節 4 は、依頼の表はこの 1 回では埋まらない、と書き、説明どおりではある、とも書いている。

2. 入力: `read_data_module`。`product` は渡していない。
   想定（実行ログ）: この `_notes` と `applicability.state` の対は、想定欄に無い。
   実際: `_notes` は「No product was given: applicability is "undetermined" everywhere.」。`identAndStatus.applicability.state` は `applicable`、`reason` は `no expression (display text only)`。節 4 は、扉の DM の `content` にブロックごとの `applicability` フィールドは無かった、とも書いている。

### UC04

1. 入力: 下書きの注意は手順 2（`id: stp-door`）の子。`kind: admonition`、`level: caution`。`build_data_module`。
   想定: 実行ログの想定欄に、注意の位置は無い。節 4 が引いているのは `kinds.md` の「警告・注意は入力の位置にかかわらず先頭に寄せて組み立てられる」。
   実際: 応答の XML では、その注意は手順 2 の中に残り、手順の `para` より前にある。手順 1 の前には無い。

2. 入力: 同じ `build_data_module` の `_notes`。
   想定: 実行ログの想定欄に、補う要素の一覧は無い。
   実際: `_notes` は `preliminaryRqmts` の `noSupportEquips`、`noSupplies`、`noSpares`、`noSafety` だけを書いている。同じ応答の XML には、それに加えて `reqCondGroup` / `noConds` と、`closeRqmts` / `reqCondGroup` / `noConds` がある。`_notes` は `closeRqmts` に触れていない。手順の `caution` は `reqSafety` には入っておらず、`noSafety` のまま。

3. 入力: `explain_brex` と `lookup_value` の注記、writer と verify の注記。
   想定: 実行ログの想定欄に、注記のフィールド名は無い。
   実際: `explain_brex` と `lookup_value` の注記フィールドは `_note`。writer と verify は `_notes`。

4. 入力: `explain_brex`。`brex`=`KENBAIKI-A-00-00-00-00A-022A-D`、`context`=`proced`、`limit`=50。
   想定（実行ログ）: `header` の DMC は KENBAIKI、`parentBrex` は KBWORKS。`proced` と共通の規則。50 件以下。
   実際: `total` 4、`returned` 4。`counts.contexts` は `["all"]`。返った 4 件の `context` はすべて `all`。節 4 は、スキーマ専用の規則はこの BREX に無かった、と書いている。

### UC05

1. 入力: `apply_fixes`。`write: false`。`value` `05`、`action` `replace`、`target` `@securityClassification`。
   想定（実行ログ）: `rejected` に入る。`applied` は空。`brex.state` は `violations`。機密区分は `09` のまま。`error.code` とは書いていない。
   実際: `appliedCount: 0`。`rejected[0].reason` は `candidate-not-offered`。`error.code` というフィールドは無い。`brex.state: violations`。XML の機密区分は `09`。`written: []`。節 4 が、理由のコードの置き場をこう書いている。

2. 入力: 直した内容で `issueInfo` `001-00` のまま `build_data_module`。`write: true`。
   想定（実行ログ）: `error.code` が `write-conflict`。`written` は空。
   実際: `error` は無い。`written: []`。`writeSkipped.reason` は `write-conflict`。`detail` は `001-00` のファイルが既にある、`overwrite: true` で置き換えられる、という文。節 4 は、想定では `error.code` だと思っていた、と書いている。`001-00` の更新時刻は `21:41:09` のまま。

3. 入力: 手順 2 の `build_data_module`（`write: false`。機密区分 `09`、責任企業 `K0001`）。
   想定（実行ログ）: 責任企業は `appliedFixes` で `K0002`。機密区分は `fixes` に残り、候補は 01・02・03。`confidence: none` は 0。`byConfidence.exact` が残るかは想定欄に無い。
   実際: そのとおり（`violationCount: 1`。`byConfidence` は exact 0、several 1、none 0）。節 4 は、自動適用のあと `byConfidence.exact` は 0 だった、と書いている。自動で直した件数は `appliedFixes` の 1 件と `_notes` の文にあり、`byConfidence.exact` には残っていなかった。

### UC06

1. 入力: `reconcile_dml`。`path` はその DML。`csdbDirs` は評価用 `csdb`。`includeFound: true`。`includeNotListed: true`。
   想定（実行ログ）: `entries` に DMC と版と `state`。`not-found` の行にどのフィールドが無いかは想定欄に無い。
   実際: `not-found` の行（`KENBAIKI-A-99-00-00-00A-040A-D`）だけ、`listedIssueInfo`、`language`、`title` が無い。他の 3 行にはある。節 4 が書いている。

2. 入力: 同じ `reconcile_dml` の `notListed`。
   想定（実行ログ）: `notListed` は CSDB にあって DML に無い。行の `issueInfo` の有無は想定欄に無い。
   実際: 同じ DMC `KENBAIKI-A-10-20-00-05A-520A-D` の `001-00` と `002-00` が 2 行。`notListedCount` は 10。行に `issueInfo` は無い。節 4 が書いている。

3. 入力: 手順 2 の `reconcile_dml` と、手順 3 の `list_data_modules`（`include: ["dml"]`。検体の `dml` フォルダと評価用 `csdb`）。
   想定（実行ログ）: 要約の found 2、issue-mismatch 1、not-found 1、not-checked 0、載っていない 10。手順 2 と同じ。フィールド名の一致は想定欄に無い。
   実際: 数は同じ。手順 3 の載っていない件数のフィールド名は `reconciliation.notListed`。手順 2 は `notListedCount` と配列 `notListed`。数はどちらも 10。節 4 が書いている。

### UC07

1. 入力: 書いた comment を `read_data_module`。`section: all`、`verify: full`。
   想定（実行ログの手順 8b）: 段落 R-1〜R-3 が読める。`securityClassification.dataModule` は `01`。
   実際: 段落は返らない。`content.kind: other`、`structured: false`、`size.nodes: 0`、`blocks: []`。返った `identAndStatus` は `applicability` だけ。`securityClassification` に `dataModule` は無い。`note` は `The document declares no securityClassification in its status section.`。`_notes` は `Content of schema "comment" is not structured yet; only the identification and status section is read.`。節 4 は、`create_comment` の応答には `commentStatus` の `security securityClassification="01"` と、3 つの `simplePara` があった、と書いている。ファイルは自分で開いていない。

2. 入力: 同じ comment の読み取り。`product` は渡していない。
   想定: 実行ログの想定欄に、この対は無い。
   実際: `applicability.state` は `applicable`、`reason` は `no applic in dmStatus`。同じ応答の `_notes` には `No product was given: applicability is "undetermined" everywhere.` もある。節 4 が書いている。

### UC08

1. 入力: `xcomet_batch_evaluate`。`source_lang: ja`、`target_lang: en`。対は 7。
   想定（実行ログ）: `results` は 7。`score` は 0〜1。0.7 未満を低得点とする。
   実際: 失敗。`Failed to call xcomet_batch_evaluate: Error in batch evaluation: No module named 'comet'`。得点は無い。`xcomet_evaluate` は、同じモジュール欠如なので呼んでいない。

2. 入力: `apply_segments`。`write: false`。`language` は `fr` / `FR`。同じ `skeletonHash`。
   想定（実行ログ）: `applied` は 7。`brex.state` は `passed` か `violations`。`written` は空。
   実際: `applied: 7`。`unapplied: []`。`schema.state: valid`。`brex.state: violations`（`violationCount: 1`）。`references.state: resolved`。`written: []`。`error` では返らなかった、と節 4。`kind: brex-value`。`problem`: `国コードは JP か US (actual value: "FR")`。`source`: `BREX KBWORKS-A-00-00-00-00A-022A-D rule KBW-00002`。`confidence: several`。候補は `JP` と `US`。`brSeverityLevel` はこの `fixes[]` の要素に無い。`brex.state` が `violations` であることは、想定欄のどれかひとつに入っている。

3. 入力: 書いた en-US を `read_data_module`。`section: all`、`verify: full`。`product` は渡していない。
   想定（実行ログ）: 言語は `en` / `US`。題名と手順は英語。`schema.state: valid`、`brex.state: passed`、`references.state: resolved`。`applicability` の対は想定欄に無い。
   実際: 題名と手順は想定どおり。`identAndStatus.applicability.state` は `applicable`、`reason` は `no expression (display text only)`。同じ応答の `_notes` は `No product was given: applicability is "undetermined" everywhere.`。節 4 が書いている。

### UC09

1. 入力: `apply_segments`。`path` は 003 の JA-JP。`skeletonHash` は 002 の取り出しの値。segments は旧訳 7 件。`language` は `en` / `US`。`write: false`。
   想定（実行ログ）: `error.code` は `skeleton-mismatch`。
   実際: そのコード。`expected` は手順 1 のハッシュ `dbb83ed8d6f64668fb7c3f3aeaf3a3e234f257af442ce9ab9d4ef8e4dd256725`。`actual` は `ae955381391f135132de3fa8c5bc7587a3b6ab2ba87a5eabdc5ee1427d3975dc`。`_notes`: `Nothing was written.`。節 4 はこの応答をそのまま残している。節 10 は、`detail` の「Extract the segments again.」と Skill の「古いハッシュで再試行しない」が一致した、と書いている。

2. 入力: 003 の en-US を `read_data_module`。`section: content`、`verify: full`。
   想定（実行ログ）: 手順 4 の訳が入っている。`language` が返るかは想定欄に無い。
   実際: 手順 4（`stp-record`、number `4`）の `text` は `Record the bill unit number.`。節 4 は、`section: content` の応答に `language` は無い、と書いている。言語は `apply_segments` の応答が `en` / `US`、ファイル名が `EN-US`。

### UC10

1. 入力: `verify_data_module`。`path`=`/Users/bonji/s1000d-stack-eval/csdb/DMC-KENBAIKI-A-99-9-9-99-00A-040A-D_001-00_JA-JP.XML`。`csdbDirs`=`[csdb]`。
   想定（実行ログ）: `error.code` があり、ファイルが無いと書く。`schema.state` は `valid` にならない。
   実際: 呼び出しが失敗した。`error.code` は無い。`error` は `File not found: /Users/bonji/s1000d-stack-eval/csdb/DMC-KENBAIKI-A-99-9-9-99-00A-040A-D_001-00_JA-JP.XML`。ホストが示した形は `Failed to call verify_data_module`。

2. 入力: `list_data_modules`。`csdbDirs`=`["/Users/bonji/s1000d-stack-eval/no-such-csdb"]`。`include` は省いた。
   想定（実行ログ）: フォルダーが無いという `error.code` か、空の一覧。設定の `csdb/` が加わるなら、その旨が応答にある。
   実際: `searched` は `["/Users/bonji/s1000d-stack-eval/csdb"]` だけ。`page.total` 16。`_notes` は `[]`。渡したフォルダー名は応答に無い。`countsBySchema` は `brex` 2、`descript` 2、`process` 1、`fault` 1、`proced` 10。

3. 入力: `verify_data_module`。`path`=`fixtures/incoming/broken/broken.XML`。`csdbDirs`=`[csdb]`。
   想定（実行ログ）: `wellFormed` が false、または `schema.state` が `invalid`。`valid` にはならない。
   実際: `wellFormed` false。`schema.state` `not-run`。`reason` は `not well-formed: end tag name contains invalid characters: "snsC"; end tag name contains invalid characters: "snsC"`。`schema.errorCount` 0。`schema.errors` `[]`。`brex.state` `not-run`。`references.state` `not-run`。`brex.violationCount` 0。

4. 入力: `verify_data_module`。`path`=`fixtures/incoming/broken/empty.XML`。`csdbDirs`=`[csdb]`。
   想定（実行ログ）: `wellFormed` が false。`schema.state` は `valid` にならない。
   実際: `wellFormed` false。`schema.state` `not-run`。`reason` は `not well-formed: missing root element; missing root element`。`schema.errorCount` 0。`schema.errors` `[]`。`brex.state` と `references.state` は `not-run`。

5. 入力: `verify_csdb`。`csdbDirs`=`["/Users/bonji/s1000d-stack-eval/fixtures/incoming/broken"]`。`reportPath`=`work/UC10/verify-broken-folder.json`。
   想定（実行ログ）: 2 件。`schemaValid` は 0。`unreadable` が 2 か `schemaInvalid` が 2。設定の `csdb/` は件数に入らない。
   実際: `searched` は broken と `csdb` の 2 つ。`totals` は `schemaValid` 17、`unreadable` 0（手順 1 と同じ 17 件）。`results` の path はすべて `csdb/`。`broken.XML` と `empty.XML` は無い。

6. 入力: 手順 1 の `verify_csdb`。`csdbDirs`=`["/Users/bonji/s1000d-stack-eval/csdb"]`。`include` は省いた。
   想定（実行ログ）: 17 件前後。COM は入るか応答で決める。
   実際: `page.total` 17。COM は `results` に無い。節 4 の見出しの下にはこの行は無く、節 3 と節 10 が、既定の dm と pm に `COM-…XML` が入らない、と書いている。パスを指定した `verify_data_module` では `schema.state` `valid`、`brex.state` `passed`、`references.state` `resolved`。

## 5. 説明・inputSchema・`_notes` と、実際の動作

報告書が、ツールの説明（description）、inputSchema、応答の `_notes` / `_note` と、応答のフィールドを並べて書いているもの。Skill の文書は、報告書がそう書いているときだけ、別行にした。

| UC | 報告書が引いている説明・schema・`_notes` | 実際（報告書のフィールド） |
| --- | --- | --- |
| SETUP | verify のインストール済み `plugin.json` の description は「5 tools」 | 起動中の `dist/tools/definitions.js` の名前は 7 つ（`verify_data_module`、`validate_schema`、`check_references`、`verify_csdb`、`suggest_fixes`、`reconcile_dml`、`list_schemas`）。版番号は 0.6.1 のまま、と SETUP |
| SETUP | writer の `_notes` は "the CSDB" とだけ言う、と「このホストでは測れない項目」。スモークの `_notes` は "issueInfo: not given and not in the CSDB; used 001-00." | どのディレクトリを見たかは、この 1 回の応答に無い。`written` は `[]` |
| UC01 | サーバーの説明は、`brexDmRef` の連鎖が S1000D の既定 BREX で終わる | KBWORKS の `explain_brex`（`limit: 1`）の `parentBrex` は `self`。DMC 指定の応答に `path` は無かった |
| UC02 | `convert_manual` の `_notes`「Nothing was written (write is false). The XML is only returned.」 | `write: false` かつ `includeXml: false` の応答トップレベルに XML は無かった |
| UC02 | `list_notations` の `_note`「Check the parent BREX and the project business rules document.」 | KBWORKS の `parentBrex` は `self`（UC01 のヘッダ）。この UC では既定 BREX の `list_notations` は呼んでいない |
| UC03 | `read_data_module` の `_notes`「No product was given: applicability is "undetermined" everywhere.」 | `identAndStatus.applicability.state` は `applicable`。`reason` は `no expression (display text only)` |
| UC04 | `build_data_module` の `_notes` は `noSupportEquips`、`noSupplies`、`noSpares`、`noSafety` を書く | 同じ XML に `noConds` と `closeRqmts` がある。`_notes` は `closeRqmts` に触れていない。手順の `caution` があるときも `noSafety` |
| UC04 | brex の注記フィールドは `_note`（文字列） | writer と verify は `_notes`（配列）。節 4 と節 10 |
| UC05 | 節 10: 既存ファイルは `error.code` ではない。説明に `writeSkipped.reason` と書く、と提案。`_notes` は `overwrite: true` で置き換えられる、とだけ書く | `writeSkipped.reason: "write-conflict"`。`written: []`。`error` は無い |
| UC05 | 節 10: `rejected[].reason` の三つの値は `_notes` にだけある。inputSchema には無い。`_notes` の文は `candidate-not-offered`、`value-not-allowed`、`provide-is-not-a-document-change` | 返った値は `candidate-not-offered` |
| UC05 | 自動適用の `_notes`「1 fix(es) with a single certain candidate (confidence "exact") were applied automatically」 | そのあとの `byConfidence.exact` は 0。件数は `appliedFixes` の 1 件 |
| UC07 | reader の `_notes`「Content of schema "comment" is not structured yet; only the identification and status section is read.」 | 返った `identAndStatus` は `applicability` だけ。`securityClassification.note` は status に宣言が無い。`create_comment` の応答には `securityClassification="01"` と `simplePara` が 3 つ |
| UC07 | 同じ comment 応答の `_notes`「No product was given: applicability is "undetermined" everywhere.」 | `applicability.state` は `applicable`。`reason` は `no applic in dmStatus` |
| UC08 | 同じ読み戻しの `_notes`（product が無いので至るところ undetermined） | en-US の `applicability.state` は `applicable`。`reason` は `no expression (display text only)` |
| UC08 | 節 10 の種別はホスト適合。xcomet のサーバーは接続されている | `xcomet_batch_evaluate` は `No module named 'comet'`。得点は無い |
| UC10 | 節 10: `verify_csdb` の `csdbDirs` の説明は「検証するフォルダー（既定は `S1000D_CSDB_DIR`）」 | `csdbDirs` に `fixtures/incoming/broken` だけを渡した応答の `searched` は、そのフォルダーと設定の `csdb` の両方。`schemaValid` 17、`unreadable` 0。`broken.XML` と `empty.XML` は `results` に無い |
| UC10 | 節 3: `list_data_modules` の説明は、`csdbDirs` を `S1000D_CSDB_DIR` に追加する、と書いてある | 存在しないフォルダーは `searched` に無く、`_notes` は `[]`。`page.total` は 16。列挙したのは設定の `csdb/` |
| UC10 | 節 10: 無いファイルは `error.code` が無い。整形式でないファイルは `schema.state` `not-run` と `schema.errorCount` 0 が同時 | 手順 3 の `error` は `File not found: …` の文字列。手順 5 と 6 の `schema.errors` は `[]`。`reason` の同じ文が 2 回つながる |

報告書が、説明や `_notes` と食い違ってはいない、と書いているもの:

- UC01 の節 10: `lookup_value` の説明は連鎖を辿ると書いていない。KENBAIKI を渡した `matches` は `KB-00003` だけだった。
- UC03 の節 4: `list_data_modules` が `securityClassification` と `verification` を返さないことは、説明どおり。
- UC09 の節 10: `skeleton-mismatch` の `detail`（`Extract the segments again.`）と Skill の「古いハッシュで再試行しない」は一致した。`_notes` は `Nothing was written.`。
- SETUP のスモーク: `build_data_module` の `_notes`「The XML is only returned.」のとき、XML 文字列は応答に含まれていた。`csdb/` には書いていない。

Skill の文書で、報告書が動作と並べているもの（ツールの description ではない）:

- UC04 の節 4 と節 10: `s1000d-publish` の `references/kinds.md` は「警告・注意は入力の位置にかかわらず先頭に寄せて組み立てられる」と書く。今回の `caution` は手順 2 の中で `para` の前に残り、手順 1 の前には出ていない。
- UC09 の節 10: `section: content` には手順の文がある。`language` は無い。提案は、Skill の「言語は identAndStatus」を content の `_notes` にも書く、という文。content の `_notes` が言語を返すと書いていた、とは書いていない。

SETUP が「このホストでは測れない」と書いた残り:

- DeepL の MCP。この Grok の子プロセス、`plugins.enabled`、接続サーバー一覧に `deepl` は無い。未実施。
- `serverInfo` オブジェクトはツール結果として届かない。版は起動中パッケージから読んだ。ツールに `serverInfo` を返すものは見当たらなかった、と迷った箇所。
- xcomet はこの Grok の子で動いている（`npm exec xcomet-mcp-server@latest`）。SETUP では呼んでいない。動くかは未実施、と SETUP。呼んだ結果は UC08 の節 4。
