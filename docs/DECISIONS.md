# 決定事項と未決事項

s1000d-stack で決めたことと、その理由を記録します。日付は JST です。

## 決定事項

> [!NOTE]
> D-01〜D-20（2026-10-22〜2026-10-26 の決定）は、[DECISIONS-archive.md](./DECISIONS-archive.md) に分けました（2026-11-20）。文書を小さくするために分けたもので、決定は取り消していません。

### D-21 ロゴは六角形のスタックにする（2026-10-26）

六角形の枠の中に 3 段のバーを重ね、中段のバーが枠の外の点へつながる形です（`site/src/assets/logo/c-light.svg`、ダーク版は `c-dark.svg`、favicon は `favicon-c.svg` = `site/public/favicon.svg`）。紺 #1E3A7B と青緑 #139A9A の 2 色で、ダーク版は紺を #DCE6F7 に置き換えます。

- 六角形 = CSDB（データモジュールの格納庫）、3 段のバー = 積み重なったデータモジュール（stack）、青緑の中段と外の点 = 検査を通った結果だけを LLM に渡す（XML も適用性の式も見せない。D-18・reader の方針）。
- S のモノグラム案（pdf-agent-stack の P に揃える案）は、将来 S2000M など S1000D 以外の ASD 仕様の MCP を作ったときに文字が合わなくなるため採りませんでした。六角形の枠を共通の器にし、中身を仕様ごとに変えれば同じ系列に見せられます。
- ASD の S1000D 公式ロゴの要素（書体・配色・形）は使っていません（D-02）。
- 表示箇所はサイトのヘッダー（`astro.config.mjs` の `logo`、題名の文字は残す）、トップページの hero（`index.mdx` の `hero.image`）、favicon の 3 つです。

### D-22 英語をルートにし、日本語を /ja/ と README.ja.md で提供する（2026-10-26）

サイトと各リポジトリの README を、pdf-agent-stack と同じ構成にします。

| 対象 | 英語 | 日本語 |
|---|---|---|
| サイト | `site/src/content/docs/` 直下（ルート locale、`lang: en`） | `site/src/content/docs/ja/`（`/s1000d-stack/ja/…`） |
| README | `README.md`（冒頭に `**English** \| [日本語](./README.ja.md)`） | `README.ja.md` |
| `package.json` の description、ツールの description、応答の `reason` 文 | 英語（すでに英語） | — |
| `docs/`（DECISIONS・ROADMAP・notes） | — | 日本語のまま（開発メモ） |

- 理由: 利用者の大半は海外（ASD・AIA・A4A の会員企業）で、npm と MCP のレジストリは英語で検索される。パッケージの説明文がすでに英語なので、README とサイトだけ日本語では整合しない。pdf-agent-stack の i18n 方針（ルート = 英語、`/ja/` = 日本語、一次執筆は日本語）に揃える。
- 一次執筆は日本語。英語は翻訳先で、日本語から訳し仕様書の英文は開かない（D-03）。用語は `notes/glossary.md`、書き方は `notes/en-writing-guide.md`。
- Starlight の fallback は英語 → 日本語の一方向（英語ページが無いとルートが 404）なので、**ページの完了条件は「日本語と英語の両方が揃うこと」**にする。
- 公開（作業 10、D-16）の前に行う。公開後に日本語を `/` から `/ja/` へ動かすと外部リンクが切れるため。
- 翻訳は Claude で行い xcomet で採点、低得点の文は DeepL の訳と比べて採用する。最初の 1 ページ（`guide/overview.md`）は Claude と DeepL の両方で訳して比較し、以後の分担を決める。
- **実施済み（2026-10-26）**: サイト 13 ページと README 6 本を英語化し、`site/scripts/check-i18n.mjs`（`npm run check:i18n`）で ja / en の構造の一致を検査する。`scripts/generate-stack.mjs --readme` は README.md と README.ja.md の両方の表を更新する。経過は `notes/i18n-trial.md`。

### D-23 MCP サーバーは MCP Registry と claude-plugins marketplace に載せ、ライブラリは載せない（2026-10-27）

- 対象は s1000d-brex-mcp・s1000d-verify-mcp・s1000d-reader-mcp の 3 本。s1000d-core と experiential-manual-model はライブラリなので、どちらにも載せません。
- MCP Registry: 名前は `io.github.shuji-bonji/<repo>`。`package.json` の `mcpName` とリポジトリ直下の `server.json`（npm には同梱しない）で登録し、版を上げるたびに `mcp-publisher publish` を手で実行します（pdf-agent-stack の `docs/specs/30-registry-and-marketplace-release.md` と同じ手順）。Registry は npm に公開済みの版の `mcpName` で所有を確かめるため、登録には `mcpName` 入りの版が必要で、0.1.1 をそのために出しました。
- claude-plugins marketplace（`shuji-bonji/claude-plugins`）: MCP 1 本につき plugin 1 件（pdf family と同じ）。各リポジトリの `.claude-plugin/plugin.json` が実体で、marketplace.json は一覧用の台帳。category は `s1000d` を新設しました。
- plugin の `mcpServers` には `env` を書きません。`S1000D_SPEC_DIR` と `S1000D_CSDB_DIR` は Claude Code を起動するシェルの環境変数が子プロセスに引き継がれる形で渡します。`${VAR}` 展開が plugin の `mcpServers` で効くか未確認で、展開されずに文字列のまま渡ると既定 BREX が見つからない失敗になるためです。README と marketplace の「利用上の注意」に書いて補います。
- 版が乗る場所は 5 つ（`package.json`、`plugin.json`、`server.json` の 2 か所、npm、marketplace.json）。`scripts/sync-plugin-version.mjs` を `npm version` の version フックに掛けて前の 3 つを揃え、marketplace.json は claude-plugins 側で `node scripts/marketplace-version-check.mjs --write` で揃えます。
- **実施済み（2026-10-27 JST）**: 3 本の 0.1.1 を `publish.yml` 経由で npm に公開（03:37〜03:39）、MCP Registry に `active` で登録（03:48〜03:49）、claude-plugins 0.7.0 に収録（`4d8df7b`）。`claude plugin install s1000d-brex-mcp@shuji-bonji` が成功することを確認。

### D-24 MCP は公開版（plugin）と開発版（-dev）の 2 本立てで使う（2026-10-27）

- 普段使うのは claude-plugins で入れた公開版（`s1000d-brex` / `s1000d-verify` / `s1000d-reader`。npm の最新版を `npx` で起動）。開発中の確認には、手元のビルドを起動する開発版（`s1000d-brex-dev` / `s1000d-verify-dev` / `s1000d-reader-dev`）を使う。pdf・houki・rfcxml と同じ運用。
- 理由は 3 つ。(1) 公開前の変更（core の公開待ちの機能など）を、普段の利用と分けて試せる。(2) 公開版を利用者と同じ形で確かめられる。(3) 結果が変わる変更（NOTATION の照合の修正など）で、同じ DM を両方に通して比べられる。houki が分ける主な理由（DB の共有で公開版が壊れる）は、ファイルを読むだけの s1000d には当たらない。
- 開発版は Claude Desktop の `claude_desktop_config.json` に登録する（2026-10-27 に利用者が登録）。`command` は `node`、`args` は `/Users/bonji/workspace/shuji-bonji/s1000d-stack/mcp/s1000d-*-mcp/dist/index.js`、`env` に `S1000D_SPEC_DIR` を絶対パスで書く（JSON では `~` が展開されない）。接尾辞は `-dev`（pdf の `-local` には揃えない）。
- 開発版のビルドは Mac で `npm install && npm run build`。VM の `~/vmrun.sh` は別の場所にコピーして動かすので、Mac の `dist` とはぶつからない。未公開の core を試すときは MCP 側で `npm install ../../lib/s1000d-core --no-save` などで差し替える。

