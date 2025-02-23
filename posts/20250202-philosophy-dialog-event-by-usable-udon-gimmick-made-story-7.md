---
title: "哲学対話イベントで使える Udon ギミックを作った話 #7 - グリッド処理と近傍探索"
date: "2025-02-02"
---

力学モデルの UdonSharp 実装においていくつかの案を試みましたが、失敗したものもあります。今回は、失敗した試みを紹介します。

## グリッド処理

ランダムにスキップさせたほうがきれいで計算も軽かったので、最終的には採用は見送りました。ただし、記録として残しておきます。

座標の小数点以下を切り捨てた値を記録し、同じ値同士のものだけ斥力を計算するシンプルな方法を作りました。こうすることで、1 辺 1 の大きさのグリッド内の頂点同士だけを計算することができます。

## 近傍探索アルゴリズム - kd-Tree 探索

力学モデルの軽量化のために、斥力の計算が「自分対すべて」では処理が重くなってしまうため、「自分対近くの頂点」のみ計算するという手法を試みました。結果的にうまくいきませんでしたが、記録として残しておきます。

kd-Tree 探索を使用しました。これは直感的な近傍探索アルゴリズムです。

- 点群がグラフにあるとき、ある点に近い点を絞り込みたいと考えます。
- まず、グラフの中心で縦線を引き、左右に分けます。そして、自分がいるほうを選びます。
- 次に、選んだほうに横線を引き、さらに上下に分けます。そして、自分がいるほうを選びます。
- このプロセスを繰り返すことで、自分の近傍を選び取ることができます。

「中心で縦線を引き仕切る」というのは、実際には座標データが詰まった配列を、座標の片方の値でソートして中心で区切るという処理です。今回はクイックソートを実装しました。[^1]

[^1]: 後から気づいたことですが、この時点で過ちを犯していました。UdonSharp では他の言語のように再帰処理が行えないのです。

kd 木というのは、この区切り部分の座標を記憶したものです。ただし、UdonSharp の制約によって、木を作ることができません。できないことはないのですが、パフォーマンスが悪いです。そこで、1 次元の配列を使用しました。

これが表現したい木です。

```
   0
 1   2
3 4 5 6
```

これが実際のデータです。

```
{0, 1, 2, 3, 4, 5, 6}
```

木を見ると、深度が増えるごとに、要素の数は 2 の n 乗増えることがわかります。そのため、深度からおおまかな位置を求めることができます。

UdonSharp の制約によって再帰処理が行えなかったので、for 文ですべてを回しました。回しましたが、その結果得られたものが満足いかなかったため、変更をコミットせずにすべて消しました。説明はここまでです。

どなたか kd-Tree 探索の UdonSharp 実装に挑戦して、うまくいったら教えてください。

---

以降は、まだ再帰処理が行えないことに気づかなかった頃の記録です。

1 次元配列上の位置を求めるため、位置を正規化した値を使用しました。

正規化というのは、大きさを 0 から 1 までの値で表すことです。深度の値と組み合わせて、どこを見ればいいのか計算できます。

- 最初の実行では 1 とします。
- 左側の枝を処理するとき、 `normalizedPosition - (1.0 / (depth + 1) ^ 2)` としました。
- 右側の枝を処理するときは、そのまま値を渡します。
- 1 次元配列上の位置を計算するとき、`(int)((2 ^ depth) * normalizedPosition) - 1` で求めました [^2]

[^2]: 最後の `-1` が必要だったのか今となっては思い出せません。

結果的に、再帰が使えなかったので、夢は泡となりました。
