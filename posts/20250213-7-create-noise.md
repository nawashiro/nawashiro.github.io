---
title: "7 ノイズをつくろう"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

この記事は [7日間でマスターするUnityシェーダ入門](https://nn-hokuson.hatenablog.com/entry/2018/02/15/140037) を自分なりに理解しようと努めた内容だ。また、プログラムはここからの引用であることが多い。詳しく知りたかったら、原典を参照してほしい。

---
## ランダムノイズ

疑似乱数を使ってノイズを作成する。

実際のコードとは少し異なり、雰囲気でやってしまった感があるが、数式を書いてみた。詳しい人から見たら怒られるかもしれないが、そうしたらこっそり教えてほしい。

入力から小数点のみを取り出して出力する関数。hlsl での `frac` 関数に相当する。

$$\text{dec}(x) = x\bmod1$$

入力 $x$ からランダムな $y$ を出力する関数。

$$\text{rand}(x) = \text{dec}\left(\sin(x\cdot12.9898)\cdot43758.5453\right)$$

0.01 刻みの $x$ に対して 0 から 1 まで $\text{rand}(x)$ したグラフ。一見ランダムに見える。[^1]

[^1]: はじめ、$\text{dec}(x)$ 関数を書き間違える凡ミスをしていた。この図は、そのときのものなので、注意してほしい。

![ランダムに打たれた点](https://i.imgur.com/TlBgHGz.png)

実装はこうなる。乱数の入力が先ほどの数式と少し異なる点に注意してほしい。

```c
struct appdata
{
	fixed2 texcoord : TEXCOORD0;
	...
}

struct v2f
{
	fixed2 uv : TEXCOORD0;
	...
}

v2f vert(appdata v)
{
	v2f o;
	o.uv = fixed2(v.texcoord.xy);
	...
	return o;
}

float random (fixed2 p) { 
	return frac(sin(dot(p, fixed2(12.9898,78.233))) * 43758.5453);
}

float4 frag(v2f i) : SV_Target
{
	float c = random(i.uv);
	return fixed4(c,c,c,1);
}
```

## ブロックノイズ

`random` 関数への入力の小数点を丸めることで、粒度の荒いノイズを生成できる。

```c
float noise(fixed2 st)
{
	fixed2 p = floor(st);
	return random(p);
}
```

## バリューノイズ

ブロックノイズを平滑化する。グリッドの四隅で乱数を生成し、それをグリッド内の位置（オフセット）で平滑化した値を使う。平滑化には以下の数式を使う。入力は 0 から 1 をとるので、こうなる。

$$3x^2-2x^3 \quad \text{where} \quad 0 < x < 1$$

![左右にたわんだ斜めに伸びる曲線](https://i.imgur.com/gMkfl1c.png)

これをコードに落とし込むために、式変形をする。

$$3x^2-2x^3$$

$$x^2\cdot\left(3-2x\right)$$

$$x \cdot x \cdot \left(3-2x\right)$$

グリッドの四隅で乱数を生成する。

```c
fixed2 p = floor(st);
float v00 = random(p+fixed2(0,0));
float v10 = random(p+fixed2(1,0));
float v01 = random(p+fixed2(0,1));
float v11 = random(p+fixed2(1,1));
```

グリッドのなかの位置（オフセット）を求めて、なだらかな平滑化に必要な計算をする。

```c
fixed2 f = frac(st);
fixed2 u = f * f * (3.0 - 2.0 * f);
```

四隅の値から実際に平滑化する。

```c
float v0010 = lerp(v00, v10, u.x);
float v0111 = lerp(v01, v11, u.x);
return lerp(v0010, v0111, u.y);
```

## パーリンノイズ

バリューノイズをさらになだらかにする。グリッドの四隅をランダムなベクトルにして、ブロック内部の点から四隅に向かうベクトルと内積をとる。これで、グラデーション状に変化する。

ランダムなベクトルを生成する疑似乱数を書く。

```c
fixed2 random2(fixed2 st){
	st = fixed2(dot(st,fixed2(127.1,311.7)), dot(st,fixed2(269.5,183.3)));
	return -1.0 + 2.0*frac(sin(st)*43758.5453123);
}
```

四隅をランダムなベクトルにする。

```c
fixed2 v00 = random(p+fixed2(0,0));
fixed2 v10 = random(p+fixed2(1,0));
fixed2 v01 = random(p+fixed2(0,1));
fixed2 v11 = random(p+fixed2(1,1));
```

四隅のベクトルとオフセットで内積をとり、平滑化する。0 以上になってほしいので、0.5 を足している。

```c
return lerp( lerp( dot( v00, f - fixed2(0,0) ), dot( v10, f - fixed2(1,0) ), u.x ),
	 lerp( dot( v01, f - fixed2(0,1) ), dot( v11, f - fixed2(1,1) ), u.x ), 
	 u.y)+0.5f;
```
