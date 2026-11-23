# 2026-11 Grok Build によるリファレンスとの照合（原文）

Grok Build が、S1000D Stack の MCP の応答を、S1000D Issue 7 の仕様書とサイトのリファレンスに照らして確かめた報告です。2026-11-24 02:15（JST）に受け取ったものを、手を加えずに載せています。所見と対応は同じフォルダーの `REFCHECK-FINDINGS.md` にあります。

- 報告には、使った MCP・Skill の版が書かれていません。受け取った時点の公開版は、core 0.15.0・brex 0.6.4・verify 0.8.1・reader 0.13.1・writer 0.6.1・s1000d-publish 0.4.1・experience-to-s1000d 0.1.2 です
- 表は Grok の出力の罫線のまま載せています

---

1. BREX は層ごとに照合している

Issue 7 の Chap 7.9（PDF のその章、2020-01-09、Page 2）には次のようにあります。本文は、53.5 MB の仕様書 PDF が pdf-reader の 50 MB 制限を超えたため、該当ページだけを切り出して画像で読みました。

A data module is valid according to its BREX reference if it passes relevant rules at each BREX layer. This is accomplished by validating the data module against each BREX data module individually in the complete hierarchy of layered BREX data modules.

The complete validation will be passed if and only if there are no failures at any of the layers checked.

同じ節は、検査を「ルールを検査向けの形に変換する」「そのルールで DM を検査する」の 2 段とし、対象が明示していない BREX にも同じ手順で照合してよい、層の書き方の矛盾を解くのは検査側の仕事ではない（Chap 2.5.1）、とも書いています。Chap 4.10.2 の <brex> の子は <commonInfo>、<snsRules>、<contextRules>、<nonContextRules> です。

券売機の説明 DM DMC-KENBAIKI-A-10-20-00-00A-040A-D_001-00_JA-JP.XML を check_against_brex（followChain: true）にかけると、3 層が別々に返りました。

┌─────────┬───────────┬───────────────┬──────────────┬────────────┐
│ layers[ │ explain   │ evaluatedRule │ violationCou │ manualChec │
│ ]       │ _brex の  │ s             │ nt           │ ks         │
│ .brex   │ parentBre │               │              │            │
│         │ x         │               │              │            │
├─────────┼───────────┼───────────────┼──────────────┼────────────┤
│ KENBAIK │ KBWORKS   │ 3             │ 0            │ KB-00100   │
│ I       │ -A-00-00- │               │              │ が 1 件    │
│ -A-00   │ 00-00A-   │               │              │            │
│ -00-00- │ 022A-D    │               │              │            │
│ 00A-    │           │               │              │            │
│ 022A-D  │           │               │              │            │
├─────────┼───────────┼───────────────┼──────────────┼────────────┤
│ KBWORKS │ S1000D-J- │ 2             │ 0            │ []         │
│ -A-00   │ 04-10-    │               │              │            │
│ -00-00- │ 0301-00A- │               │              │            │
│ 00A-    │ 022A-D    │               │              │            │
│ 022A-D  │           │               │              │            │
├─────────┼───────────┼───────────────┼──────────────┼────────────┤
│ S1000D  │ self      │ 243           │ 0            │ BREX-S1-   │
│ -J-04   │           │               │              │ 00245 が 1 │
│ -10-    │           │               │              │ 件         │
│ 0301-   │           │               │              │            │
│ 00A-    │           │               │              │            │
│ 022A-D  │           │               │              │            │
└─────────┴───────────┴───────────────┴──────────────┴────────────┘

passed は true、unresolvedBrex は [] です。既定 BREX の parentBrex が self で、層は 3 で止まっています。target.schema は descript です。既定 BREX を explain_brex（kind: "structure"、context: "descript"）にかけると total は 243 で、照合した evaluatedRules と一致します。counts.structure は 274、counts.contexts は all と dml / comment / ddn / icnmetadata / pm / update です。説明スキーマには共通ルールだけが当たっています。

Chap 7.9 の "relevant rules" は「破ると DM が無効になる重大度」です。応答は重大度を解釈せず、機械で判定できるルールをすべて数えます。_notes は "Severity codes (brslNN) are defined by the project; they are reported, not interpreted." です。プロジェクトが一部の brsl を無効化しないと決めていても、このサーバーはそれを合格条件にしません。矛盾した 2 層をわざと照合する呼び出しはしていません。

2. XSD は公式配布物の xml_schema_flat/ を使っている

list_schemas の schemaDirs は 1 件だけでした。