### D-25 配布物と CSDB の場所は、環境変数が無ければ設定ファイルから読む（2026-10-27、D-23 の補足）

- `S1000D_SPEC_DIR` / `S1000D_CSDB_DIR` が無いときは、設定ファイル `~/.config/s1000d-stack/config.json`（`XDG_CONFIG_HOME` に従う。`S1000D_CONFIG` で場所を変えられる）の `specDir` / `csdbDirs` を読む。処理は core の `resolveStackConfig`（D-10・D-17 と同じく MCP 3 本で共有）。
- 理由: 2026-10-27 に確かめたところ、Claude Desktop は plugin で入れたサーバーに `S1000D_SPEC_DIR` を渡さなかった。`launchctl setenv` で Desktop 自身に値を入れ、起動し直しても届かない（MCP SDK の stdio クライアントは、設定に `env` が無いと `HOME`・`PATH` など決まった変数しか子プロセスに渡さないためと推定）。plugin の `env` に `${VAR}` を書く方法（pdf-spec の形）も、Desktop は置き換えずに文字のまま渡すので使えない（pdf-spec の plugin 版は Desktop で `REGISTRY_ERROR` になることを同日に確認）。設定ファイルなら `HOME` さえ渡れば読める。
- D-23 の「plugin の `mcpServers` に `env` を書かない」は変えない。`env` に `${VAR}` を書くと、Desktop では文字の `${VAR}` が値として渡り、設定ファイルへ戻る判断がしにくくなるため。念のため、置き換えられずに渡った `${VAR}` / `$VAR` は使わずに設定ファイルへ戻り、応答の `_notes` に理由を書く。
- 環境変数があればそちらを優先する（開発版の `env`、Claude Code を起動するシェル）。設定ファイルは呼び出しのたびに読み直す。
- 試して効かなかった `launchctl setenv` の LaunchAgent（`~/Library/LaunchAgents/io.github.shuji-bonji.s1000d-env.plist`）は片付ける（`launchctl unsetenv S1000D_SPEC_DIR` と plist の削除）。
- 実装: core の `1fa516b`（0.4.0 として未公開）、brex-mcp `77df929`・verify-mcp `4762484`・reader-mcp `361354b`（未 push。core 0.4.0 の公開後に依存を上げる）。

### D-26 DML・DDN の照合は verify-mcp の `reconcile_dml` が行い、reader-mcp は集計だけを返す（2026-10-28）

- DML（データモジュールリスト）・DDN（納入票）と CSDB との照合（段階 2.5 の作業 5）は、処理を core（`readDml` / `readDdn` / `reconcileDml` / `reconcileDdn`、0.6.0）に置き、MCP 側は次の分担にする。
  - **verify-mcp**: 7 本目のツール `reconcile_dml` が、行ごとの結果（`found` / `issue-mismatch` / `not-found` / `not-checked`）と、DML に載っていない DM・PM（`notListed`）を返す。`path` / `xml` を省くと CSDB の DML・DDN をすべて照合する。`verify_csdb` には混ぜない（`verify_csdb` は中身の検証、`reconcile_dml` は識別子と版の照合で、入力も出力の形も違う）。
  - **reader-mcp**: `list_data_modules` の `include` に `dml` / `ddn` を渡したとき、行にコード・発行日・行数と照合の集計（件数）だけを付ける。行ごとの結果は verify-mcp に任せ、reader は「CSDB に何があるか」を見渡す役に留める。
- 理由: 照合は「検証（verify）」の仲間（プロジェクト管理の土台、D-19 の最低限の要件の隣）であり、1 つのツールに入力の形（DML か DDN か、省略で全件）をまとめた方が LLM に説明しやすい。reader にも同じ結果を全部返すと 2 本の応答が重複する。
- `dmlType`（c / p / s）・`dmlEntryType`（c / d / n）・`issueType` の意味は解釈せず、列挙のまま返す。意味を付けるのは仕様書の該当章を読んでから（notes/background.md）。
- 実装: core `cdc5c25`（0.6.0 で公開）、verify-mcp `c741b4c`、reader-mcp `c9c9aeb`（2026-10-28、未公開）。

### D-27 データモジュールの組み立て（writer の処理）も s1000d-core に置く（2026-10-28）

- 段階 3 の writer の処理（`DraftDataModule` から XML を組み立てる `buildDataModule` / `buildContent`、採番 `allocateDmc` / `allocateIcn` / `allocatePmc`、修正候補の適用 `applyFix`、comment DM の `buildComment`、翻訳向けの `extractSegments` / `applySegments`、書き込める置き場所 `WritableCsdbSource`）は、D-10・D-17 と同じく s1000d-core に置き、s1000d-writer-mcp はそれを呼ぶだけにする。
- 理由: `buildContent` は reader の `ContentNode` の型（読んで書き戻すと同じ木になることをテストで固定する）と、修正提案の `XsdIndex`・`CsdbIndex` を共有する。別パッケージにすると、これらの型と索引を core から公開し直す手間が先に要る。
- core が大きくなったら、書く側だけを `@shuji-bonji/s1000d-build`（仮）に分ける（D-10 の末尾と同じ）。分けるときも MCP 側に処理を持たせない。
- 情報コード（`infoCode`）の既定は持たせない。`Allocation.rules.infoCodeByKind` を必須にし、省略は入力の誤りとして返す。情報コードの意味は仕様書の該当章を読んでから付け、券売機の例の値は Skill `experience-to-s1000d` の設定例に置く。
- writer は状態を持たない。採番の台帳（`ledger`）は入力で受け取り応答で返し、保管は呼び出す側（Skill・作成ツール・製品）の仕事にする。
- 設計は [design/writer-mcp.md](./design/writer-mcp.md)。

### D-28 Skill は 1 つにリポジトリ 1 つ、作成ツールは SvelteKit ＋ PWA で作る（2026-10-28）

- U-09 の判断。Skill のリポジトリは `shuji-bonji/<名前>-skill`、plugin 名とフォルダー名は `<名前>` にする（pdf-trust-skill・houki-research-skill と同じ）。ローカルは `s1000d-stack/skill/<名前>-skill`。段階 3 の Skill は `experience-to-s1000d`・`s1000d-publish`・`s1000d-review`・`s1000d-translate` の 4 つ。リポジトリの形は pdf-agent-stack の `skill/pdf-trust-skill` に揃える（`skills/<名前>/SKILL.md` ＋ `references/`、`evals/trigger-eval.json`、タグ push で `.plugin` を作る `release.yml`、`plugin.json` の `dependencies`）。
- U-10 の判断。作成ツールの試作と、段階 4 の簡易 Web マニュアルは SvelteKit ＋ PWA（`adapter-static`、GitHub Pages）で作る。利用者が習得中で、静的に置けてオフラインでも動くため。
- U-05 は未決のまま。試作の間は仮称 `manual-editor`（リポジトリ `shuji-bonji/manual-editor`、ローカル `s1000d-stack/app/manual-editor`）。
- GitHub のリポジトリ（Skill 4 つと manual-editor）は利用者が Private で作り、中身はチャットで作る。
- 設計は [design/skills-and-editor.md](./design/skills-and-editor.md)。

