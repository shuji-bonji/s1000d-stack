---
title: s1000d-verify-mcp
description: XSD 検証・BREX 照合・参照の解決を行い、結果を 1 つの検証状態にまとめて返す MCP サーバーの設定とツールを説明します。
---

`s1000d-verify-mcp` は、データモジュールを XML スキーマ（XSD）で検証し、BREX の連鎖に照合し、参照（`dmRef`・`pmRef`・ICN・`internalRef`・`applicRefId`）が解決できるかを確かめて、結果を 1 つの**検証状態**（`verification`）にまとめて返す MCP サーバーです。違反ごとに直し方の候補を返す修正提案（`suggest_fixes`）も持ち、ツールは 6 つです。検証状態は `s1000d-reader-mcp` が本文の応答に埋め込むものと同じ形で、どちらも共有ライブラリ `s1000d-core` の同じ関数で作ります。

[GitHub](https://github.com/shuji-bonji/s1000d-verify-mcp) / [npm](https://www.npmjs.com/package/@shuji-bonji/s1000d-verify-mcp)

## できること

| ツール | 内容 |
| --- | --- |
| `verify_data_module` | データモジュール 1 件を、整形式 → XSD → BREX の連鎖 → 参照の順に検証し、`verification` と各工程の詳細（XSD 違反の行番号、BREX 違反の箇所、未解決の参照と理由）を返します。`skip` で工程を省けます |
| `validate_schema` | XSD 検証だけを行います。使う XSD は `xsi:noNamespaceSchemaLocation` のファイル名で決め、`S1000D_SPEC_DIR` の下の `xml_schema_flat/` から探します。版は `brex.xsd` 冒頭の `Issue number:` から読みます |
| `check_references` | 参照を 5 種類集め、参照先の有無を理由付き（`not-found` / `no-entity-declaration` / `file-not-found` / `no-such-id` / `no-csdb`）で返します。仕様書の章への `dmRef`（モデル識別コード `S1000D`）は参照切れではないので別枠にします |
| `verify_csdb` | フォルダーの中の CSDB オブジェクト（既定は DMC と PMC）をまとめて検証し、1 件ごとの検証状態と件数の集計を返します。`offset` と `limit` で分けて読み、`reportPath` で詳細を JSON に書き出せます |
| `suggest_fixes` | `verify_data_module` と同じ検証を行い、違反ごとに直し方の候補を返します。候補はサーバーが決め、候補の出どころと確からしさ（`exact` / `several` / `none`）を付けます。`product` を渡すと、製品の値が足りず判定できない適用性にも、与える値の候補を付けます。修正を文書に当てることはしません |
| `list_schemas` | `S1000D_SPEC_DIR` の下で見つかった `xml_schema_flat/` の一覧（版、XSD の数、スキーマ名）を返します。`schema-not-found` の原因を調べるのに使います |

## 検証状態の読み方

```mermaid
flowchart LR
  IN["データモジュール"] --> W["整形式"] --> X["XSD<br/>valid / invalid /<br/>schema-not-found / not-run"]
  X --> B["BREX の連鎖<br/>passed / violations /<br/>incomplete / not-run"]
  B --> R["参照<br/>resolved / unresolved / not-run"]
  R --> V["verification"]
```

| 項目 | 値 | 意味 |
| --- | --- | --- |
| `schema.state` | `valid` | XSD を見つけて検証し、違反が 0 |
| | `invalid` | 違反あり。`errorCount` と、行番号付きの libxml2 の文章 |
| | `schema-not-found` | XSD が見つからない。`reason` に理由（`S1000D_SPEC_DIR` 未設定、`xml_schema_flat/` 無し、版が合わない、など） |
| | `not-run` | `skip` で省いた、または整形式でない |
| `brex.state` | `passed` | すべての層で違反 0、評価できなかったルール 0、未解決の BREX 0 |
| | `violations` | 違反あり |
| | `incomplete` | 違反は 0 だが、連鎖の途中の BREX が無いか、評価できないルールがある。検査されていない部分がある |
| `references.state` | `resolved` / `unresolved` | 未解決の参照が 0 か 1 以上か |

:::caution[`schema-not-found` は `valid` ではありません]
XSD が見つからなかったときは検証が行われていないだけで、文書が正しいことを意味しません。`list_schemas` で配布物の置き方を確かめてください。XSD に違反した文書では要素の位置が仕様と違う可能性があるため、BREX の違反が誤って出たり隠れたりします。`schema.state` が `invalid` のときは BREX の結果を参考程度に読んでください（応答の `_notes` にも書きます）。
:::

## 修正提案の読み方

`suggest_fixes` の応答は、検証状態（`verification`）と修正提案の一覧（`fixes`）です。修正提案 1 件は次の項目を持ちます。

| 項目 | 内容 |
| --- | --- |
| `kind` | 何に対する提案か（`schema` / `brex-value` / `brex-forbidden` / `brex-missing` / `brex-notation` / `reference` / `applicability`） |
| `location` | 違反の場所（XPath と行番号） |
| `problem` | 何が問題か（元の結果の文章） |
| `candidates` | 直し方の候補。`action`（`replace` / `remove` / `add` / `retarget` / `provide`）、`value`、`target`（直す対象）、`description` |
| `confidence` | `exact` = 候補が 1 つで値も決まる、`several` = 複数の候補から選ぶ、または範囲・正規表現に合う値を選ぶ、`none` = 候補を決められない |
| `source` | 候補の出どころ（BREX のルール ID、XSD の定義の名前、CSDB、文書の中の id、ACT・CCT・PCT） |
| `note` | 候補を決められない理由や、選ぶときの注意 |

候補はすべてサーバーが決めます。BREX の値の違反ならそのルールの許可値と説明文、XSD の違反なら libxml2 の文章か XSD の定義にある列挙値・正規表現・要素名、参照切れなら CSDB にある近いデータモジュールコードや拡張子だけ違うファイル、というように、出どころのはっきりした値だけを候補にします。LLM には候補の中から選んで説明させ、候補の外の値を考え出させない使い方を想定しています。このことは MCP の `instructions` にも書いてあります。

- `confidence` が `none` のときは、利用者に聞いてください。
- `valueForm` が `range` か `pattern` の候補は、値ではなく制約です。それに合う具体的な値は利用者に決めてもらいます。
- `action` が `provide` の候補は、文書の変更ではなく、適用性の判定に使う製品の値です。
- 仕様書の章への `dmRef`（モデル識別コード `S1000D`）は誤りではないので、既定では一覧に出さず件数だけを `omitted.specificationReferences` に返します。
- 修正を当てた後は、もう一度検証してください。

## できないこと

- **S1000D への準拠は判定しません。** `valid` と `passed` は「XSD と、機械で検査できる BREX のルールに誤りが無かった」ことだけを意味します。`nonContextRules`（文章で書かれた取り決め）は `manualChecks` として返し、判断は人が行います。プロジェクトのビジネスルール文書はどのツールの対象でもありません。
- BREX のルールの説明や値の意味は返しません。それは [`s1000d-brex-mcp`](/s1000d-stack/ja/mcp/brex-mcp/) の `explain_brex` / `lookup_value` の仕事です。重大度コード（`brsl01`〜`brsl99`）はそのまま返します。
- 適用性（どの製品に当てはまるか）は判定しません。`check_references` は `applicRefId` の参照先があるかだけを見ます。判定は [`s1000d-reader-mcp`](/s1000d-stack/ja/mcp/reader-mcp/) が行います。例外は `product` を渡した `suggest_fixes` で、製品の値が足りず判定できない適用性だけを報告します。
- 修正を文書に当てることはしません。`suggest_fixes` は候補を返すだけです。

## 設定

| 環境変数 | 内容 |
| --- | --- |
| `S1000D_SPEC_DIR` | S1000D の配布物を展開したフォルダー。XSD（`xml_schema_flat/`。内側の「XML Schema Package」の zip を展開しておく）と既定 BREX をこの下から探します |
| `S1000D_CSDB_DIR` | プロジェクトのデータモジュールが置かれたフォルダー。`:`（Windows は `;`）区切りで複数指定できます。参照先の DM・PM・ICN ファイルと、連鎖の途中の BREX をここから探します |

```json
{
  "mcpServers": {
    "s1000d-verify": {
      "command": "npx",
      "args": ["-y", "@shuji-bonji/s1000d-verify-mcp"],
      "env": {
        "S1000D_SPEC_DIR": "/path/to/s1000d/issue-7",
        "S1000D_CSDB_DIR": "/path/to/project/csdb"
      }
    }
  }
}
```

環境変数が無いときは、設定ファイル `~/.config/s1000d-stack/config.json`（`XDG_CONFIG_HOME` があればその下、`S1000D_CONFIG` で場所を変更可）の `specDir` と `csdbDirs` を読みます。Claude Desktop に plugin で入れたときのように、環境変数がサーバーに渡らない場合に使います。書き方は[はじめに](/s1000d-stack/ja/guide/getting-started/)にあります。

既定は stdio です。`--http` を付けると Streamable HTTP（既定 `http://127.0.0.1:3000/mcp`。`--host` / `--port` / `--path` で変更）で起動し、CSDB 製品のサーバーや Web アプリから HTTP で呼べます。loopback に束縛したときは `Host` と `Origin` を localhost 系に限り、それ以外のアドレスでは検査しないので、製品側のリバースプロキシや認証の後ろに置いてください。認証・権限・マルチテナントはサーバーでは持ちません（[組み込み基盤の設計](https://github.com/shuji-bonji/s1000d-stack/blob/main/docs/design/agent-platform.md)の境界）。

## XSD の探し方

配布物の中には `brex.xsd` を含む `xml_schema_flat/` が 2 つあります。XML Schema Package のものと、データ辞書（`data_dictionary_7/Files/`）の中の写しです。写しの方は `xs:import` が `http://www.w3.org/2001/xml.xsd` のような絶対 URL で、libxml2 がネットワークに出ようとして失敗するため、使いません。XML Schema Package 側の XSD は `xml.xsd` のように相対パスで import しているので、同じフォルダーの XSD をまとめて登録すれば解決します。

XSD 検証は `libxml2-wasm`（libxml2 の WebAssembly 版）で行い、XSD ごとに 1 回コンパイルして使い回します。Issue 7 の Bike Samples 106 件を 0.5 秒以内で検証できます。採用の経緯（`xmllint-wasm` との比較）は hub リポジトリの `docs/DECISIONS.md` の D-15 にあります。

## 公式サンプルで分かること

Bike Samples の DMC 106 件と PMC 4 件は、すべて Issue 7 の XSD に適合します。一方、`dmRef` 1,843 件のうち 954 件はモデル識別コード `S1000D` の DMC、つまり仕様書の章への参照で、CSDB には無いので未解決になります（ほぼすべてビジネスルール文書 `…-024A-D` の中）。`check_references` はこれを `specificationReferences` として別枠で返し、`unresolved` には入れません。また、DOCTYPE で `.PNG` と宣言された ICN の実ファイルが `.SVG` という不整合が 1 件あり、`file-not-found` として報告されます。拡張子の違いを許す寛容な解決は入れていません。宣言どおりに置かれていないことは、納品の検査で見つけたい事実だからです。そのかわり `suggest_fixes` は、この参照に「同じ名前で拡張子が `.SVG` のファイル」を候補として返し、宣言の `NDATA` も合わせて直す必要があることを説明に添えます。