• dir: .../issue-7/xml-schema-package/S1000D Issue 7 XML Schema Package/xml_schema_flat
• issue: "7"
• xsdCount: 33

同じ specDir の下には data-dictionary/data_dictionary_7/Files/xml_schema_flat もありますが、schemaDirs には出ていません。

同じ説明 DM の validate_schema は schema.state: "valid"、errorCount: 0、validator: "libxml2-wasm 0.7.2" で、xsdPath はその公式フォルダの descript.xsd です。read_data_module（verify: "full"）の verification.schema.xsdPath も同じパスでした。

3. 仕様書への dmRef は修正候補にしない。要約の状態は unresolved のまま

ビジネスルール雛形 DMC-S1000D-J-04-10-0100-00A-024A-D_001-00_EN-US.XML を、既定 BREX のフォルダだけを csdbDirs にして調べました。

check_references（kinds: ["dmRef"]）:

• counts.dmRef.checked: 467
• counts.dmRef.unresolved: 467
• references.unresolvedCount: 0
• references.unresolved: []
• specificationReferences.count: 467
• targets の先頭 3 件（maxItems: 3 で打ち切り）: S1000D-H-04-10-0301-00A-022A-D、S1000D-A-00-60-0000-00B-024B-D、S1000D-A-A0-00-0000-00B-024F-D

分類はモデル識別コード S1000D です。先頭は章ではなく、古い版の既定 BREX（システム差異コード H）です。

suggest_fixes（skip: ["schema","brex"]、includeSpecificationReferences: false）:

• fixCount: 0
• fixes: []
• omitted.specificationReferences: 467
• _notes: "467 dmRef(s) to the S1000D specification itself are not listed; they are not errors."

一方、同じ応答の verification.references は state: "unresolved"、checked: 469、unresolvedCount: 467 です。verify_data_module でも同じでした。詳細側の references.unresolvedCount は 0、要約側の verification.references.unresolvedCount は 467 です。s1000d-publish と experience-to-s1000d の Skill は、この組み合わせ（fixes[] が空で、omitted.specificationReferences と unresolvedCount が同じ）を「仕様書への参照だけで、CSDB に無いのが通常」と読むよう書いています。要約だけを見ると未解決参照がある状態です。

4. nonContextRules は manualChecks で、合格判定には入っていない

上の 3 層照合は violationCount がすべて 0 で passed: true です。その応答に手動確認が 2 件入っています。

• プロジェクト層: ruleId: "KB-00100"、text: "手順の各ステップは 1 つの操作だけを書く"
• 既定 BREX 層: ruleId: "BREX-S1-00245"、text は削除を更新の特例として印だけを付ける、という文

explain_brex（kind: "nonContext"）は同じ 2 件を kind: "nonContext" で返し、_note に "Rules of kind \"nonContext\" cannot be checked automatically." とあります。組織層の counts.nonContext は 0、manualChecks は [] です。read_data_module の verification.brex は state: "passed"、layers: 3、violationCount: 0、manualChecks: 2 で、本文はここにはありません。本文は check_against_brex の layers[].manualChecks[] にあります。s1000d-review の Skill が書いている分担と一致します。

5. 読み取り応答に、生の XML と適用性式は無い

Bike Samples の DMC-S1000DBIKE-AAA-DA4-00-00-00AA-041A-A_011-00_EN-US.XML の XML には、DM レベルの <evaluate> と <assert applicPropertyIdent="type"|"model"|"version" ... applicPropertyValues="..."> があります。

read_data_module（section: "identAndStatus"、verify: "none"、product なし）が返した適用性は次だけです。

• applicDisplayText: "Mountain bicycle and (Mountain storm Mk1 or Brook trekker Mk9)"
• applicability.state: "undetermined"
• applicability.reason: "product not given"

applicPropertyIdent、applicPropertyValues、andOr、DM の XML は応答にありません。_notes に "Assert expressions are not returned." とあります。本文は content.blocks[] の kind / element / text です。券売機の説明 DM には式が無く、applicability.state は "applicable"、reason は "no expression (display text only)" でした。

describe_applicability は statements[0].hasExpression: true と表示文、使っている属性 id（type、model、version）を返します。式の値は返しません。extract_segments が返した 3 件目は context: "applic displayText" の表示文で、assert の属性値はありません。

build_data_module は呼んでいません。そのツール説明は、組み立てた XML を xml として返すと書いています。Skill が禁じているのは、LLM が XML を書くことです。