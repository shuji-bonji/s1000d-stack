# 翻訳の比較: guide/overview.md（2026-10-26 JST）

D-22 の「最初の 1 ページを Claude と DeepL の両方で訳して比較する」の記録です。対象は `site/src/content/docs/guide/overview.md` の本文 15 段落（表のセル・箇条書き・段落。見出しと Mermaid は除く）。採点は xcomet-mcp（`xcomet_batch_evaluate`、ja → en、CPU）。

## 採点（0〜1、高いほど良い）

| # | 段落 | Claude | DeepL | 差 |
|---|---|---|---|---|
| 0 | 冒頭の定義 | 0.844 | 0.780 | +0.064 |
| 1 | 表: 困りごと（メーカー） | 0.915 | 0.933 | -0.018 |
| 2 | 表: できること（メーカー） | 0.908 | 0.924 | -0.016 |
| 3 | 表: 困りごと（制作会社） | 1.000 | 1.000 | 0.000 |
| 4 | 表: できること（制作会社） | 0.949 | 0.885 | +0.064 |
| 5 | 表: 困りごと（学習者） | 1.000 | 0.988 | +0.012 |
| 6 | 表: できること（学習者） | 0.848 | 0.981 | -0.133 |
| 7 | BREX を読む | 0.765 | 0.869 | -0.104 |
| 8 | 照合する | 0.838 | 0.829 | +0.009 |
| 9 | 検証して読む | 0.784 | 0.765 | +0.019 |
| 10 | 同梱しない | 0.853 | 0.928 | -0.075 |
| 11 | 要約・翻訳しない | 0.782 | 0.815 | -0.033 |
| 12 | XML を見せない | 0.875 | 0.906 | -0.031 |
| 13 | 公式ではない | 0.985 | 0.989 | -0.004 |
| 14 | 読み方の段落 | 0.835 | 0.743 | +0.092 |
| | 平均 | 0.879 | 0.889 | -0.010 |

どちらも critical error は 0。平均は同点とみなせる差です。

## xcomet では測れない差（用語・制約）

DeepL には `context` と `customInstructions`（用語の指示 4 件）を渡しましたが、次の点が glossary.md と en-writing-guide.md に合いませんでした。xcomet はこれらを誤りとして検出していません。

| # | DeepL の訳 | 問題 |
|---|---|---|
| 0 | "generate them" / "We first create…" / "interactive manuals" | 作る = create（generate は生成の意味が強い）。主語 we は使わない。体験型 = experiential。`S1000D®` と `(BREX, Business Rules Exchange)` の初出表記が落ちた（D-01） |
| 2 | "targets, **applicability**, permitted values" | 使用可否を applicability と訳した。S1000D の適用性（applicability）と衝突する |
| 3 | "we verify that the data modules we create" | 立場の表の文を「私たち」に変えた |
| 7 | "SNS (System Numbers)" | 対訳は standard numbering system |
| 9 | "procedures … figures" | 対訳は steps / illustrations |
| 11 | "Do not summarize or translate." | 命令文になり、読者への指示に読める（原文は「しません」） |
| 14 | "In This Stack" | 節の名前は "In this stack" に固定 |

Claude の訳で xcomet が低く採点したのは 7・9・11 で、いずれも箇条書きの先頭に置いた動詞句（"Reads a BREX."、"Validates, then reads."）が文として不完全と見なされたものです。意味の誤りは指摘されていません。

## 結論と以後の運用

- 用語と制約を守る点で Claude の訳を主にする。DeepL は、xcomet の差が 0.05 を超えて DeepL が高い段落について、言い回しを取り込む参考にする。
- 今回は 6・7・10・11 の 4 段落で DeepL の言い回しを取り込み、用語は glossary.md のとおりに直した。結果は `docs/i18n/en/guide/overview.md`（サイトの英語版の骨組みができるまでの置き場）。
- 箇条書き先頭の動詞句は xcomet の得点を下げるが、英語の技術文書として普通の書き方なので変えない。採点を見るときはこの分を差し引く。
- xcomet は ja → en の意味の対応を見る道具として使い、用語の一致は glossary.md との突き合わせ（人が読む）で確かめる。

