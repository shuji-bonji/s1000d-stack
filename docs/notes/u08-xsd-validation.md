# U-08: XSD 検証の方式の判断材料と比較結果

[DECISIONS.md](../DECISIONS.md) の未決事項 U-08（XSD 検証の方式）を判断したときの材料です。結論は D-15（`libxml2-wasm` で行う）です。2026-11-17 に、DECISIONS.md からこの文書に分けました。内容は変えていません。

## U-08 の判断材料

BREX のルールは `objectPath` に XPath で対象を書くため、XML を DOM として保持して XPath を評価できるライブラリが必要です。fast-xml-parser のように JSON に変換する方式では XPath を評価できません。また、データモジュールの DOCTYPE には ICN の `ENTITY` 宣言と `NOTATION` 宣言（内部 DTD サブセット）が入るため、選ぶパーサーがこれを読み飛ばせるか、取り出せるかも確認が要ります。

2026-10-23 時点の npm の実測です。

| パッケージ | 最新版 | 最終更新 | 状態 |
|---|---|---|---|
| `@xmldom/xmldom` ＋ `xpath` | 0.9.12 / 0.0.35 | 2026-08 / 2026-10 | 純粋な JS。XPath 1.0 |
| `fontoxpath`（＋ `slimdom`） | 3.34.0 | 2026-04 | 純粋な JS。XPath 3.1。slimdom は 2024-04 で止まっている |
| `libxml2-wasm` | 0.7.2 | 2026-09 | wasm。XSD 検証を持つが include/import は「実験的」。保守は個人 1 名 |
| `xmllint-wasm` | 5.3.0 | 2026-08 | wasm。xmllint 相当で XSD 検証向け |
| `libxmljs2` | 0.37.0 | 2025-06 | README に「NO LONGER MAINTAINED」。ネイティブビルド |
| `libxmljs3` | 0.25.3 | 2022-05 | 止まっている |

libxml2 本体は、長年の保守担当者が退いて「公式に保守されていない」状態と報じられています。wasm 版もネイティブ版も libxml2 を包んでいるため、この懸念は共通です。

経過:

1. 当初は「XPath 1.0 で足りる」と見て `xpath` パッケージを候補にしたが、既定 BREX に XPath 2.0 の式が含まれることが実測で分かり、`fontoxpath` に決めた（D-12）。
2. 残るのは XSD 検証（段階 2）の方式。純粋な JS で S1000D 規模の XSD 1.0 を検証できる実績のあるライブラリは見当たらないため、`xmllint-wasm` と `libxml2-wasm` を段階 2 で比べる。libxml2 本体の保守状況の懸念は両者に共通する。

## U-08 の比較結果（2026-10-24）

`xmllint-wasm` 5.3.0 と `libxml2-wasm` 0.7.2 を、Issue 7 の `xml_schema_flat/`（XSD 33 本）と Bike Samples（データモジュール 106 件、うち 31 件が DOCTYPE に `<!ENTITY … NDATA>` 宣言を持つ）で比べました。実行環境は開発機に接続した Linux VM、Node 22.23.4 です。スクリプトは hub の `scripts/experiments/u08-xsd-compare.mjs` にあります。

| 観点 | xmllint-wasm 5.3.0 | libxml2-wasm 0.7.2 |
|---|---|---|
| `xs:import` の解決（各 XSD が `xml.xsd` / `xlink.xsd` / `rdf.xsd` を import する） | `preload` に全 XSD の文字列を渡せば解決する。渡さないと「Failed to locate a schema at location 'xml.xsd'」でコンパイルに失敗 | `xmlRegisterInputProvider(new XmlBufferInputProvider({ 'xml.xsd': bytes, … }))` で解決する。渡さないと同じ理由で失敗。API は `@alpha` 表記 |
| 判定の正しさ | 106 件すべて適合。未知の要素・`xml:lang` の不正な位置・`year="abcd"` の型違反を検出 | 同じ 106 件すべて適合、同じ 3 種の違反を検出。エラー文は両者とも libxml2 のものなので一致 |
| 内部 DTD サブセット（`ENTITY` / `NOTATION` 宣言） | 31 件を問題なく読む | 31 件を問題なく読む。ただし `XmlDtd` は宣言を列挙する API を持たないので、NOTATION の取り出しは引き続き s1000d-core（`@xmldom/xmldom`）側で行う |
| 速度（106 件） | **7.8 秒**。呼び出しごとに Worker を起こしてスキーマをコンパイルし直す | **0.27 秒**。スキーマ 19 種を 1 回ずつコンパイルして `XsdValidator` を使い回せる |
| エラー情報 | `errors[].message`、`loc.fileName`、`loc.lineNumber` | `XmlValidateError.details[]` に `message` / `line` / `col` / `level`、可能なら `xpath` |
| 同梱する libxml2 | 2.13.8 | 2.14.0 |
| 配布形態 | Node 用は CommonJS（`index-node.js`）、ブラウザー用は ESM。`package.json` に `type` 無し。Node 16 以上 | ESM のみ（`lib/index.mjs`）。Node 18 以上。`browser: false` |
| 依存 | 0 | 0 |
| メモリー管理 | 不要（呼び出しごとに使い捨て） | `XmlDocument` / `XsdValidator` を `dispose()` する必要がある（`using` 構文にも対応） |
| 最終更新（npm） | 2026-08-05（18 版） | 2026-09-07（16 版） |
| ライセンス | MIT | MIT（libxml2 の MIT ライセンスも同梱） |

判断:

- verify-mcp は「1 つの CSDB の全データモジュールを同じ XSD で検証する」使い方になるので、スキーマのコンパイルを使い回せる `libxml2-wasm` が約 30 倍速い。`xmllint-wasm` の 1 件 70 ms 前後は単発なら問題にならないが、Bike Samples 規模（106 件）で 8 秒、実務の CSDB（数千件）では分単位になる。
- `libxml2-wasm` の `xs:import` 解決 API（`xmlRegisterInputProvider`）は `@alpha` 表記だが、Issue 7 の XSD 33 本については問題なく動いた。この API が変わった場合に影響を局所化できるよう、XSD 検証も s1000d-core の `XmlEngine` と同様に 1 つのインターフェース（仮に `SchemaValidator`）の後ろに置く。
- ENTITY / NOTATION の取り出しは既に s1000d-core にあるので、どちらを選んでも追加の実装は要らない。
- libxml2 本体の保守状況の懸念は両者に共通で、判断の材料にならない。

**結論: XSD 検証は `libxml2-wasm` で行う。2026-10-24 に D-15 として確定した。**

出典: [libxml2-wasm（GitHub）](https://github.com/jameslan/libxml2-wasm)、[xmllint-wasm（GitHub）](https://github.com/notengrafik/xmllint-wasm)、[libxmljs2 の README](https://cdn.jsdelivr.net/npm/libxmljs2@0.37.0/README.md)、[libxml2 が保守されなくなったという報道](https://www.linux.org/threads/linuxiac-libxml2-becomes-officially-unmaintained-after-maintainer-steps-down.59832/latest)
