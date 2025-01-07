---
title: "エンジニア集会ハッカソン「NosHagaki」"
date: "2024-03-25"
---

VR コミュニティ「エンジニア作業飲み集会」のハッカソンにて、NosHagaki という SNS のクライアントを開発しました。

分散 SNS の試みの一つに「[Nostr プロトコル](https://nostr.com/)」があります。これはクライアント・サーバー間の通信に関するプロトコルで、主に SNS を実現するために使用されます。強力な障害耐性が特徴です。

Nostr では投稿文に必ず電子署名をします。署名に使う鍵ペアのうち、公開鍵が永続的な識別子として用いられます。

この特徴を利用して、公開鍵をシードにランダムな住所を生成します。

場所が離れていて時間のかかる、手紙のようなユーザー体験を目指しました。

- [こちら](../posts/240311-nos-hagaki-making) に開発したときのすったもんだを記録しています。
- バーチャルライフマガジンさんが [ハッカソンを取材](https://vr-lifemagazine.com/vr-engineer-meeting-hackathon-0-presentation/) しており、[NosHagaki についても紙面を割いて下さりました](https://vr-lifemagazine.com/vr-engineer-meeting-hackathon-0-presentation/#NawashiroNosHagaki)。
- 個人ブログ「あたしンちのおとうさんの独り言」にて [紹介していただきました](https://atasinti.chu.jp/dad3/archives/70297)。

https://nos-hagaki.vercel.app/

<iframe class="slide" src="https://docs.google.com/presentation/d/e/2PACX-1vQTE47Jcwr2C6JfCXtEbRb8AkNEgnN08-K-4NTDn5_Dr6ewuhOKwEq4cD4xrzk2qpVAqg4SVdJn9Wxf/embed?start=false&loop=false&delayms=3000" frameborder="0" width="560" height="315" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

[51:03](https://youtu.be/Q28jUVoY0GY?t=3063) あたりからが NosHagaki の発表です。

<iframe class="youtube" width="560" height="315" src="https://www.youtube.com/embed/Q28jUVoY0GY" title="第0回 エンジニア集会ハッカソン 成果発表会 2024/03/03" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 関連項目

- [ハッカソンでバーチャルな文通ができるNostrクライアント「NosHagaki」を作ってみた](240311-nos-hagaki-making.md)