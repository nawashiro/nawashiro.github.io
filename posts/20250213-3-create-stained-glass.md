---
title: "3 ステンドグラスをつくる"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

この記事は [7日間でマスターするUnityシェーダ入門](https://nn-hokuson.hatenablog.com/entry/2018/02/15/140037) を自分なりに理解しようと努めた内容だ。また、プログラムはここからの引用であることが多い。詳しく知りたかったら、原典を参照してほしい。

---

色がついている部分は半透明、黒いところは不透明にしたい。だが、tex2D メソッドで得られる値は RGBA なので、黒を判定するのが面倒だ。そこで、グレースケールに変換する。グレースケール変換は、色成分 RGB の値から、人の眼が感じる色の強さを推定して 1 つの値にまとめる作業だ。

## ディスプレイの特性

意外なことに、RGB 値は物理的な輝度と素直に比例しない。1 次関数にはならず、グラフは曲線を描く。

CRT ガンマというものがある。ガンマ値とは、入力信号に対して、映像機器が出力する輝度の最小を 0、最大を 1 としたときのカーブを表す指数だ。CRT ディスプレイが持つガンマ値は 2.2 程度で、これは三極真空管の性質によるものだ。

このカーブのために、意図した輝度を出力したいとき、信号に対して補正を行う必要がある。これをガンマ補正という。これは現在でも踏襲されており、色成分 RGB の値というのは、補正された値だ。今回の場合、本来の輝度を推測するために、逆ガンマ変換が必要になる。

例を以下に示す。255 で割ったり掛けたりしているが、正規化とその解除をしている。

$$\text{V}_\text{out} = 255 \cdot \left( \frac{\text{V}_\text{in}}{255} \right) ^ {\frac{1}{\gamma}}$$

ガンマ補正を図にしたものがこれだ。実線が実際の映像機器で、破線が補正した信号だ。

![ガンマ補正を表したグラフ。理想的なグラフは原点から線形に(1,1)へ向かうが、実際の映像機器は下へ弓なりになっており、非線形だ。そこで、入力信号を上へ弓なりにして、補正する。](https://i.imgur.com/5bzg3pN.png)

## ヒトの視覚特性

ヒトの視覚は、光の波長によって感じ方の強さが異なる。この、ヒトの感覚に基づいた輝度を、測光量と呼ぶ。CIE（国際照明委員会）が、等色実験を行い、ヒトの視覚特性を調べている。これによって、ヒトの感覚に基づいた色空間の「XYZ 色空間」が生み出され、今日に至っている。デジタル放送や Web ではもっぱらこれが使われている。

この CIE XYZ を用いた方法を以下に示す。R, G, B を逆ガンマ変換し、ヒトの視覚特性に応じた重みづけをして、平均をとる。この重みづけありの平均のことを、加重平均という。

```
(R', G', B') = 逆ガンマ補正(R, G, B)
V' = 0.2126 * R' + 0.7152 * G' + 0.0722 * B'
V = ガンマ補正(V')
```

## 簡略化

現実的には、CIE XYZ よりも簡略化した計算を行いたい。ガンマ補正がかかったまま加重平均を使用して計算する。日本のアナログ放送の標準形式（[「標準テレビジョン放送（デジタル放送を除く。）に関する送信の標準方式」平成二十三年総務省令第八十八号](https://warp.ndl.go.jp/info:ndljp/pid/8315893/www.tele.soumu.go.jp/horei/reiki_honbun/72ab2105001.html#top) 別表第二号 映像信号方程式）の例を以下に示す。

$$\text{V} = 0.3 \cdot \text{R} + 0.59 \cdot \text{G} + 0.11 \cdot \text{B}$$

今回は、さらに簡略化した式を用いる。

$$\text{V} = 0.3 \cdot \text{R} + 0.6 \cdot \text{G} + 0.1 \cdot \text{B}$$

## 実装

先ほどの式で得られた値が 0.2 以下のとき、黒色付近とわかる。このとき透明度を 1 にして、それ以外のときを 0.7 とすれば、ステンドグラスがつくれそうだ。

```c
fixed4 c = tex2D(_MainTex, IN.uv_MainTex);
o.Albedo = c.rgb;
o.Alpha = (c.r * 0.3 + c.g * 0.6 + c.b * 0.1 < 0.2) ? 1 : 0.7;
```

