---
title: "5 テクスチャをブレンドする"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

この記事は [7日間でマスターするUnityシェーダ入門](https://nn-hokuson.hatenablog.com/entry/2018/02/15/140037) を自分なりに理解しようと努めた内容だ。また、プログラムはここからの引用であることが多い。詳しく知りたかったら、原典を参照してほしい。

---

テクスチャ 1 とテクスチャ 2 をブレンドする。このとき、マスク画像が必要になる。

マスク画像が黒に近いときは 1 を出し、白に近いときは 2 を出す。

$$\text{color} = \text{texture1} \cdot \text{p} + \text{texture2} \cdot (1 - \text{p})$$

これは、線形補完関数 `lerp` で表せる。

```c
fixed4 c1 = tex2D (_MainTex, IN.uv_MainTex);
fixed4 c2 = tex2D (_SubTex,  IN.uv_MainTex);
fixed4 p  = tex2D (_MaskTex, IN.uv_MainTex);
o.Albedo = lerp(c1, c2, p);
```
