---
title: "4 スクロールする水面を作る"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

この記事は [7日間でマスターするUnityシェーダ入門](https://nn-hokuson.hatenablog.com/entry/2018/02/15/140037) を自分なりに理解しようと努めた内容だ。また、プログラムはここからの引用であることが多い。詳しく知りたかったら、原典を参照してほしい。

---

サーフェイスシェーダーは以前の状態を覚えておけないため、`移動距離 = 速度 * 時間` をする。Unity 標準の機能で、時間を取得することができる。

```c
fixed2 uv = IN.uv_MainTex;
uv.x += 0.1 * _Time;
uv.y += 0.2 * _Time;
o.Albedo = tex2D (_MainTex, uv);
```
