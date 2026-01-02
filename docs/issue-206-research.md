# issue-206: Research on TailwindCSS/DaisyUI/animation for a warm, smooth design system

## 調査の前提

- 既存の posts を読み、サイト全体のトーンや価値観（温かみ、非威圧感、なめらかさ）を抽出した。
- リサーチは原則として英語の一次情報（公式ドキュメント中心）を参照した。

## 既存 posts から読み取れる「らしさ」

- 「デジタルガーデン」「思考の庭」「友人を招く」といった言葉があり、静かな親密さと丁寧なキュレーションが核（例: `posts/20241210-digital-gerden.md`）。
- 認知症や障害、読書バリアフリーに関する記述が多く、過剰な演出よりも安心感・尊厳・ケアの視点が強い（例: `posts/20241208-dementia-is-not-a-mysterious-frightening-disease.md`, `posts/20241214-barrier-free-reading-raw.md`）。
- 文章のトーンは淡々とした事実 + 個人の感覚・共感が同居。威圧感を避け、読む人に安心を渡す文章設計。

## コンセプト候補（温かみ + なめらかさ）

- **「Digital Garden, Soft Paper」**: 紙のような余白とやさしい陰影。輪郭は丸く、背景は淡いグラデーション。
- **「Careful Tech」**: 技術は硬質だが、手触りは温かい。グレー/茶/草のニュートラル + 透明感のある差し色。
- **「Quiet Playfulness」**: 小さな楽しさを散りばめる（微細な動き、控えめな色変化）。威圧しない遊び。

## TailwindCSS/DaisyUIで独自性を出す方向性

- **DaisyUIのテーマを1つに絞り、独自テーマとして調整**
  - ベースは「caramellatte」「silk」系（温かい白・淡いベージュ）を想定し、
    `--color-base-*` を少し黄み/灰みへ寄せる。
  - `data-theme` を使ってセクション単位の雰囲気切り替え（例: Graph セクションだけ少し涼色）。
- **Tailwindテーマ拡張で“庭の手触り”を定義**
  - 角丸: `rounded-2xl` 以上を基準に統一。
  - 影: `shadow-sm`/`shadow-md` をぼかし強め、硬い影は避ける。
  - タイポ: 日本語は `Noto Sans JP` のままでも良いが、英字見出しにアクセントフォントを加えると「らしさ」が出る。
- **デザインシステムの粒度**
  - `card`, `badge`, `menu`, `btn`, `alert`, `divider` を DaisyUI で揃え、
    Markdown本文は Tailwind Typography か現状の `styles/global.css` を温存し段階移行。

## アニメーションに使えるデザインシステム候補

- **Tailwind Animation Utilities**
  - 小さなアニメーションを「utilityとして設計」できる。
  - `@theme` + `@keyframes` でサイト専用の動きを登録可能。
- **DaisyUIのコンポーネント内アニメーション**
  - `drawer`, `dropdown`, `collapse`, `swap` などは「動き前提」のUI。
  - デザインシステムの統一感を維持しやすい。
- **Motion (Framer Motion / Motion One)**
  - スムーズで自然なイージングが得意。少量導入に向く。
  - Reactでページ遷移や入場アニメーションを柔らかく付けられる。
- **Animate.css**
  - 手早く導入できるが、雰囲気が「派手」になりやすい。
  - 使うなら `fadeIn`, `slideInUp` など穏やかなものに限定。

## 「楽しいアニメーション」案（威圧感を避ける）

- **ゆらぎ（Float / Drift）**: 重要カードやボタンに 2〜4px の上下移動。
- **柔らかい登場（Staggered Reveal）**: セクション見出し→本文→カードの順にふわっと出す。
- **温度のある呼吸（Breathing Shadow）**: カードの影がほんの少しだけ濃淡する。
- **リンクの「芽吹き」**: hover時に下線が左から伸びる（現状のリンクカード効果を全体へ拡張）。
- **グラフの微細パルス**: `NetworkGraph` のノードに極小のパルス（目立たせない）。
- **タイポの跳ね**: 既存の `heroA` のジャンプを“少し遅く・小さく”調整して穏やかに。

## 現在のコードベースへの適用可能性（絞り込み）

- **即適用しやすい領域**
  - `components/layout.tsx`: ナビゲーション、メニューを DaisyUI `navbar`/`dropdown` へ寄せることで統一感が出る。
  - `styles/index.module.css`: Hero / Card の構成は DaisyUI `hero`, `card`, `btn` に近く置き換えやすい。
  - `styles/global.css`: `:root` の色変数は DaisyUI/Tailwind のテーマ値へ変換可能。
- **段階移行が必要な領域**
  - Markdown本文 (`styles/global.css` の `.blog` セレクタ群) はそのまま残し、
    Tailwind Typography 導入後に少しずつ置換が現実的。
- **アニメーションの置き換え/拡張候補**
  - `styles/index.module.css` の `@keyframes jump` は Tailwind `@theme` に移して共通化可能。
  - 現在のリンクカード hover アニメーションは DaisyUI/Tailwindへ移植可能（柔らかい色遷移は資産）。

## 推奨の絞り込みプラン

1. **TailwindCSS + DaisyUI（カスタムテーマ1本）**
   - 最小導入で「統一感」「簡潔さ」を達成。
   - DaisyUIのコンポーネントで構造が揃い、レイアウト調整が簡単。
2. **アニメーションは Tailwind Utility + 小さなカスタムkeyframes**
   - `animate-[wiggle_...]` のようにサイト固有の動きを少数定義。
   - `motion-safe:` を前提に、アクセシビリティ確保。
3. **複雑な動きが必要なら Motion を限定的に導入**
   - 例: Hero/Graph だけ、スクロール連動や入場演出を追加。

## 参照（英語）

- Tailwind CSS docs: https://tailwindcss.com/docs/styling-with-utility-classes
- Tailwind CSS animation: https://tailwindcss.com/docs/animation
- daisyUI themes: https://daisyui.com/docs/themes/
- Motion (Framer Motion): https://motion.dev/
- Animate.css: https://animate.style/