### D-29 製品は 2 つの別プロジェクトに分け、s1000d-stack は基盤に専念する（2026-11-07）

- 作成ツール・閲覧ソフト（段階 3 の試作と段階 4）を s1000d-stack から切り離し、次の 2 つの別プロジェクトにする。s1000d-stack は core・MCP・Skill・experiential-manual-model の**基盤**だけを持ち、製品を持たない。
  - **体験型マニュアル**（一般向けの製品。名前は U-05）: `experiential-manual-model` を読み書きする player（Svelte の部品 ＋ Web Components `<experiential-manual>`）、editor、cli（`validate` / `build` / `to-s1000d`）。速く作り、実例（e-shiwake のヘルプ）で直す。
  - **IETM / IETP**（産業向けの製品）: S1000D の CSDB を表示する Web の閲覧ソフト（IETP の最小形）から始め、作成・公開まで広げる。仕様書を読みながらじっくり進める。段階 4 の「簡易な技術マニュアルの Web システム」（[design/agent-platform.md](./design/agent-platform.md)「参照実装」）はここへ移す。
- 理由は 3 つ。(1) 進め方の速さが違う。同じ ROADMAP に置くと、片方の判断がもう片方を止める。(2) 体験型マニュアルは「画面の操作」を題材にした一般向けの製品で、S1000D の名前を付けない（D-01）。IETM / IETP は S1000D の CSDB を扱う産業向けの製品で、利用者も題材も違う。(3) D-19 の「製品は基盤の最初の利用者」は、製品が別のプロジェクトにあっても成り立つ。製品側で足りなかったものを core・MCP に戻す流れは変えない。
- 共有する部品の置き場所。`experiential-manual-model` は基盤（s1000d-stack の `lib/`）に残す（writer の `convert_manual` が使う）。図＋ホットスポットの表示部品（player の Stage）は体験型マニュアル側に置き、IETM / IETP 側は npm で取る。S1000D の語を持たない部品に IETP 側が依存するのは問題ない。逆（player が core に依存する）は作らない。
- IETM / IETP 側の CSDB の仕組み（版・状態・履歴・DML/DDN・権限）は、最初はフォルダー ＋ Git で代える。DB の CSDB は自分では作らず、製品ベンダーには `CsdbSource` の差し替え（D-19）で対応する。
- hub の整理。`stack.json` と README の表から `manual-editor` / `manual-viewer` の行を外し、`generate-stack.mjs` の EXTERNAL に 2 つのプロジェクトへの参照を置く。ROADMAP の「目指すもの」は 3（組み込み基盤）を主にし、1・2 は「この基盤を使う製品」として参照する。段階 4 の行は IETM / IETP プロジェクトへの参照に置き換える。`app/manual-editor` の作業コピーは、体験型マニュアルのプロジェクトのフォルダーへ移す（hub の `.gitignore` の `/app/` は残してよい）。
- 検討の経過は [notes/editor-and-viewer-study.md](./notes/editor-and-viewer-study.md)、画面設計の草案は [design/player-and-editor.md](./design/player-and-editor.md)。どちらも体験型マニュアルのプロジェクトへ移す対象だが、決定の根拠として hub にも残す。IETM / IETP の最初の文書の下書きは [notes/ietp-kickoff.md](./notes/ietp-kickoff.md)。

### D-30 体験型マニュアルの製品名は Experiential Manual にする（2026-11-14）

- U-05 の判断。製品の共通の語を **Experiential Manual** とし、作成ツールを **Experiential Manual Editor**、閲覧部品を Experiential Manual Player、CLI を Experiential Manual CLI と呼ぶ。
- 理由は 3 つ。(1) 公開済みの `@shuji-bonji/experiential-manual-model`、仮称で作ってきた `@shuji-bonji/experiential-manual-player`、Web Components の `<experiential-manual>` と同じ語になり、既存の名前を変えずに済む。(2) "Manual Editor" だけでは、英語で「手動のエディター」とも読める。前に "Experiential" が付くと manual は名詞としか読めない。(3) "Operation" は付けない。Topic には説明（`description`）と困ったとき（`troubleshooting`）もあり、`Screen` の画像は操作パネルの写真や分解図でもよいので、「操作」に限ると名前が中身より狭くなる。
- 比べた案は Manual Editor、Operation Manual Editor、Experiential Operation Manual Editor。
- "experiential" は一般の利用者になじみの薄い語なので、説明文の 1 行目で「押して進める操作マニュアル」のように言い換えて補う。
- 同名の製品・商標の有無は、この時点では調べていない。npm は `@shuji-bonji` のスコープの下なので、名前の衝突は起きない。
- 残る作業は製品側（manual-editor の `docs/notes/handoff.md`）: README と画面の題名から「仮称」を外す、player の npm 名を `@shuji-bonji/experiential-manual-player` で確定する、GitHub のリポジトリ名 `manual-editor` を変えるかを決める。IETM / IETP のプロジェクト名は別に決める。

### D-31 s1000d-core は S1000D の構造を出発点にし、experiential-manual-model の都合で形を決めない（2026-11-15）

- s1000d-core と experiential-manual-model は目的が違う。experiential-manual-model は一般向けの体験型マニュアルのデータモデルで、S1000D に準じる厳密さを求めない。s1000d-core は IETM / IETP の作成ツール・閲覧ソフトでも使うので、S1000D に準じる厳密さを重視する。s1000d-stack（core・MCP・Skill）は、体験型マニュアルと IETM / IETP のどちらの作成ツールからも独立している（D-29 の補足）。
- core の読み書きの形（`ContentNode`・`DraftNode`）を足す・変えるときは、XSD の構造と配布物（Bike Samples）の実測から決め、core の設計文書に書く。experiential-manual-model との対応は、writer-mcp の変換関数（D-09）と、model の側の設計文書に置く。model で表したいことが core で書けないときは、model の形に合わせて core を狭く作らず、S1000D の構造として足りないものを core に足す。
- 読む側（`readContent`）は落とさない。構造として返せないものは、`unknown`・`attrs`・`notes` であることを知らせる。
- 新しく作る側（`DraftNode` → `buildContent`）は S1000D の部分集合でよい。書けない構造を設計文書に明記し、渡されたら入力の誤りにする。検証を通すために値を補わない。
- 既にある DM を直すときは、元の XML を保ったまま、その場所だけを直す（`applyFix`・`applySegments` と同じやり方）。読んだ木を下書きに写して作り直す経路は、既にある DM の編集に使わない（2026-11-15 08:26 JST に利用者が採用）。
- どこまで扱えているかは、配布物のテストで数えて固定し、減らす方向にだけ動かす（最初は `preliminaryRqmts`。2026-11-15 の実測は、Bike Samples の 41 件で要素・属性 2,527 個のうち、最初は 898 個、人員・文書・条件の形を直した後は 631 個が往復で失われる。reader が読まずに知らせてもいない要素は 0 種類）。
- きっかけ: 2026-11-15 に、実在の技術マニュアルを使った確認の要望（W-1）として、core の下書きの `requirements` に人員・文書・品目を足した。その形を experiential-manual-model の 7 つの区分から決め、model の設計文書の中で決めていた。利用者の指摘で見直した。
- 設計は [design/core-preliminary-rqmts.md](./design/core-preliminary-rqmts.md)。読む・新しく作る・既にある DM を直す、の 3 つの経路を分ける方針と、公開の前に変える範囲は、同じ文書の「決まったこと」にある。
- 既にある DM の構造を変える編集（節点を足す・取り除く・移す）の決定は D-32。

