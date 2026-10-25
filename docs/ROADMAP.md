# s1000d-stack ロードマップ

LLM が S1000D の技術文書を正しく読み、プロジェクトの決まり（ビジネスルール）に沿って検査・作成できるようにするための MCP サーバー・共有ライブラリ・Skill と、体験型マニュアルの作成ツール・閲覧ソフトをまとめるプロジェクトです。

- 作成日: 2026-10-23（JST）、更新日: 2026-10-24（JST、段階 2 の作業を追記）
- 構成の手本: [houki-hub](https://github.com/shuji-bonji/houki-hub)、[pdf-agent-stack](https://github.com/shuji-bonji/pdf-agent-stack)
- 決定事項: [DECISIONS.md](./DECISIONS.md)
- 調査メモ: [notes/background.md](./notes/background.md)
- 段階 2 の設計: [design/verify-mcp.md](./design/verify-mcp.md)、[design/reader-mcp.md](./design/reader-mcp.md)、[design/manual-model.md](./design/manual-model.md)

## 目指すもの

1. **一般向け**: 画面や機器の操作を体験しながら学べるマニュアルを、軽い Web 形式で作れるようにします（2021 年の作品 [experience_based_operation_explanation](https://github.com/shuji-bonji/experience_based_operation_explanation) の再構築）。
2. **産業向け**: 同じデータを S1000D のデータモジュールとして出力・検査できるようにし、部品メーカーや技術マニュアル制作会社の作業を支援します。

専門家エージェント（MCP と Skill）を先に作り、それを開発の道具として使いながら製品（作成ツール・閲覧ソフト）を作ります。

## 全体像

```mermaid
flowchart TB
  subgraph Hub["s1000d-stack（構成表とサイトだけを持つ）"]
    SITE["site/<br/>Astro Starlight の学習サイト"]
    STACK["stack.json<br/>構成の正典"]
    DOCS["docs/<br/>ROADMAP・DECISIONS・notes"]
  end
  subgraph Lib["lib/"]
    CORE["s1000d-core<br/>DMC・ICN・データモジュールの読み取り<br/>BREX の照合（D-10）"]
    MODEL["experiential-manual-model<br/>共通データモデル<br/>（S1000D に依存しない）"]
  end
  subgraph Mcp["mcp/"]
    BREX["s1000d-brex-mcp"]
    R["s1000d-reader-mcp"]
    V["s1000d-verify-mcp"]
    W["s1000d-writer-mcp"]
  end
  subgraph App["app/"]
    ED["作成ツール"]
    VW["閲覧ソフト（WebMCP 対応）"]
  end
  SK["skill/<br/>変換・作成・受入検査の手順"]
  BREX --> CORE
  R --> CORE
  V --> CORE
  W --> CORE
  W --> MODEL
  ED --> MODEL
  VW --> MODEL
  SK -.呼び出す.-> Mcp
```

experiential-manual-model（文書の中では「manual-model」と略します。U-04）は s1000d-core に依存させません。一般向けの製品が S1000D の概念を抱え込まないようにするためです（D-01、D-09）。S1000D との変換関数は writer 側に置きます。

## 段階

| 段階 | 成果物 | 完了の条件 |
|---|---|---|
| 1 | s1000d-stack（サイトの骨組みと用語の説明）、s1000d-core、s1000d-brex-mcp | **自動**: 自作 BREX と自作データモジュールで、BREX の説明と照合のテストが CI で通る（2026-10-23 済み）。**手動**: 既定の BREX（利用者が入手したもの）を `explain_brex` で読み、自作データモジュールを照合して、結果が仕様書の BREX の章の記述と矛盾しないことを確認済み（2026-10-23 済み。券売機の説明 DM は既定 BREX の 243 ルールに違反なし）。**サイト**: BREX・データモジュールの説明を仕様書と照合済み（2026-10-24 に、作業 3 で読んだ Chap 4.10.2〜4.10.3・7.9 と既定 BREX の実測に基づいて執筆。2026-10-24 に利用者が 9 ページを通読し、仕様書との矛盾が無いことを確認済み。確認の根拠は [notes/site-review.md](./notes/site-review.md)）。**段階 1 は 2026-10-24 に完了** |
| 2 | s1000d-reader-mcp、s1000d-verify-mcp、manual-model | 公式 XSD（利用者が入手したもの）による検証、参照の解決、適用性の判定ができる。reader の応答には対象データモジュールの版（issue）と検証状態を必ず含め、適用性の判定は reader が済ませてから LLM に渡す |
| 3 | s1000d-writer-mcp、Skill（experience-to-s1000d / s1000d-publish / s1000d-review）、作成ツールの試作 | 券売機の例を共通データモデル経由で S1000D に出力し、verify を通る |
| 4 | 閲覧ソフト | 共通データモデルを表示し、WebMCP で AI が操作を案内できる |

```mermaid
flowchart LR
  S1["段階 1<br/>hub ＋ core ＋ brex"] --> S2["段階 2<br/>reader ＋ verify ＋ model"]
  S2 --> S3["段階 3<br/>writer ＋ Skill ＋ 作成ツール"]
  S2 --> S3b["段階 3（並行）<br/>作成ツールの試作"]
  S3 --> S4["段階 4<br/>閲覧ソフト"]
  S3b --> S4
```

## 段階 1 の作業（完了）

| 順 | 作業 | 置き場所 |
|---|---|---|
| 1 | hub に `.gitignore`（`/specs/`、`*.zip`、`/mcp/`、`/lib/`、`/skill/`、`/app/`）を置いてコミットする。**その後で**仕様書の zip を `s1000d-stack/specs/s1000d/archives/` に移し、Issue 7 を `issue-7/` に展開する（D-06）。展開後のファイル構成（パスとファイル名だけ。内容は写さない）と、XSD・既定 BREX の場所を notes/background.md に記録する。この記録が brex-mcp の README の「利用者が置くべき構成」の元になる | s1000d-stack/specs/（git 管理外）、docs/notes/background.md |
| 2 | 仕様書の利用条件（`S1000D-A-00-00-0000-00A-021A-D`）の全文を読み、DECISIONS.md の判断を確定する | docs/DECISIONS.md |
| 3 | 仕様書の BREX の章（Chap 4.10.2〜4.10.3、PDF p.2110〜2143）を読み、各ルールの意味（`allowedObjectFlag` の値、`valueForm` の種類、`brexDmRef` の連鎖の規則、nonContextRules の扱い）を確かめる | docs/notes/background.md |
| 4 | hub の骨組み（README、`stack.json`、`scripts/`、Starlight の `site/`）を作る。`.gitignore` は作業 1 で置いたものを使う | s1000d-stack |
| 5 | s1000d-core の雛形を作り、DMC と ICN の分解、データモジュールの識別・状態部の読み取りを実装する。XML の読み取りと XPath の評価は 1 つのインターフェースの後ろに置く（D-12） | lib/s1000d-core |
| 6 | s1000d-core に BREX の照合処理を実装し（D-10）、s1000d-brex-mcp のツールからそれを呼ぶ | lib/s1000d-core、mcp/s1000d-brex-mcp |
| 7 | 自作のサンプルデータ（券売機の例など）と自作 BREX でテストする。ICN は架空の MIC・CAGE コードで採番する | lib/s1000d-core のテストデータ |

### 進捗（2026-10-24）

| 作業 | 状態 |
|---|---|
| 1 | 済み。`.gitignore` を作成し、zip を `specs/s1000d/archives/` へ移し、Issue 7 を `issue-7/` に展開した。構成は notes/background.md に記録済み。`.gitignore` と `docs/` は 2026-10-24 にコミット済み |
| 2 | 済み。D-03 を確定し、U-02 を解決した |
| 3 | 済み。Chap 4.10.2〜4.10.3 を読み、判定規則を notes/background.md の「BREX の章の読解結果」に記録した。Chap 7.9（Business rules processing）も同日に読み、結果を同メモの「Chap 7.9 の読解結果」に記録した |
| 4 | 済み（2026-10-24）。hub の README、`stack.json`（`scripts/generate-stack.mjs` で生成。status に `developing` を追加）、Astro Starlight の `site/`（9 ページ: はじめに、IETM と S1000D、データモジュールと DMC、BREX、s1000d-brex-mcp、s1000d-core、構成と進み方、仕様書の扱いと商標、トップ）、GitHub Pages の `deploy.yml`、`stack-check.yml`。Pagefind の日本語検索を確認（U-06）。サイトの題名は「S1000D Stack」。hub が Private のため GitHub Pages は使えず（U-01）、`deploy.yml` は手動実行だけにしてある。テーマは `starlight-theme-rapide`（D-07 追記）。利用者による 9 ページの通読は済み（2026-10-24。照合シートは notes/site-review.md） |
| 5 | 済み。`lib/s1000d-core` に雛形を作成（DMC・ICN の分解と組み立て、ファイル名の分解、`xsi:noNamespaceSchemaLocation` からの版・種類の推定、識別・状態部の読み取り、`XmlEngine` インターフェースと `@xmldom/xmldom` ＋ `fontoxpath` の実装）。自作テスト 19 件と、配布物に対するテスト 4 件（`S1000D_SPEC_TESTS=1` で有効）が通る。GitHub リポジトリは Public にし、npm に 0.1.0 を公開済み（2026-10-24、D-05・D-14） |
| 6 | 済み。s1000d-core に BREX の読み取り（`readBrex`）・照合（`checkAgainstBrexLayer` / `checkAgainstBrexChain`）・連鎖の解決・SNS 検索・CSDB フォルダーの解決器を実装（D-10）。`mcp/s1000d-brex-mcp` を SDK v2（`serveStdio` ＋ `buildServer`）で作成し、5 ツール（`explain_brex` / `lookup_sns` / `lookup_value` / `list_notations` / `check_against_brex`）と `instructions` を実装。InMemoryTransport のテスト 12 件、配布物テスト 3 件、stdio の実機確認が通る。core は npm 0.1.0 を参照（2026-10-24） |
| 7 | 自作データ（券売機の説明 DM と 2 層の自作 BREX）でのテストは済み。既定 BREX と Bike Samples 全件の照合も通る（公式サンプル 105 件に既定 BREX への違反 55 件を検出。既定 BREX 側の厳しさか、サンプル側の不備かは未調査）。テストデータの共有パッケージへの切り出しは U-03 のとおり未 |

### BREX のルールの種類

BREX データモジュールの内容部には、次の種類のルールが入ります。要素名は Issue 7 の `brex.xsd` と既定 BREX で確認済みです（2026-10-23）。

| 種類 | 内容 | ツールへの対応 |
|---|---|---|
| contextRules › structureObjectRuleGroup › structureObjectRule | XPath（`objectPath`、属性 `allowedObjectFlag`）で指した要素・属性の使用可否と、`objectUse`（人が読む説明）、許可する値（`objectValue`、属性 `valueAllowed`・`valueForm`・`valueTailoring`）、`brDecisionRef`（ビジネスルール決定点への参照）。既定 BREX には 274 ルール・1,445 値がある | `explain_brex`、`check_against_brex` |
| nonContextRules › nonContextRule | 機械で判定できない取り決めを文章で書いたもの | `explain_brex` に含める。`check_against_brex` は「手動で確認する項目」として一覧で返す |
| snsRules › snsDescr | システム番号の体系（SNS）の定義。既定 BREX には無く、プロジェクトの BREX で使う | `lookup_sns` |
| contextRules › notationRuleList › notationRule › notationName | 使ってよい図・マルチメディアの形式（NOTATION）。`structureObjectRuleGroup` の兄弟として `contextRules` の中に置く。`rulesContext` 無しなら基本セット、スキーマ指定ならその文脈での再定義・除外。既定 BREX には無い。仕様書側の一覧は `notations/notations.xml`（121 件） | `list_notations` |
| 識別・状態部の `brexDmRef` | この BREX が従う上位の BREX。既定 BREX は自分自身を指しており、連鎖の終端になる | `check_against_brex` が連鎖をたどって統合する |

### s1000d-brex-mcp のツール案

| ツール | 内容 |
|---|---|
| `explain_brex` | BREX のルールを、どの要素に何を求めているかが分かる文章に直して一覧にする。contextRules と nonContextRules の両方を含め、どちらかを区別して返す |
| `lookup_sns` | システム番号（SNS）がどの装置・系統を指すかを返す |
| `lookup_value` | 属性の値がプロジェクトで何を意味するかを返す |
| `list_notations` | BREX が許可している図・マルチメディアの形式の一覧を返す。3D の形式は BREX で決まるため、MCP や Skill は形式を決め打ちにせずこれを読む |
| `check_against_brex` | データモジュールを BREX と照合し、違反を箇所付きで返す。nonContextRules は手動確認の項目として別に返す |

### BREX 照合処理の流れ

既存の検査ツールが行う 4 つの工程と同じです。MCP では工程を道具に分け、結果を LLM が次の判断に使える構造で返します。

```mermaid
flowchart TB
  A["1. 参照する BREX の特定<br/>対象 DM の識別・状態部の brexDmRef"] --> B["2. スキーマ検証<br/>段階 1 では行わず「XSD 未検証」と明記<br/>段階 2 の verify-mcp が行う"]
  B --> C["3. ルールの抽出と適用<br/>brexDmRef の連鎖を統合<br/>contextRules を XPath で照合"]
  C --> D["4. 結果<br/>違反ごとに箇所・値・ルール ID と objectUse の文章<br/>nonContextRules は手動確認の一覧"]
```

- 工程 1 で BREX の DMC からファイルを探すために、ツールの引数に CSDB のフォルダー（または BREX ファイルのパス）を取ります。既定 BREX は `S1000D_SPEC_DIR` の下をファイル名 `DMC-S1000D-*-04-10-0301-00A-022A-D*.XML` で探します（システム差異コードは版で変わり、仕様書本文と実ファイルで食い違いもあるため決め打ちしない）。
- 工程 3 では、対象 DM の `xsi:noNamespaceSchemaLocation` に合う `rulesContext` のブロックと、`rulesContext` 無しの共通ブロックを適用します。判定は `allowedObjectFlag`（`0` = あれば違反、`1` = 無ければ違反、`2` = あれば `objectValue` と照合）で行い、`objectValue` の `pattern` は XSD 正規表現を JavaScript の正規表現に変換して全体一致で評価します。詳細は notes/background.md の「BREX の章の読解結果」を参照してください。
- 工程 3 で照合できるのは contextRules だけです。nonContextRules は人（または LLM）が読んで判断する項目として返します。
- 工程 4 の違反報告には、ルール ID（`brDecisionRef/@brDecisionIdentNumber`）、`objectUse` の文章、違反箇所（XPath と行番号）、実際の値、`brSeverityLevel` を含めます。

## 段階 2 の作業

設計は `docs/design/` の 3 文書（2026-10-24 作成）にあります。core の変更を先に済ませ、2 つの MCP はそれを呼ぶだけにします（D-10 と同じ考え方）。

```mermaid
flowchart LR
  C1["1. core: BREX の探索を brex-mcp から移す"] --> C2["2. core: SchemaValidator ＋ libxml2-wasm<br/>VerificationStatus"]
  C2 --> C3["3. core: 参照の解決"]
  C3 --> C4["4. core: 適用性の評価<br/>（ACT・CCT・PCT）"]
  C4 --> C5["5. core: 本文の読み取り（5 種）<br/>→ core 0.2.0"]
  C2 --> V["6. s1000d-verify-mcp"]
  C5 --> R["7. s1000d-reader-mcp"]
  M["8. manual-model（並行）"]
  V & R & M --> S["9. サイトに 3 ページ追加"]
  S --> P["10. 公開（D-16）"]
```

| 順 | 作業 | 置き場所 | 設計 |
|---|---|---|---|
| 1 | brex-mcp の `services/brex-locator.ts` にある既定 BREX の探索（`DMC-S1000D-*-04-10-0301-00A-022A-D*.XML` を探し、中身の DMC が一致するものを優先する）を s1000d-core に移し、brex-mcp はそれを呼ぶ形に直す。verify-mcp と重複させないため | lib/s1000d-core、mcp/s1000d-brex-mcp | verify-mcp.md「3. BREX の照合」 |
| 2 | s1000d-core に `SchemaValidator` インターフェース、`VerificationStatus` の型、`S1000D_SPEC_DIR` から `xml_schema_flat/` を探す処理、`verifyDataModule()` を足す。`libxml2-wasm` の実装はサブパス `@shuji-bonji/s1000d-core/xsd-libxml2`（任意の peerDependency）に置く（D-17） | lib/s1000d-core | verify-mcp.md「SchemaValidator と libxml2-wasm の置き場所」 |
| 3 | s1000d-core に参照の解決を足す: `dmRef`、`pmRef`（`parsePmcFileName` を追加）、ICN（`ENTITY` 宣言 → ファイル）、`internalRef`、`applicRefId`。`listDataModules` を PMC・DML・DDN・IMF・UPF も拾う `listCsdbObjects` に広げる | lib/s1000d-core | verify-mcp.md「4. 参照の解決」 |
| 4 | s1000d-core に適用性の評価を足す: ACT・CCT・PCT の読み取り、`assert` / `evaluate` の評価、`product` との照合。範囲の書式は BREX の `matchesRange` を再利用する | lib/s1000d-core（`src/applic/`） | reader-mcp.md「適用性の判定」 |
| 5 | s1000d-core に本文の読み取りを足す: `descript` / `proced` / `process` / `fault` / `pm` の 5 種を共通の形（`blocks` / `steps` / `flow`）に揃える。ここまでを core 0.2.0 として公開し（D-14 の手順）、brex-mcp の依存を `^0.2.0` に上げる | lib/s1000d-core（`src/content/`） | reader-mcp.md「本文の構造の返し方」 |
| 6 | s1000d-verify-mcp を作る: 5 ツール（`verify_data_module` / `validate_schema` / `check_references` / `verify_csdb` / `list_schemas`）、`instructions`、自作データのテスト、配布物のテスト（Bike Samples 106 件が XSD に適合、既定 BREX への違反 55 件が brex-mcp と一致）。作業 2 が済めば着手できる。U-03（自作サンプルデータの共有パッケージ）はこのときに判断する | mcp/s1000d-verify-mcp | verify-mcp.md |
| 7 | s1000d-reader-mcp を作る: 6 ツール（`list_data_modules` / `read_data_module` / `read_publication_module` / `resolve_reference` / `describe_applicability` / `read_icn_metadata`）、`instructions`、テスト | mcp/s1000d-reader-mcp | reader-mcp.md |
| 8 | manual-model を作る: 型、JSON Schema、`validateManual`、`fromLegacyJson`、券売機の例 `examples/kenbaiki.manual.json`。core に依存しないので、作業 1〜7 と並行できる。名前は `@shuji-bonji/experiential-manual-model`（U-04） | lib/experiential-manual-model | manual-model.md |
| 9 | サイトに「s1000d-verify-mcp」「s1000d-reader-mcp」「適用性」の 3 ページを足し、`stack.json` に verify / reader / manual-model を加える。既存の brex-mcp のページにある「XSD 未検証」の説明を verify-mcp への案内に直す | s1000d-stack/site、stack.json | — |
| 10 | 公開（D-16 の 5 つの作業）と、verify-mcp・reader-mcp の初回の手動 `npm publish` と Trusted Publisher の登録（D-14） | hub、各 MCP | DECISIONS.md D-14・D-16 |

調査の宿題（Bike Samples 105 件に既定 BREX への違反 55 件が出る原因）は作業 6 のテストで同じ数が出ることを確かめたうえで、作業 9 のサイトの題材として調べます。

### 進捗（段階 2）

| 作業 | 状態 |
|---|---|
| 設計 | 済み（2026-10-24）。`docs/design/` の 3 文書。同日に D-17（`SchemaValidator` の置き場所）・D-18（reader の検証の既定）・U-04（パッケージ名）を確定 |
| 1 | core 側は済み（2026-10-24。`src/brex/locate.ts` に `locateBrex` / `findDefaultBrex` / `isDefaultBrexDmc` / `BrexLocateError`。自作データのテスト 9 件と配布物のテスト 1 件を追加し、46 件すべて通過。core 0.2.0 に含む）。brex-mcp を core の関数に切り替える作業は、brex-mcp が npm の core を参照しているため（`^0.1.0`。`file:` 依存は CI で解決できない、U-10）、core 0.2.0 の公開（作業 5）の後に行う |
| 2 | 済み（2026-10-24、core 0.2.0 に含む）。`src/xml/schema-validator.ts`（`SchemaValidator` ほかのインターフェース）、`src/xsd-libxml2.ts`（`Libxml2SchemaValidator`。サブパス `@shuji-bonji/s1000d-core/xsd-libxml2`、`libxml2-wasm` は任意の peerDependency）、`src/verify/`（`findSchemaDirs` / `locateXsd` / `VerificationStatus` / `verifyDataModule`）。XSD の版は `brex.xsd` 冒頭の `Issue number:` から読む（フォルダー名に頼らない）。自作 XSD の単体テスト 10 件と配布物のテスト 1 件（Bike Samples 106 件が適合、約 0.45 秒）を追加し、57 件すべて通過。`verifyDataModule` の `references` は作業 3 まで `not-run` |
| 3 | 済み（2026-10-25、core 0.2.0 に含む）。`src/pmc.ts`（PMC）、`src/csdb-index.ts`（`listCsdbObjects` / `CsdbIndex`。PMC・DML・DDN・IMF・UPF・ICN も拾う）、`src/refs/`（`collectReferences` / `resolveReferences`）、`verifyDataModule` の `references`。自作データのテスト 8 件と配布物のテスト 1 件を追加し、65 件すべて通過。Bike Samples で分かったこと（仕様書の章への `dmRef`、`referencedApplicGroupRef/applicRef` 経由の `applicRefId`、`.PNG` と宣言された ICN の実ファイルが `.SVG`）は notes/background.md「参照の解決で分かった配布物の性質」に記録 |
| 4 | 済み（2026-10-25、core 0.2.0 に含む）。`src/applic/`（`readAct` / `readCct` / `readPct` / `readApplicStatements` / `evaluateApplic` / `ApplicEvaluator` / `buildApplicRepository`）。自作データのテスト 9 件と配布物のテスト 1 件を追加し、75 件すべて通過。Bike Samples で分かったこと（PCT が `type` に値を割り当てていない、PCT の条件値と CCT の列挙の不一致、`applicIdentValue` の先が配布物に無い）は notes/background.md「適用性の評価で分かった配布物の性質」に記録 |
| 5 | 済み（2026-10-25）。`src/content/`（`readContent` / `readContentFromXml` / `countNodes`）。自作データのテスト 7 件と配布物のテスト 1 件を追加し、84 件すべて通過。**core 0.2.0 を npm に公開済み**（2026-10-25、利用者がタグ `v0.2.0` を push。`latest`、サブパス `./xsd-libxml2` と任意の peerDependency `libxml2-wasm`、provenance 付き）。作業 1 の残り（brex-mcp の切り替え）も済み: 依存を `^0.2.0` に上げ、`services/brex-locator.ts` は core の `locateBrex` を呼ぶだけにした（brex-mcp の `edfe6e2`、15 件すべて通過、`libxml2-wasm` は入らない） |
| 6 | 済み（2026-10-25、verify-mcp の `686fb58`）。5 ツール（`verify_data_module` / `validate_schema` / `check_references` / `verify_csdb` / `list_schemas`）、`instructions`、自作データのテスト 13 件、配布物のテスト 5 件（Bike Samples の DMC 106 件＋ PMC 4 件がすべて XSD 適合、BREX の連鎖が解決。110 件で約 16 秒）、stdio の実機確認。実機確認で見つけた「データ辞書の中の XSD の写し（import が絶対 URL）」は verify-mcp 側で除外し、core にも同じ除外を入れた（core の `a0e9eb6`、**0.2.1 として未公開**）。npm への公開は D-16 のとおり段階 2 が揃った時点 |
| 7 | 済み（2026-10-25、reader-mcp の `6e567c7`）。6 ツール（`list_data_modules` / `read_data_module` / `read_publication_module` / `resolve_reference` / `describe_applicability` / `read_icn_metadata`）、`instructions`、自作データのテスト 14 件（ACT・手順 DM・PM のフィクスチャを追加）、配布物のテスト 5 件、stdio の実機確認。D-18 のとおり既定は XSD 検証だけ、`product` 無しは `undetermined` ＋ `displayText`。適用性リポジトリは CSDB から集める。npm への公開は D-16 のとおり段階 2 が揃った時点 |
| 8〜10 | 未 |
| 保守 | 2026-10-25: 4 リポジトリの `vitest` を 2.1 → 4.1 に上げた（2.x の依存に脆弱性の報告 6 件。開発時だけの依存。`npm audit` 0 件）。brex-mcp の CI の Node を 22・24 に揃えた（`engines` が >=22 のため） |

## 対象とする S1000D の版

- 最初の対象: Issue 7
- 次の対象: Issue 4.2（国内外の実例が Issue 4 系に多いため）
- s1000d-core は版ごとに読み分けられる構造にします。

## 未決事項

[DECISIONS.md の未決事項](./DECISIONS.md#未決事項) を参照してください。