## 残り 12 ページの翻訳（2026-10-26 JST、同日）

- 下書きは、この会話の文脈を持たない作業用エージェント 12 体に glossary.md・en-writing-guide.md・承認済みの overview 英語版・日本語ページ 1 枚ずつを渡して並行で作らせた（1 ページあたり約 9 万トークン、1 分前後）。
- 構造の一致（見出し・表・行・図・コード・note・箇条書き・リンクの数、`/ja/` リンクの残り、日本語の残り）は `site/scripts/check-i18n.mjs`（`npm run check:i18n`）で検査し、13 ページすべて一致。
- 全ページを人（Claude）が通読し、次を直した: 定型文を機械的に挿入したために重複した段落（getting-started の caution、license の冒頭と商標の節、architecture の箇条書き、core の非同梱の段落）、`Envisioned` → `Concept`（stack.json の status に合わせる）、`numbering scheme` → `standard numbering system`、`reading part` → `reading code`、`way 1/2/3` → `use case 1/2/3`、`home-made` → `self-made`。
- xcomet は 108 段落のうち 30 段落（applicability・architecture・brex）に実施し、平均 0.832、critical 0。0.7 未満の 4 段落は、長文で識別子が多いもの（採点が下がりやすい）と、D-01 の `BREX (Business Rules Exchange)` の展開を「原文に無い」として減点したものだった。意味の誤りは無かったが、brex.md の 2 文と applicability.md の 1 文を読みやすく直した。
- 残り 78 段落は xcomet を省き、通読で代えた。理由: 1 回の採点で段落対を 2〜3 万文字送る必要があり、通読済みのページでは得るものが少ない。以後は「人が通読しないページ」または「改訳した段落」に絞って xcomet を使う。
- 作業用エージェントが「判断に迷った」と報告した語: 技術指令書 → technical order、機能マトリクス → functionality matrix、改修 001 → modification 001、券売機 → ticket (vending) machine、本社コード → head office code。glossary.md に足す候補。

## README 6 本（2026-10-26 JST、同日）

- hub、s1000d-core、experiential-manual-model、s1000d-brex-mcp、s1000d-verify-mcp、s1000d-reader-mcp の `README.md` を英語にし、従来の日本語を `README.ja.md` に移した。見出し直下（バッジがあればその下）に言語切替行（`**English** | [日本語](./README.ja.md)` / `[English](./README.md) | **日本語**`）を置いた。
- `scripts/generate-stack.mjs --readme` は `README.md`（英語の表: Repository / Layer / Form / Status / Version / npm、状態は released / in development / planned / concept）と `README.ja.md`（日本語の表）の両方を差し替えるようにした。目印 `<!-- stack:begin -->` / `<!-- stack:end -->` は共通。
- hub の README は、サイトが 2 言語になったことに合わせ、両言語とも「学習サイト（英語がルート、日本語は /ja/）」に直し、`README.ja.md` からサイトへのリンクは `/ja/` 付きにした。
- 下書きはサイトと同じ要領（作業用エージェント 6 体）。通読で直したもの: hub のコードブロック内の日本語コメント（英語版では訳す）、core の見出し「What it can do」→「What it does」、verify の License 行の `S1000D®`、reader の「positions the specification does not define」→「positions that differ from the specification」。
- **内容が古い箇所（日本語側の問題。翻訳では直していない）**: hub README の「できること（段階 1）」と全体像の図（reader / verify が「予定」のまま）、brex-mcp README の WARNING（「XSD 検証は段階 2 の verify-mcp で予定」のまま）。段階 2 の 3 部品が動いている現状に合わせて日本語版を直し、英語版に反映する作業が別に要る。