### D-32 既にある DM の構造を変える編集は、層を分け、編集した範囲だけを書き換える（2026-11-17）

D-31 の「既にある DM は元の XML を保ったまま直す」を、節点を足す・取り除く・移す編集に当てたときの決定。core の `editContent`（0.13.0）、writer-mcp の `edit_data_module`（0.5.0）、reader-mcp の `includeLocation`（0.12.0）、Skill `s1000d-publish` の `references/edit.md`（0.3.0）として公開した。

- **文字列の保ち方**: 元の文字列の、編集した範囲だけを書き換える。文書要素の全体を直列化し直さない。`applyFix`・`applySegments` の方法（DOM を直列化し直す）では、Bike Samples の DMC・PMC 110 件を何も変えずに戻しても、91,215 行のうち 26,258 行（29 %）が変わるため。
- **層を分ける**: 層 1（`editContent`）は、版（`issueInfo`）も変更の印（`changeType`・`changeMark`・`reasonForUpdate`）も変えない。層 2（改版。作業中の版を始める操作と、変更の印を付ける指定）は別の設計文書にする。
- **発行済みの版**: 層 1 だけの間、`inWork` が `00` の DM は、利用者が明示したとき（`allowReleasedIssue: true`）だけ編集する。Skill は、自分の判断でこの値を渡さない。
- **XSD のエラーが増えたとき**: 編集の前には無かった XSD のエラーが出た結果は、`write: true` でも書き込まず、増えたエラー（`newSchemaErrors[]`）を返す。
- **ほかの DM・PM からの参照**: 編集で無くなった `id` を、CSDB のほかの DM・PM の `dmRef/@referredFragment` が指しているときは、`referencedFromOtherObjects[]` に返して書き込まない（2026-11-17 09:15 JST ごろ。実装で決めていた動きを、利用者がそのまま採用）。
- **最初の版の対象**: 手順（`proceduralStep`）、段落、警告・注意・注記、リストの項目。節点の置き換え（replace）は入れない（reader が読んでいない属性と、下書きに書けない構造を落とすので、作り直しと同じ結果になる）。
- **Skill の置き場所**: `s1000d-publish` に書く。別の Skill にしない。
- **手順の段落の場所**: reader は、手順の直下の子を持たない段落を、手順の節点の `text` にまとめて返すので、その段落には `location` が付かない。`includeLocation: true` のときだけ、手順の節点に `textLocations[]`（まとめた段落ごとの場所を、並びの順に）を添える（2026-11-17 09:15 JST ごろ。core 0.14.0、reader-mcp 0.13.0 で実装した。リストの項目には付けない。D-34）。
- 決めていないこと: `applyFix`・`applySegments` を同じ方法に寄せるか（差分を測ってから決める）。層 2 での `move` の変更の印は D-33 で決めた。
- 設計と実測は [design/core-structural-edit.md](./design/core-structural-edit.md)、層 2 は [design/core-revision.md](./design/core-revision.md)。

### D-33 改版（層 2）は、作業中の版を始める操作と、変更の印を付ける指定に分ける（2026-11-17）

D-32 の層 2 の決定。2026-11-17 09:56 JST に、利用者が設計文書の R-1〜R-8 をすべて提案どおりと決めた。core の `startRevision` と `editContent` の `marking`（0.15.0）、writer-mcp の `start_revision` と `edit_data_module` の `marking`（0.6.0）、Skill `s1000d-publish` の `references/edit.md`（0.4.0）として、2026-11-18 に公開した。実装のときに決めた 3 つは D-35。

- **作業中の版を始める操作**（core は `startRevision`、writer-mcp は `start_revision`）: `inWork` を `01` にし、新しい版のファイル名で書く。元のファイルは変えない。`issueType` は入力で必ず受け取る（`changed`・`revised`・`status`）。core は決めない（R-1）。
- **`001-00` から始めるときの `issueType`**: 仕様書の Chap 3.9.5.1 の Table 3（`001-01` は `new`）と、既定 BREX の BREX-S1-00030（`001-01` の `new` は違反）が食い違う。`new` のままにする値も入力で選べるようにし、選んだ結果が既定 BREX に違反することを応答で知らせる（R-1）。
- **前の版の変更の印**: 作業中の版を始めるときに、印の属性・`changeInline` のタグ・`reasonForUpdate` を消し、`changeType="delete"` の要素は取り除く。`delete` の要素を取り除くことは、読んだ範囲の仕様書に明記が無く、解釈である（2026-11-18 に Chap 3.5 の全体を読んだが、記述は無かった）。取り除く要素の `id` を指す参照が残っていれば断る（R-2）。
- **変更の印を付ける指定**（`editContent` の `marking`）: insert は `changeType="add"`、remove は `changeType="delete"` を付けて残す。この作業中の版で足した要素（`add` の印を持つ）の remove は、印を付けずに取り除く。`reasonForUpdate` を 1 つ足し、同じ呼び出しの編集はすべてそれを指す。
- **`move` の印**: 同じ親の中の移動は、親の要素に `changeType="modify"` を付ける。親が変わる移動は断る（利用者が remove と insert で指定する）。仕様書に移動の決まりは無い（R-3。2026-11-18 に仕様書の全文を語で探して確かめた）。印の属性を持てない親（`description`・`procedure` など）の中の移動も断る。
- **入力**: `updateReasonType` と `changeMark` は必須（値を補わない）。`reasonForUpdate/@id` は、省略時に core が文書に無い値を作る（R-4・R-5）。
- **範囲に入れないもの**: 発行の操作（R-6）。編集のたびに `inWork` を上げること（R-7）。表・図の印は、対象の節点を表の行・図に広げるときに扱う（R-8）。
- **先に要る作業**: reader（core の読み取り）は、識別・状態部の `reasonForUpdate` と、変更の印の属性を返していない。層 2 の実装の前に、読み取りに足す（D-31 の「読む側は落とさない」）。返す形は D-34。
- 設計、実装の結果、仕様書で確かめたこと、残っている確認は [design/core-revision.md](./design/core-revision.md)。

### D-34 更新の理由と変更の印は、節点と、DM 全体の一覧の両方に返す（2026-11-17）

D-33 の「先に要る作業」の決定。2026-11-17 10:40 JST ごろに、利用者が 3 つの案から選んだ。core 0.14.0 と reader-mcp 0.13.0 として、2026-11-17 に公開した。

- **更新の理由**: `IdentAndStatus.reasonForUpdates[]` に、`dmStatus/reasonForUpdate` を並びの順に返す（`id`・`updateReasonType`・`updateHighlight`・`applicRefId`・そのほかの属性・段落の文）。
- **変更の印**: 節点と参照の `change`（`changeType`・`changeMark`・`reasonForUpdateRefIds`）と、DM 全体の一覧 `DataModuleContent.changeMarks[]`（要素名・場所・3 つの属性）の両方に返す。一覧には、節点にならない要素（`title`、表の `row`、手順の `text` にまとめた `para`、行内の `changeInline`）と、本文を構造化して読まない種類の DM の要素も入る。
- **理由**: Issue 7 の `proced.xsd` では、233 の型のうち 136 が印の属性を持てて、その多くは節点にならない。Bike Samples で印を持つ要素 14 個のうち 12 個は、本文を構造化して読まない `wrngdata` の DM にある。節点だけに返す案では、この 12 個が数だけになる。一覧だけに返す案では、節点の印を知るのに場所の突き合わせが要る。
- **値は解釈しない**: 書かれた値のまま返す。`updateReasonType` の値の意味、何が変わったか、印の付け方が仕様書の決まりに合っているかは、core は言わない。
- **`textLocations[]` の範囲**: 手順の節点だけに付ける。リストの項目（段落が 1 つのときに、その段落を `text` にまとめる）には付けない。段落を取り除くと項目が空になり、XSD のエラーになるため、項目そのものを編集の対象にする。
- 読んでいないもの: PM の `pmStatus/reasonForUpdate`。
- 形と実測は [design/core-revision.md](./design/core-revision.md) の「読み取りに足したもの」。

