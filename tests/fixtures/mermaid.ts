// Fixed regression inputs; deliberately independent of published articles.
export const sequence = `sequenceDiagram
  %% Official Mermaid comments and whitespace are valid syntax.
  participant Visitor as 訪問者
  participant Server as 公開サーバー
  Visitor ->> Server: 日本語の要求
  Note over Visitor,Server: 二者にまたがる注記
  Note left of Visitor: 左側の注記
  Note right of Server: 右側の注記
  Note over Server: 一者の注記
  Server -->> Visitor: 日本語の応答
  Visitor -> Server: 矢印なしの通信
  Server --x Visitor: 終了の通知`;

export const sequenceLabels = [
  "訪問者", "公開サーバー", "日本語の要求", "日本語の応答",
  "二者にまたがる注記", "左側の注記", "右側の注記", "一者の注記",
  "矢印なしの通信", "終了の通知",
];

export const flowchart = `graph TD
  %% Non-sequence diagrams also belong to the official grammar.
  A["受付"] --> B["処理"]`;

export const invalid = "sequenceDiagram\nThis is not valid Mermaid syntax !!!";

export const hostileSources = [
  'flowchart TD\n A["<script>alert(1)</script><img src=x onerror=alert(1)>"] --> B["日本語"]',
  'flowchart TD\n A["危険なリンク"]\n click A "javascript:alert(1)"',
  'flowchart TD\n A["危険なリンク"]\n click A "data:text/html,<script>alert(1)</script>"',
  '%%{init: {"securityLevel":"loose", "themeCSS":"@import url(https://evil.invalid/font.css);", "fontFamily":"evil", "themeVariables":{"fontSize":"99px"}}}%%\nflowchart TD\n A["<img src=x onerror=alert(1)>"]',
];
