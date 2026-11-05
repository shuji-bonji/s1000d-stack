# 2026-11-05 Grok Build 試用の所見

Grok Build（1.0.70）で、S1000D Stack の MCP 4 本（brex 0.5.0・verify 0.6.1・reader 0.7.1・writer 0.1.2）と Skill 4 本（0.1.1）を、このキットの SETUP と UC01〜UC10 で使った結果の所見です。出典は同じフォルダーの `SETUP-pre.md`・`SETUP.md`・`UC01.md`〜`UC10.md`・`SUMMARY.md` です。

- 実施: 2026-11-05 21:01〜22:45（JST）。SETUP-pre は 20:00 前後
- 結果の要約: 実務で使える 2 件（UC06・UC09）、条件付きで使える 8 件。境界違反（B1〜B6）は 0 件
- 「ソース」の列は、Claude がリポジトリのソースと照らして確かめたかどうかです。「未確認」は Grok の報告だけに基づきます

## 1. MCP・core で直すもの

| # | 対象 | 観察（出典） | ソース | 提案 |
| --- | --- | --- | --- | --- |
| F-01（[verify#2](https://github.com/shuji-bonji/s1000d-verify-mcp/issues/2)） | verify | `.claude-plugin/plugin.json` の `description` は「5 tools」だが、接続されているツールは 7 本（`suggest_fixes`・`reconcile_dml` が説明に無い）（SETUP-pre・SETUP） | 確認済み。`src/tools/definitions.ts` は 7 本。`stack.json` の `note` も 5 本のまま | `plugin.json`・`server.json`・README・`stack.json` の REGISTRY を 7 本に合わせる |
| F-02（[verify#3](https://github.com/shuji-bonji/s1000d-verify-mcp/issues/3)・[reader#2](https://github.com/shuji-bonji/s1000d-reader-mcp/issues/2)） | verify・reader | 無いファイルや CSDB の不在で、呼び出しが文字列だけのエラーで失敗し、`error.code` が無い。verify `verify_data_module` は `File not found: …`、reader `list_data_modules` は `No CSDB folders. …`（SETUP-pre・UC10） | 確認済み。reader `handlers.ts` 200・517・652 行目は `throw new Error(...)` | writer の `input-error` と同じく、分類のコードを返す形を 4 本でそろえる |
| F-03（[verify#4](https://github.com/shuji-bonji/s1000d-verify-mcp/issues/4)・[reader#3](https://github.com/shuji-bonji/s1000d-reader-mcp/issues/3)） | reader・verify（core の CSDB の場所の決め方） | `csdbDirs` に渡したフォルダーが設定の `csdbDirs` と足し合わされ、存在しないフォルダーは黙って落とされる。`searched` に渡したフォルダーが無く、`_notes` も空（UC10 手順 4・7） | 確認済み。reader `services/context.ts` 45 行目 `existingDirs([...extraDirs, ...csdbDirs()])` | 存在しないフォルダーは `_notes` で知らせる。足し合わせることをツールの説明に書くか、渡したときは設定を使わない引数を設ける。verify `verify_csdb` の説明「既定は `S1000D_CSDB_DIR`」は置き換えに読める |
| F-04（[core#1](https://github.com/shuji-bonji/s1000d-core/issues/1)） | core（`fix/schema.ts`） | `applic` を省いて組み立てると、XSD のエラーが `brexDmRef` の位置で `This element is not expected. Expected is one of ( applicCrossRefTableRef, applic, applicRef )` になる。修正の候補は「`brexDmRef` を消す」「`brexDmRef` を `applic` などに置き換える」の 4 つで、「`brexDmRef` の前に `applic` を足す」が無い（SETUP） | 確認済み。`This element is not expected` の分岐は `remove` と `replace` だけを作る | 期待された要素が必須で抜けている場合に、前に足す候補（`add` と位置）を作る。少なくとも `note` で「前に必須の要素が抜けている可能性」を示す |
| F-05（[writer#1](https://github.com/shuji-bonji/s1000d-writer-mcp/issues/1)） | writer | 下書きに `applic` が無いと、`_notes` に「applic was omitted」と書くだけで、XSD に通らない DM を組み立てる（SETUP） | 確認済み（`_notes` の文） | F-04 と合わせて、`input-error` にするか、`displayText` だけの `applic` を既定で入れるかを決める |
| F-06 | core（`verify/verify.ts`） | 整形式でないファイルの `schema.reason` で、同じ文が 2 回つながる（`not well-formed: end tag name contains invalid characters: "snsC"; end tag name contains invalid characters: "snsC"`）（UC10 手順 5・6） | 一部確認。125 行目は解析器の文をそのまま入れる。重複の出どころは未確認 | 解析器のエラーの重複を除く |
| F-07（[writer#2](https://github.com/shuji-bonji/s1000d-writer-mcp/issues/2)） | writer | `convert_manual` を `includeXml: false` で呼ぶと、`_notes` の「Nothing was written (write is false). The XML is only returned.」が、XML の無い応答に付く（UC02） | 確認済み。`handlers.ts` 94 行目の固定文 | `includeXml: false` のときは「The XML is not returned (includeXml is false).」に変える |
| F-08 | reader | `product` を渡さないと、`_notes` は「applicability is "undetermined" everywhere」と書くが、`identAndStatus.applicability.state` は `applicable`（`reason: no expression (display text only)`）（UC03・UC07・UC08） | 未確認 | 式の無い DM では `_notes` を出さないか、「式が無いので製品によらず applicable」と書く |
| F-09 | reader | comment DM を `read_data_module` で読むと、`securityClassification` が取れない（`The document declares no securityClassification in its status section.`）。`create_comment` の XML には `commentStatus` の `security securityClassification="01"` がある（UC07） | 未確認 | comment の `commentStatus` から機密区分を読む。review Skill の「本文の前に機密区分を見る」が comment DM で成り立たない |
| F-10 | brex | 注記のフィールドが brex は `_note`（文字列）、writer・verify・reader は `_notes`（配列）（UC04） | 未確認 | 4 本で `_notes` にそろえる |
| F-11 | verify・reader | `reconcile_dml` の `not-found` の行に `listedIssueInfo`・`language`・`title` が無い。`notListed` の行に `issueInfo` が無い。件数のフィールドが verify は `notListedCount`、reader の `list_data_modules` は `reconciliation.notListed`（UC06） | 未確認 | DML に書いてある版は `not-found` の行にも返す。2 本でフィールド名をそろえる |
| F-12 | writer | `convert_manual` の `notRepresented` のホットスポットの行で、`count` が 6、`where` が 5 件（`hs-shortage-back` は戻り遷移の行にだけある）（UC02） | 未確認 | 件数と `where` の数え方をそろえる |
| F-13 | brex | `explain_brex` を `limit: 1` で呼んでも、既定 BREX の `commonInfo` の全文がヘッダに入る（UC01） | 未確認 | `limit` と別に、ヘッダの `commonInfo` を省く引数を設けるか、既定で要約にする |
| F-14 | brex | `list_notations` の `_note` が、親が `self`（連鎖の終端）の BREX でも「Check the parent BREX …」と書く（UC02）。サーバーの説明の「連鎖は既定 BREX で終わる」も、自作の BREX のように自分自身で終わる連鎖と合わない（UC01） | 未確認 | 終端の BREX では親への言及を省く。説明を「既定 BREX または自分自身を指す BREX で終わる」にする |

## 2. 説明文（description・`_notes`）で補うもの

| # | 対象 | 観察（出典） | 提案 |
| --- | --- | --- | --- |
| D-01 | writer | 自動で適用した修正は `appliedFixes` にだけ数えられ、`byConfidence.exact` は 0 になる（UC05） | `byConfidence` は「残った修正」の内訳だと、説明に書く |
| D-02 | writer | 既にファイルがあるときは `error` ではなく `writeSkipped.reason: "write-conflict"` で返る。Grok は `error.code` を想定していた（UC05） | ツールの説明に `writeSkipped` を書く |
| D-03 | writer | `apply_fixes` の `rejected[].reason` の値（`candidate-not-offered`・`value-not-allowed`・`provide-is-not-a-document-change`）が `_notes` にだけあり、説明に無い（UC05） | 説明に値の一覧を書く |
| D-04 | verify | `verify_csdb` の `include` の既定は `dm`・`pm` で、comment DM は入らない（UC10） | 既定で入らない種類を `_notes` に書く |
| D-05 | writer | `_notes` の「the CSDB」がどのフォルダーかが応答から分からない（SETUP） | 見たフォルダーを `_notes` か応答の項目に書く |
| D-06 | verify・writer | `_notes` の「References cannot be resolved」と `references.state: resolved` が同じ応答に並ぶ。調べた参照は BREX の連鎖でたどれた `brexDmRef` の 1 件だけ（`references.checked: 1`）で、動作は正しい（SETUP-pre・UC04） | 「BREX の連鎖でたどれたもの以外の参照は確かめていない」のように、結果と矛盾しない文にする |

## 3. Skill で直すもの

| # | 対象 | 観察（出典） | 提案 |
| --- | --- | --- | --- |
| S-01 | s1000d-publish `references/kinds.md` | 「警告・注意は入力の位置にかかわらず先頭に寄せて組み立てられる」とあるが、手順 2 の子に置いた `caution` は、手順 2 の中で `para` の前に置かれた。手順 1 の前には出ない（UC04） | 「その手順（または本文）の中で、`para` より前に置かれる」と書く |
| S-02 | s1000d-translate | `read_data_module` の `section: content` の応答に `language` が無く、訳した版の言語は `identAndStatus` かファイル名で確かめる必要がある（UC09） | Skill の確かめ方に、言語は `identAndStatus` で見ると書く |
| S-03 | s1000d-publish | Phase 8（DML との照合）が、UC05・UC09 では行われなかった（指示書の手順に無いため） | 指示書の側の問題か、Skill の Phase の必須度の問題かを、次の試用で切り分ける |

## 4. ホストと環境

| # | 観察（出典） | 扱い |
| --- | --- | --- |
| H-01 | xcomet-mcp は起動するが、`xcomet_batch_evaluate` が `No module named 'comet'` で失敗する（UC08） | xcomet-mcp の Python 側の依存の問題。s1000d 側では直さない。xcomet-mcp のリポジトリで扱う |
| H-02 | Grok に DeepL の MCP が無い（SETUP） | 未実施として扱う |
| H-03 | Grok Build は、作業場が信頼済みで、作業場が自分の git のルートのときだけ `AGENTS.md` を読んだ（ホームフォルダーが git のリポジトリだったため `git init` が必要だった） | キットの README に手順として書く |
| H-04 | `serverInfo` はツールの結果として届かないので、Grok は起動中のパッケージの `package.json` から版を読んだ（SETUP） | 版を返すツール（または `_notes`）を設けるかを検討する |

## 5. キットの不備（このキットで直した）

| # | 不備 | 直したこと |
| --- | --- | --- |
| K-01 | 体験型マニュアルの `assets` が指す画像を作業場に置いていなかった。そのため ICN 6 件が作られず、`references.state: unresolved` が 6 件出た（UC02・UC10） | `fixtures/assets/` にダミーの素材を置き、作業場の `fixtures/incoming/img/`・`cad/` に複製するようにした |
| K-02 | UC10 の壊れた検体の名前が `broken.XML`・`empty.XML` で、`DMC-` の接頭辞が無いため、`verify_csdb` の対象にならなかった（core `csdb-source.ts` 96 行目） | DMC の形の名前に変えた |
| K-03 | 評価の物差しの「条件付きで使える」に「依頼文に無い情報を自分で補う必要があった」を入れていたため、採番を任せた UC まで「条件付き」になった | 定義を改め、前提として用意した設定と、依頼文が任せた値は段階を下げる理由にしないと書いた |
| K-04 | 最初の SETUP（SETUP-pre）は製品リポジトリを cwd にしたため、Grok が README の「依頼者の控え」を読んだ | やり直した SETUP 以降は作業場で実施した。SETUP-pre は参考に留める |

## 6. 次にすること

1. F-01〜F-05・F-07 は、2026-11-05 に各リポジトリの Issue にした（上の表のリンク）。F-06 は出どころを確かめてから Issue にする。
2. F-08〜F-14 は、ソースで確かめてから Issue にする。
3. D-01〜D-06 は、次の版で説明文を直すときにまとめて入れる。
4. S-01・S-02 は Skill の次の版で直す。
5. K-01〜K-03 を直したキットで、UC02 と UC10 をやり直す。