### D-35 更新の理由は、足す入口と、既にあるものを指す入口を分ける（2026-11-18）

D-33 の実装のときの決定。2026-11-18 に、利用者が 3 つを決めた。core 0.15.0、writer-mcp 0.6.0、Skill `s1000d-publish` 0.4.0 として、同じ日に公開した。

- **既にある `reasonForUpdate` を指す入口**（10:21 JST）: `editContent` の `marking` は、`reason`（新しい `reasonForUpdate` を足す）と `reasonRefId`（識別・状態部に既にある `reasonForUpdate` の `id`）の、どちらか一方だけを受け取る。`reasonRefId` のときは、識別・状態部を変えず、付けた印がその `id` を指す。同じ理由の変更は同じ `reasonForUpdate` を指す、という決まり（Chap 3.9.5.2.1.1 Para 2.1.3）に沿うためである。決める前は、`marking` を渡した呼び出しのたびに `reasonForUpdate` が 1 つ増えた。
- **印を付けずに `reasonForUpdate` だけを足す入口**（10:40 JST）: core に `addReasonForUpdate` を足す。本文には触らず、変更の印も付けない。編集上の変更（`urt01`。この理由に結び付く変更の印があってはならない）と、`issueType` が `revised`・`status` の版で使う。`startRevision` は前の版の `reasonForUpdate` をすべて取り除くので、`revised`・`status` で始めた版は、`issueNumber` が `000`・`001` でなければ、既定 BREX の BREX-S1-00038 に違反する（Bike Samples で実測した）。D-33 の R-4 で「実装のときに決める」としていた項目である。
- **writer-mcp の入口の形**（10:57 JST）: `start_revision` の入力で理由（`reason`）を受け取り、理由だけを足すツール（`add_reason_for_update`）も別に作る（案 C）。`start_revision` は、理由を足せないときは版も始めない。
- **使い分け**: その理由による最初の編集は `marking.reason`、同じ理由による 2 回目からの編集は `marking.reasonRefId`、変更の印を付けない変更の理由は `addReasonForUpdate`。Skill は、どれを使うかを決めるための問い（変更の種類、理由の文、`updateReasonType`、`changeMark`）を利用者に聞き、自分で決めない。
- 決めていないこと: PM の `pmStatus/reasonForUpdate` の読み取り。reader の `section: "outline"` と `includeLocation: true` の組で `textLocations` が付かないことの扱い。
- 実装の結果と確認は [design/core-revision.md](./design/core-revision.md) の「実装」と「テストと確認の結果」、記録は [notes/tm-eval-handoff-8.md](./notes/tm-eval-handoff-8.md)。

### D-36 入門の続編は Zenn Book に書き、S1000D と Stack のリファレンスはサイトに置く（2026-11-21）

Issue #10（「S1000D入門」の次に実践編を作る）の検討の結果。利用者が 2026-11-21 13:13 JST ごろに方向を示し、2026-11-22 に決定として記録することを了承した。サイトのリファレンスは D-37 で実装した。続編は未着手。

- **続編**: Zenn Book「S1000D入門」の続きとして書く。読者は入門を読み終えた人で、データモジュールを作る人と、S1000D を処理するコードを書く人を分けない。2 つの立場で要る S1000D の知識はほぼ同じで、違いは CSDB の構築、検証の内部（XSD・XPath・正規表現）、表示と出力に限られる。商用の製品を持たない読者は、作る立場でもこれらを自分で行う。
- **サイト**: 属性と値を引く「S1000D リファレンス」と、MCP のツールを引く「Stack リファレンス」を置く。どちらも手で書かず、既定 BREX・XSD・`tools/list` の応答から生成する。
- **分ける基準**: 内容が変わる頻度。S1000D の決まりと自作の DM の例は Issue が変わるまで変わらないので本に書く。ツール名・引数・応答は MCP の版が上がるたびに変わるのでサイトに置く。本には値の一覧とツールの引数を書かず、サイトへのリンクにする。
- **理由**: 公式サイト（s1000d.org）のメニューに、チュートリアルや教育用の文書が無い（2026-11-21 に確認）。見つかった有料の講座は、作成担当者と製品の利用者が対象である。検索サービスの AI が返した `updateReasonType` の説明を既定 BREX（BREX-S1-00242）と照合すると、値の意味が 2 か所ずれていた（2026-11-20）。
- **分かっていないこと**: 「S1000D入門」は需要が無かった（Issue #10）。続編で読者が増える裏付けは無い。Zenn Book は日本語の読者にしか届かない。英語で届けたい章が出たら、その章をサイトに英語で書く。
- 対応する Issue: 続編は #10、Stack リファレンスは #9、S1000D リファレンスは #11。
- 決めていないこと: 続編の章立て。値のコードをまとめて載せる範囲（U-11）。リファレンスの設計の SR-1〜SR-9 は D-37 で決めた。
- 設計は [design/site-reference.md](./design/site-reference.md)。

### D-37 リファレンスの SR-1〜SR-9 は提案のとおりにし、17 属性とツール 27 個のページを生成する（2026-11-22）

D-36 の設計（[design/site-reference.md](./design/site-reference.md)）の決定。2026-11-22 に、利用者が作る範囲として「17 属性まで全部」を選び、SR-1〜SR-9 を提案のとおりに進めることを了承した。同じ日に、ブランチ `feature/site-reference` に実装した（未マージ）。

- **S1000D リファレンス**: 属性 1 つを 1 ページにする。区分の名前は「S1000D リファレンス（非公式）」。URL に版を入れる（`reference/s1000d/issue-7/<属性名>/`）。ページを作るのは、手書きの欄を書いた 17 属性だけ（U-11 は未決のまま）。出典には、オンラインのデータ辞書（`users.s1000d.org/S1000D_DD_7`）の属性のページへのリンクを置く。
- **Stack リファレンス**: MCP のツール 27 個を、1 つ 1 ページにする。Skill はいまのページのままにし、s1000d-core の関数は別の Issue に分ける。
- **生成**: `scripts/generate-reference.mjs` が作る。配布物から取り出した値（属性名・要素名・型・値のコード・ルール ID・章の番号だけ）と、`tools/list` の写しをコミットし、CI（`reference-check.yml`）は仕様書も MCP も使わずに照合する。
- **設計から変えた点**: `tools/list` は CI で取らず、手元で集めた写しをコミットする。日本語の Stack リファレンスは、訳を持たず、`tools/list` の説明と引数の説明を原文（英語）のまま載せる（概要は `ja/mcp/*.md` の表の文を使う）。`extract` は s1000d-core ではなく `@xmldom/xmldom` で直接読む。
- **分かったこと**: writer-mcp の `inputSchema` に日本語の説明がある（5 ツールで、それぞれ約 100 個）。D-22 と合わないので、writer-mcp の側で直す。
- 残っていること: 手書きの欄の「値の選び方」の確認。英語の訳の採点（16 属性）。Stack リファレンスの「応答の例」「使う場面」。日本語の引数の説明を訳すか。残りの属性（U-11）。
- 実装の結果と確認は [design/site-reference.md](./design/site-reference.md) の「実装の結果」。

