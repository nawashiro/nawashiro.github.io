---
title: "コード書くときChatGPTはどう使える？【WhiteCUL/春日部つむぎ】"
date: "2024-10-20"
---

動画になりました。

https://www.nicovideo.jp/watch/sm44247610?ref=garage_share_other

## README

このドキュメントは、Jaz 氏のブログ [「How to use ChatGPT to Write Good Code Faster」](https://jazco.dev/2023/04/19/using-chatgpt-to-write-good-code-faster/) の翻訳及び要約です。正確な内容が知りたい方は原典を参照してください。本ドキュメントはいかなる保証もなく、あるがまま提供されます。

## 分裂

春日部つむぎ「よっ、雪さん！ ChatGPT でコード書くの、超楽勝になったんだけど、マジ最高！」

雪さん「つむぎちゃん、すごいね！ ChatGPT って、どんな風に使うとコード書きが楽になるんだっけ？」

春日部つむぎ「あーし流 ChatGPT 活用術、伝授しちゃうよ！ まずは ChatGPT を面接官みたいに扱うのがポイント！ つまり、指示を明確に出すってことね。」

雪さん「面接官みたいに、か。確かに、曖昧な質問には曖昧な答えしか返ってこないもんね。」

春日部つむぎ「そう！例えば、Python で GitLab API を使って特定のリポジトリのマージリクエストの統計を収集するスクリプトを書きたいとするじゃん？」

雪さん「うん、よくある作業だね。」

春日部つむぎ「そしたら、ChatGPT に対して、目的を明確に伝えるの。どんな言語でコードを書いてほしいか、どんなデータ構造を使いたいのか、具体的な例を挙げて説明するといい感じ！あーしは、マージリクエストの成功と失敗を判定するラベルの付け方とか、出力してほしい JSON ファイルの構造とか、asyncio ライブラリを使って高速化してほしいとか、全部細かく指示したよ！

具体的には、

```
特定のリポジトリのマージリクエストに関する統計情報を収集するPythonスクリプトを書きたい。
このリポジトリのマージリクエストには、「service:（サービス名）」と「tier:（ティア名）」を識別するラベルがある。
クローズされたマージリクエストは「失敗した」デプロイメントと見なし、マージされたマージリクエストは「成功した」デプロイメントと見なす。
プライベートトークンで認証するプライベートGitLabインスタンスを使用している。
このスクリプトは効率的に書きたい。
問題のリポジトリには何万ものマージリクエストがある。
出力は、最上位キーがサービス名であるJSONファイルにしたい。
各キーには、MR作成のタイムスタンプを「deployment_time」とし、「deployment_status」を「successful」または「failed」とするデプロイメントのリストを含める必要がある。
また、サービスごとに、月ごとのデプロイメント数と月ごとのデプロイメントの失敗率を示すサマリーを生成したい。
パフォーマンスのために、該当する場合はasyncioライブラリを使用するようにしてほしい。
```

って感じだね！」

雪さん「へぇ～、そこまで細かく指示するんだ！」

春日部つむぎ「そしたら、ChatGPT がコードを提案してくれるんだけど、一発で完璧に動くコードが出てくるわけじゃないんだよね。 でも、ChatGPT は過去のやり取りを記憶してるから、修正指示とか追加機能とかもお願いできるの！デバッグログを追加して、「エラー処理を適切に行ってください」ってお願いしたら、ちゃんと修正してくれたよ！」

雪さん「すごい！まるで、一緒にコードを書いてるみたいだね。」

春日部つむぎ「まさに！ あーしは、デバッグログの追加とか、GitLab API のレスポンスヘッダーの変更に対応するコードの修正とか、ChatGPT に手伝ってもらったよ！」

雪さん「つむぎちゃん、ChatGPT 使いこなしてるね！ でも、ChatGPT が書いたコードはちゃんと確認しないと危ないんでしょ？」

春日部つむぎ「雪さん、鋭い！ ChatGPT はあくまでもアシスタントだから、コードレビューは必須！特に、重要な処理をするコードや影響範囲の大きいコードは慎重にチェックしないとね！ テストコードを書くのも忘れずに！」

雪さん「なるほどね。ChatGPT を使えば、コードを書く時間を減らして、レビューやテストに集中できるってことか。」

春日部つむぎ「そう！ ChatGPT は、あーし達の開発フローを加速してくれる最強ツールってわけ！ 新しいプロジェクトやライブラリを使うときも、ChatGPT があれば怖いものなし！」

雪さん「つむぎちゃん、ありがとう！ ChatGPT 活用術、勉強になったよ！」

春日部つむぎ「どういたしまして！ 雪さんも ChatGPT で爆速開発、目指しちゃお！」

## 融合

雪さん「つむぎちゃん、さっき教えてもらった通り ChatGPT 使ってみたんだけど、確かにコードを書くのが楽になったよ。でも、もっと効率的に ChatGPT を活用する方法があるのかな？」

春日部つむぎ「もちろん！ ChatGPT はただコードを生成するだけじゃなく、対話しながらコードやアイデアをブラッシュアップしていくのが最大の強みなんだよ！」

雪さん「えー、そうなんだ！ 具体的にどんな風に？」

春日部つむぎ「例えば、前に話した GitLab の API のスクリプトを覚えてる？ あれ、実は最初はめっちゃ遅かったんだ。800 ページ以上のマージリクエストを処理するのに、20 分もかかっちゃうってわけ。」

雪さん「うわー、それは時間がもったいないね。」

春日部つむぎ「そこで、ChatGPT に「800 ページ以上あるんだけど、もっと並列処理して高速化できない？」って聞いてみたんだ。そしたら、ChatGPT は asyncio.gather を使った並列処理のコードを提案してくれたんだよ！」

雪さん「すごい！ ChatGPT はパフォーマンス改善のアドバイスもしてくれるんだね！」

春日部つむぎ「そうなの！ しかも、ChatGPT はエラーメッセージも理解してくれるから超便利！並列処理のコードを試したら、今度は `dictionary changed size during iteration` ってエラーが出ちゃったんだけど、エラーメッセージとコードを ChatGPT に送ったら、エラーの原因を特定して修正案まで出してくれたんだ！」

雪さん「えー、それはすごい！ 自分でデバッグする手間が省けるね！」

春日部つむぎ「でしょ？ こんな感じで、ChatGPT と対話しながらコードを修正したり、機能を追加したりすることで、自分のアイデアをどんどん形にしていくことができるんだよ！」

雪さん「なるほど！ ChatGPT はまるでプログラミングのパートナーみたいだね！」

春日部つむぎ「まさにその通り！ さらに、ChatGPT はコードのドキュメント作成も得意だから、完成したスクリプトの説明を `README.md` にまとめてもらうこともできるんだ。」

雪さん「それは助かるね！ ドキュメント作成って地味に大変だから。」

春日部つむぎ「そうでしょ！ ChatGPT を上手に使えば、開発のスピードが格段に上がるし、新しい技術やライブラリにも気軽に挑戦できるようになるよ！」

雪さん「つむぎちゃん、今日も色々教えてくれてありがとう！ ChatGPT マスター目指して頑張るね！」

春日部つむぎ「そこは開発マスターを目指そうよ！」
