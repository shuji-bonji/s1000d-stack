# 2026-11 Grok Build によるリファレンスとの照合の所見

Grok Build が、S1000D Stack の MCP の応答を、S1000D Issue 7 の仕様書とサイトのリファレンスに照らして確かめた結果の所見です。出典は同じフォルダーの `REFCHECK.md`（Grok の報告の原文、2026-11-24 02:15 JST に受け取ったもの）です。2026-11-05 の試用（UC01〜UC10）の所見は `FINDINGS.md` にあります。

- 照合した観点: BREX の層ごとの照合、XSD の選び方、仕様書への `dmRef` の数え方、`nonContextRules` の扱い、適用性の式を返さないこと
- 結果の要約: 5 つの観点のうち 4 つはリファレンスどおりでした。仕様書への `dmRef` の数え方だけが、リファレンスと実装で食い違っていました（R-01）。同じ日に直して公開しています
- 「ソース」の列は、Claude がリポジトリのソースと手元の MCP で確かめたかどうかです

## 1. MCP・core で直したもの

| # | 対象 | 観察（出典） | ソース | 対応 |
| --- | --- | --- | --- | --- |
| R-01 | core・verify・writer | ビジネスルール雛形 `DMC-S1000D-J-04-10-0100-00A-024A-D` を、既定 BREX のフォルダーだけを `csdbDirs` にして調べると、`check_references` の `references.unresolvedCount` は 0、`specificationReferences.count` は 467 なのに、同じ応答の `counts.dmRef.unresolved` と、`suggest_fixes`・`verify_data_module` の `verification.references.unresolvedCount` は 467、`state` は `unresolved` だった。サイトの verify-mcp のページは、仕様書への参照を `unresolved` に入れないと書いている（REFCHECK 3） | 確認済み。開発版の verify-mcp で同じ値を再現した。原因は core `verify/verify.ts` が `status.references` を、仕様書への `dmRef` を含めて数えていたこと。469 件は `dmRef` 467 件と `internalRef` 2 件 | core 0.16.0 で、`unresolvedCount` と `state` を仕様書への `dmRef` を除いて決め、件数を `specificationReferences` に返すようにした。verify-mcp 0.9.0 で `counts.dmRef.unresolved` も同じ数え方にした。writer-mcp 0.7.0 で、未解決が仕様書への参照だけのときも `omitted.specificationReferences` に件数を返すようにした。修正後の plugin 版で、同じ呼び出しの要約・詳細・`counts` がすべて 0、`specificationReferences` が 467 になることを確かめた |

## 2. Skill・説明文で補ったもの

| # | 対象 | 観察（出典） | 対応 |
| --- | --- | --- | --- |
| R-02 | s1000d-publish・experience-to-s1000d | 2 つの Skill は、R-01 の食い違いを「`fixes[]` が空で、`omitted.specificationReferences` と `unresolvedCount` が同じなら、仕様書への参照だけ」という読み替えで補っていた。Skill を通さずにツールを呼ぶ利用者や、`verify_csdb` の集計だけを見る利用者には伝わらない（REFCHECK 3） | s1000d-publish 0.4.2・experience-to-s1000d 0.1.3 で、`specificationReferences` が付く版での書き方と、付かない古い版での読み替えの両方を書いた |
| R-03 | サイトの brex-mcp のページ | `passed` は重大度を解釈せず、機械で検査できるルールをすべて数える。Chap 7.9 の「関係するルール」は、プロジェクトが破ると無効になると決めた重大度のルールで、`passed` はそれより厳しい（REFCHECK 1） | 動きは `_notes` どおりで、不具合ではない。「できないこと」に、`passed` は重大度を見ずに決まること、Chap 7.9 との違い、残った違反は `brSeverityLevel` を見て人が判断することを書き足した（日本語・英語） |
| R-04 | サイトの writer-mcp のページ | reader は XML を返さないが、writer の `build_data_module` は組み立てた XML を `xml` として返す。Skill が禁じているのは LLM が XML を書くことで、サーバーが返すこととは別だが、並べて読むと誤解されやすい（REFCHECK 5） | 「3 つの方針」に、応答の `xml` はサーバーが組み立てて検証した結果で、LLM が書き換えて保存するものではないこと、直すときは `apply_fixes` か `edit_data_module` に渡すことを書き足した（日本語・英語） |

## 3. リファレンスどおりだったもの

| # | 観点 | 観察（出典） |
| --- | --- | --- |
| R-05 | BREX の層ごとの照合 | 券売機の説明 DM を `check_against_brex`（`followChain: true`）にかけると、3 層が別々に返り、既定 BREX の `parentBrex` が `self` で止まった。既定 BREX の `evaluatedRules` 243 は、`explain_brex`（`kind: "structure"`、`context: "descript"`）の `total` と一致した。Chap 7.9 の「層ごとに個別に照合し、どの層にも失敗が無ければ合格」と合う（REFCHECK 1） |
| R-06 | XSD の選び方 | `list_schemas` の `schemaDirs` は公式パッケージの `xml_schema_flat` だけで、データディクショナリの `xml_schema_flat` は出ない。`validate_schema` と `read_data_module` の `xsdPath` は同じ `descript.xsd` を指した（REFCHECK 2） |
| R-07 | `nonContextRules` の扱い | 合格判定に入らず、`manualChecks` として返る。件数は `read_data_module` の `verification.brex.manualChecks`、本文は `check_against_brex` の `layers[].manualChecks[]` にある。s1000d-review の Skill の分担と一致する（REFCHECK 4） |
| R-08 | 適用性の式 | `read_data_module` は `assert` の式を返さず、表示文と 3 値の評価だけを返す。`describe_applicability` は式の有無と使っている属性 id を返す。reader-mcp のページと `read_data_module` の説明に書いてあるとおり（REFCHECK 5） |

## 4. ホストと環境

| # | 観察（出典） | 扱い |
| --- | --- | --- |
| H-05 | 53.5 MB の Issue 7 の仕様書 PDF が、pdf-reader-mcp の 50 MB の上限を超えて開けず、Grok は該当ページを切り出して画像で読んだ（REFCHECK 1） | pdf-reader-mcp の側の制限。s1000d 側では直さない。仕様書の該当箇所を引く手順で同じ問題が続くので、pdf-reader-mcp のリポジトリで扱う |