### D-38 応答の最後に、答えたサーバーの名前と版、core の版を `_server` として載せる（2026-11-24）

[design/server-version.md](./design/server-version.md) の V-1〜V-6 の決定（Issue [#12](https://github.com/shuji-bonji/s1000d-stack/issues/12)）。2026-11-24 04:32 に、利用者がすべて提案どおりと決めた。

- **理由**: MCP の初期化の `serverInfo` はツールの結果として届かない（Grok Build の FINDINGS.md の H-04）。reader-mcp 0.14.0 の公開後も、Grok の reader のプロセスは公開前のコードのまま答え、応答からそれを見分けられなかった（REFCHECK-FINDINGS.md の H-06）。H-06 は core の版の違いで起きた。
- **形**: brex・verify・reader・writer の 4 本のすべてのツールの応答の最上位に、`"_server": { "name", "version", "core" }` を最後の項目として足す。`core` は実際に読み込まれている core の版。成功・想定内の失敗・想定外の失敗の 3 通りすべてに付ける。
- **作り**: core が `CORE_INFO`（`{ name, version }`）を公開する。各 MCP は `src/server.ts` の包みの 1 か所で足す。stdio と HTTP は同じ `buildServer()` を通るので、両方に効く。
- **使い方**: 4 つの Skill の報告に `_server` を書く欄を足す。Grok Build のキットの手順に、最初の呼び出しで `_server` を記録し、npm の公開版と比べることを足す。npm と比べる手順は、キットだけに置き、Skill には入れない（Skill の利用者は npm を確かめる手段を持たないことがあるため。設計メモの「残っている確認」を実装のときにこう決めた）。

### D-39 「基盤」を 1 語で使わず、「S1000D の処理系」と「CSDB 製品への組み込み」に分けて書く（2026-11-25）

2026-11-25 16:15 に、利用者が決めた。

- **理由**: 「基盤」が 2 つの違うものを指していた。D-19 では「CSDB 製品に AI エージェントを組み込めるようにするための部品」、D-29 では「core・MCP・Skill・experiential-manual-model のまとまり（製品を持たない側）」。誰のためのものかが場所によって違い、「基盤の個別の機能」と書くと、発行の操作や DML の書き出しのような S1000D の処理の不足が、組み込みのための機能に見えた。
- **S1000D の処理系**: s1000d-core・MCP サーバー 4 本・Skill 4 つ・experiential-manual-model のまとまりを指す。S1000D の XML を、読む・検証する・組み立てる・直す。判定できることは core が行い、LLM には文章だけを任せる。使う側は 3 通りある。LLM のホストの利用者（Skill と MCP）、自分の製品プロジェクト（core と model）、他社の CSDB 製品（`CsdbSource` と HTTP）。
- **CSDB 製品への組み込み**: D-19 の目標を指すときだけ使う。処理系の使い道の 1 つ。要る仕組み（`CsdbSource`、HTTP、検証状態、機密区分）は段階 2.5 でそろっている。
- **直した文書**: ROADMAP、README（日本語・英語）、サイトの「全体構成」・トップページ・「CSDB 製品への組み込み」・MCP の 3 ページ、`generate-stack.mjs` と `stack.json` の注記。英語では、まとまりを指す `foundation` をやめ、`toolkit` か部品の名前で書く。
- **直していない文書**: D-19・D-29 の本文と、`design/`・`notes/` の文書。決めた当時の記録として、語をそのまま残す。
- **決めていないこと**: このプロジェクトの主題を「CSDB 製品への組み込み」のままにするか（U-12）。

### D-40 OSS の CSDB（RDB ＋ オブジェクトストレージ）を段階 6 として計画に入れ、その前に段階 5 で DML を書けるようにする（2026-11-25）

2026-11-25 17:39 に、利用者が決めた。

- **変えない方針**: CSDB の正本はフォルダー ＋ Git に置き、他社の CSDB 製品には `CsdbSource` で組み込める部品として渡す（[notes/ietp-kickoff.md](./notes/ietp-kickoff.md) の 4 節、D-19）。
- **足すこと**: その次の段階として、RDB とオブジェクトストレージで OSS の CSDB を作る（ROADMAP の段階 6）。ietp-kickoff.md の 4 節にある「DB の CSDB は作らない」は、IETM / IETP の最初の段階についての記述として残し、この決定で後の段階の計画に変える。
- **理由**: 2026-11-25 に調べた範囲では、実績のある CSDB は商用（RWS の Contenta、PTC の Arbortext CSDB、Boeing の S1000Dmanager、HENSOLDT の QuILS、Pennant の R4i など）だけで、OSS は s1kd-tools のフォルダーの CSDB だけだった。DB を持つ OSS の CSDB には、それだけで価値がある。
- **構成の前提**: 版・状態の履歴・参照・DMRL / CSL を RDB に、ICN の実体をオブジェクトストレージに置く。手元では SQLite とフォルダー、サーバーでは PostgreSQL と S3 互換のストレージを同じ表の設計で使う。NoSQL（ドキュメント DB・グラフ DB・検索エンジン・同期型の DB）は、使うとしても RDB から作り直せる派生のデータに限る。理由は、版の一意性・参照の整合・改版の原子性を DB 側で保証できることと、DM の本文が混合内容の XML で JSON に写しにくいこと。
- **段階 5 を先に置く理由**: DMRL（これから作る DM・PM の一覧）と CSL（CSDB にある CSDB オブジェクトの一覧）は、どの CSDB でも計画と納入に要る。段階 6 の表の設計（「計画した DM」と「作った DM」）にもつながる。設計は [design/core-dml-writing.md](./design/core-dml-writing.md)。
- **決めていないこと**: 段階 5 の DL-1〜DL-7（設計文書の 7 節）。段階 6 の置き場所（U-13）、利用者と権限・ワークフローを持つか、全文検索、DDN の書き出し。

### D-41 Issue 4.2 は、読む・検証する側はそのまま対象にし、作る側は版の指定だけを足す（2026-11-28）

2026-11-28 19:26 に、利用者が決めた。Issue [#14](https://github.com/shuji-bonji/s1000d-stack/issues/14) の実測（[notes/issue-4.2-survey.md](./notes/issue-4.2-survey.md)）を受けた決定で、U-07 を解決する。

- **読む・検証する側**: コードを変えずに Issue 4.2 の Bike Sample Data Set を扱えたので、版ごとに読み取りを分けない（[design/reader-mcp.md](./design/reader-mcp.md) の「Issue 4.2 と IMF」の問いへの答え）。
- **作る側**: 最低限の変更にとどめる。`buildDataModule`・`buildComment` に対象とする版（`options.issue`）を足し、`xsi:noNamespaceSchemaLocation` の版だけを切り替える。writer-mcp は `build_data_module`・`convert_manual`・`create_comment` の引数 `issue` で受ける。省いたときは Issue 7 のまま。
- **Issue 4.2 に無い要素**（`hazards`・`safetyInformation`・`infoNameVariant`・`controlAuthority` など）: 今回は扱わず、別の Issue にする（[#26](https://github.com/shuji-bonji/s1000d-stack/issues/26)）。それまでは、Issue 4.2 の XSD の検証で `invalid` になることで分かる。
- **既定 BREX の探索**: `findDefaultBrex` は、同じ DMC の既定 BREX が版を変えて複数あるとき、発行番号のいちばん大きいものを返す。`brexDmRef` をたどる側とそろえるため。DMC の違う既定 BREX の間では比べない。
- **Issue 4.0・4.1**: 配布物で動かして材料を集める（[notes/issue-4.0-4.1-survey.md](./notes/issue-4.0-4.1-survey.md)）。どこまで対応するかは U-14（D-42 で解決）。
- **実装**: s1000d-core 0.19.0、s1000d-writer-mcp 0.10.0。分けた Issue は #23〜#28（下書きは [notes/issue-14-followups.md](./notes/issue-14-followups.md)）。

### D-42 Issue 4.1 と Issue 4.0 系を、どちらも対象にする（2026-11-28）

2026-11-28 20:35 に、利用者が決めた。U-14 を解決する。材料は [notes/issue-4.0-4.1-survey.md](./notes/issue-4.0-4.1-survey.md)。

- **Issue 4.1**: 対象にする。Issue 4.2 に近く、版によらない問題を直した後は、読む側と検証する側が Issue 4.2 と同じ水準になる。残る作業は Issue [#27](https://github.com/shuji-bonji/s1000d-stack/issues/27)（テストへの数の追加、プロセス DM の `dmNode` の題名、乗員の手順の要素の確認）。
- **Issue 4.0 系（4.0・4.0.1・4.0.2）**: 対象にする。作る側まで対応するかは、Issue [#28](https://github.com/shuji-bonji/s1000d-stack/issues/28) の中で決める。**訂正（2026-11-29）**: 決めたときは「BREX の `allowedObjectFlag` の型が 2 値なので、BREX の読み取りを版で読み分ける必要がある」と書いたが、誤りだった。仕様書の Chap 4.10.2 で確かめると、`0`・`1` の意味は Issue 7 と同じで、属性を書かない場合が任意（Issue 4.1 以降の `2`）に当たる。core は元からそのとおりに照合していて、読み分けは要らない。違いは、ルールに識別子（`brDecisionRef`）が無いことと、DML の項目の要素名（`dmEntry`）で、後者は core 0.19.0 で読めるようにした。
- **版によらない問題**: 同じ日に直した（s1000d-core 0.19.0、s1000d-reader-mcp 0.17.0）。BOM で始まる XML を読む（[#23](https://github.com/shuji-bonji/s1000d-stack/issues/23)）。内容部の先頭の参照の一覧を `refs` として返す（[#24](https://github.com/shuji-bonji/s1000d-stack/issues/24)）。中身が同じ XSD の写しを 1 つにまとめ、見つける順を名前の順に固定する（[#25](https://github.com/shuji-bonji/s1000d-stack/issues/25)）。
- **同じ版で中身の違う XSD**（2026-11-29 00:04 に利用者が決定）: どれを使うかは、利用者が設定で選ぶ。環境変数 `S1000D_SCHEMA_DIR` か、設定ファイルの `"schemaDirs"` に、`xml_schema_flat/` そのものか、それを含むフォルダーを書く。指定が無ければ名前の順の先頭を使い、ほかにあることを `_notes` で知らせる（core 0.19.0、verify-mcp 0.12.0、reader-mcp 0.17.0、writer-mcp 0.10.0）。
- **その後**: 作る側で、その版に置けない要素が出るときの扱いは、D-43 で決めた（入力の誤りとして返す）。

### D-43 作る側は、対象の版に置けないものを、組み立てずに入力の誤りとして返す（2026-11-29）

2026-11-29 00:27 に、利用者が決めた（2 つの案のうちの A 案）。

- **決めたこと**: 版を指定して組み立てるとき（D-41 の `issue`）、その版の XSD に置けないと分かっているものが下書きにあれば、組み立てる前に `input-error` と下書きの位置を返す。
- **選ばなかった案**: その要素を出さずに組み立て、`_notes` で知らせる（B 案）。同じ下書きを複数の版に出しやすいが、書き手が `_notes` を読まなければ、内容が消えたことに気付かない。
- **理由**: 読む側の「内容を落とさない」（D-31）と同じ考えにそろえる。
- **いま断るもの**（s1000d-core 0.20.0。2026-11-29 に、下の「その後」のとおり変えた）:

  | 対象 | 断る版 | 位置 | 理由 |
  |---|---|---|---|
  | プロセス DM の節（`dmNode` になる `section`）の題名 | Issue 4.2 より前 | `…/title` | `dmNode` に `title` を置けるのは Issue 4.2 から |
  | パブリケーションモジュールとコメントで、明示した `brexDmRef` | Issue 4.1 より前 | `/brexDmRef` | `pmStatus`・`commentStatus` に `brexDmRef` があるのは Issue 4.1 から |
  | 管理された内容の印（節点の `authority`） | Issue 4.2 より後（既定の Issue 7 を含む） | `…/authority` | `authorityName`・`authorityDocument` があるのは Issue 4.0〜4.2。Issue 7 では `controlAuthority` に置き換わった |
  | 管理された内容の印（節点の `authority`） | その版で `authorityName` を持てない要素になる節点（`para` など。`pmEntry` は Issue 4.0） | `…/authority` | XSD で、その要素の型が属性を持たない |

- **Issue 4.2 では、断るものが無い**: 組み立てる側が書く要素名と属性名（要素 141、属性 51）は、すべて Issue 4.2 の XSD にある。`hazards`・`safetyInformation`・`infoNameVariant` などの、Issue 4.2 に無い要素は、いまの組み立てる側が書かない。自作の下書き 6 件（説明 2、手順、プロセス、故障探求、PM）は、Issue 4.2 の XSD にそのまま通る。
- **確かめ方**: core の配布物付きのテスト（`src/issues.spec.test.ts`）が、自作の下書きを Issue 4.2・4.1・4.0 を指定して組み立て、その版の XSD にかける。誤りにならずに組み立てられたものは、どの版でも `valid` になる。
- **表に無い版**（5.0・6 など）: 調べない。その版の XSD の検証で確かめる。
- **その後（2026-11-29）**: 利用者が、次の 2 つを決めた。s1000d-core 0.20.0 に入れた。
  - Issue 4.0 系の PM とコメントは、作る側まで対応する。0.19.0 では PM（`/kind`）とコメント（`/options/issue`）を断っていたが、`brexDmRef` を書かずに組み立て、書かなかったことを `_notes` に入れる。これは「黙って落とす」には当たらない（その版に `brexDmRef` を置く場所が無く、書き手が指定したものでもない）。書き手が `brexDmRef` を明示したときだけ断る。#28。
  - Issue 7 で `controlAuthority` に置き換わった `authorityName`・`authorityDocument` を、Issue 4.0〜4.2 向けに書けるようにする。下書きの節点に `authority: { name, document? }` を足した。読む側も、節点の `authority` に返す。#26。
- **決めていないこと**: Issue 7 の `controlAuthority`（`controlAuthorityGroup` に定義を置き、`controlAuthorityRefs` で指す）を、同じ `authority` から書くか。

## 未決事項

| ID | 内容 | 判断の材料 |
|---|---|---|
| ~~U-01~~ | 最初の公開の時期 | **解決（2026-10-24）**: 段階 2 が揃った時点で hub と brex-mcp を公開する（D-16）。以下は経過。「すべて揃った時点」と「段階 1 の 3 つが揃った時点」のどちらにするか。BREX を扱う MCP は他に無いこと、Zenn Book「IETM入門」を公開済みであることは早い公開の理由になる。「揃った」の条件には、サイトの BREX・データモジュールの説明を仕様書と照合済みであることを含める。**2026-10-24 時点**: s1000d-core は公開済み。hub は Private のため GitHub Pages を有効にできず（Free プラン）、`deploy.yml` は `workflow_dispatch` だけにしてある。hub を Public にするときに push トリガーを戻す。brex-mcp を npm に公開したら、サイトの `guide/getting-started.md` と `mcp/brex-mcp.md` にある「npm 未公開（開発中）」の note を 2 つとも消す |
| ~~U-02~~ | Issue 7 の利用条件の全文に、再配布や組み込みについての特別な許可があるか | **解決（2026-10-23）**: 無い。「Special usage rights」の対象は 8 区分の団体・企業・機関に限られる。D-03 に反映済み |
| U-03 | 自作サンプルデータを共有パッケージに切り出す時期 | 2 つ目の MCP がテストで使い始めた時点を目安にする |
| ~~U-04~~ | 共通データモデルのパッケージ名 | **解決（2026-10-24）**: `@shuji-bonji/experiential-manual-model`（GitHub は `shuji-bonji/experiential-manual-model`、ローカルは `s1000d-stack/lib/experiential-manual-model`）。`manual-model` だけでは IETM や S1000D 一般のマニュアルのモデルと受け取られるため、「体験型」を表す `experiential` を入れる。npm で `experiential-manual-model` / `experiential-manual` / `experience-manual-model` / `xp-manual-model` が空いていることを 2026-10-24 に確認した。文書の中では引き続き「manual-model」と略して書くことがある |
| ~~U-05~~ | 体験型マニュアルの製品名 | **解決（2026-11-14）**: Experiential Manual（作成ツールは Experiential Manual Editor、D-30）。以下は経過。一般の利用者向けの名前にする。試作の間は仮称 `manual-editor`（D-28）。D-29 で製品は別プロジェクトになったので、名前はそのプロジェクトで決め、決まったら player / editor / cli に同じ語を頭に付ける。IETM / IETP のプロジェクト名も別に決める |
| ~~U-10~~ | 簡易 Web マニュアル（段階 4 の参照実装）の技術の選定 | **解決（2026-10-28）**: SvelteKit ＋ PWA（D-28）。作成ツールの試作も同じ |
| ~~U-06~~ | Starlight の日本語検索の精度 | **解決（2026-10-24）**: 生成された Pagefind の索引を Node から検索して確認。単語（照合・券売機・適用性・識別・商標）は期待どおり。Pagefind は日本語を単語に分けて索引するため、「データモジュール」のような複合語をそのまま入れると同じつながりで現れたページ（1 件）だけが返り、「データ モジュール」と空けると 9 件になる。サイトの見出しに主要な複合語をそのまま書くことで補う |
| ~~U-07~~ | Issue 4.2 に対応する時期 | **解決（2026-11-28）**: 読む・検証する側はそのまま対象にし、作る側は版の指定（`issue`）だけを足す（D-41）。IMF は Issue 7 の対象として `read_icn_metadata` で読んでいて、Issue 4.2 の IMF も同じツールで読めた。Issue 4.2 に無い要素の扱いは別の Issue、Issue 4.0・4.1 は U-14。以下は経過。段階 2 で reader を作るときに判断する、としていた。2026-11-28 に配布物で実測した（[notes/issue-4.2-survey.md](./notes/issue-4.2-survey.md)） |
| ~~U-08~~ | XSD 検証の方式（段階 2）。XML の読み取りと XPath は D-12 で決定済み | **解決（2026-10-24）**: `libxml2-wasm` に確定（D-15）。根拠は [notes/u08-xsd-validation.md](./notes/u08-xsd-validation.md) の「U-08 の判断材料」と「U-08 の比較結果（2026-10-24）」 |
| ~~U-10~~ | s1000d-core の npm 公開の時期 | **解決（2026-10-24）**: brex-mcp の CI が `file:` 依存を解決できず落ちたため、core を先に `0.1.0` として npm に公開し、GitHub も Public にした。brex-mcp の依存は `^0.1.0`。hub と brex-mcp の公開（U-01）は従来どおり段階 1 が揃った時点で判断する |
| ~~U-09~~ | Skill のリポジトリ名の規則 | **解決（2026-10-28）**: `shuji-bonji/<名前>-skill`、plugin 名は `<名前>`（D-28） |
| U-11 | サイトの S1000D リファレンスに、既定 BREX と XSD の値のコードをまとめて載せてよいか（90 属性、`objectValue` 1,443 件） | D-03 の利用条件は、再配布と翻訳・翻案を認めていない。値のコード・ルール ID・章の番号は事実の記載だが、まとめて載せることが利用条件に触れないかは確かめていない。法律の専門家の領分で、設計では決められない。決まるまでは、自分の言葉の説明を書いた属性のページだけを公開する（[design/site-reference.md](./design/site-reference.md) の SR-3） |
| U-12 | このプロジェクトの主題を、「CSDB 製品への組み込み」（D-19。D-29 は ROADMAP の「目指すもの」でこれを主にすると書いた）のままにするか、「LLM が S1000D を正しく扱うための処理系」にして、組み込みはその使い道の 1 つにするか | D-19 の後、他社の CSDB 製品への組み込みを目的として挙げた記録は無い。2026-10-30 に「目的は技術マニュアル作成などで、そのついでに S1000D を LLM が正確に扱えるよう MCP を作っている」、2026-11-14 に「その後は IETM・IETP システムを作成する方向」と利用者が述べている。組み込んだ実例はまだ無い。決まれば、ROADMAP の「目指すもの」の順と、README・サイトの最初の説明を合わせる |
| U-13 | 段階 6 の OSS の CSDB を、s1000d-stack の部品（`lib/` や `app/`）にするか、別プロジェクトにするか（D-40） | D-29 では製品を別プロジェクトに分けた。CSDB は利用者が直接使う製品でもあり、IETM / IETP の製品の土台でもある。段階 5 が終わり、段階 6 の設計文書を書き始めるときに決める |
| ~~U-14~~ | Issue 4.0・4.1 にどこまで対応するか | **解決（2026-11-28）**: どちらも対象にする（D-42）。Issue 4.1 は #27、Issue 4.0 系は #28。以下は経過。2026-11-28 に配布物で実測した（[notes/issue-4.0-4.1-survey.md](./notes/issue-4.0-4.1-survey.md)）。Issue 4.1 は、版によらない 2 点（BOM で始まる XML、`content/refs` の題名）を直せば、読む側が Issue 4.2 と同じ水準になる。Issue 4.0 は、BREX のルールに識別子が無い（「`allowedObjectFlag` の型が 2 値なので、いまの照合の結果は使えない」と書いていたのは誤り。D-42 の訂正を参照）。作る側は、Issue 4.1 でプロセス DM、Issue 4.0 で PM・コメント・DML・プロセス・ACT が通らない。MRJ の供給企業に求められたのは Issue 4.0.1。対象に入れる版と、作る側まで対応するかを決める |

U-08 の判断材料と比較結果は、[notes/u08-xsd-validation.md](./notes/u08-xsd-validation.md) にあります。
