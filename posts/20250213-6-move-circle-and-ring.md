---
title: "6 円やリングを動かす"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

この記事は [7日間でマスターするUnityシェーダ入門](https://nn-hokuson.hatenablog.com/entry/2018/02/15/140037) を自分なりに理解しようと努めた内容だ。また、プログラムはここからの引用であることが多い。詳しく知りたかったら、原典を参照してほしい。

---

まず円を描く。`distance` 関数によってある点からの距離がわかるので、距離が一定より低い範囲の色を変える。

```c
float dist = distance( fixed3(0,0,0), IN.worldPos );
float radius = 2;
if(radius < dist){
	o.Albedo = fixed4(110/255.0, 87/255.0, 139/255.0, 1);
} else {
	o.Albedo = fixed4(1,1,1,1);
}
```

条件式に手を加えることにより、円の輪郭線を描ける。

```diff
 float dist = distance( fixed3(0,0,0), IN.worldPos );
 float radius = 2;
-if(radius < dist){
+if(radius < dist && dist < radius + 0.2){
-	o.Albedo = fixed4(110/255.0, 87/255.0, 139/255.0, 1);
+	o.Albedo = fixed4(1,1,1,1);
 } else {
-	o.Albedo = fixed4(1,1,1,1);
+	o.Albedo = fixed4(110/255.0, 87/255.0, 139/255.0, 1);
 }
```

同心円状に円を繰り返す。sin 波を利用する。sin 波は正と負に振れる波なので、正だけに振れるように絶対値を取る。

これが、

![サイン波。正と負に波打ったグラフ。](https://i.imgur.com/Rz1KFUr.png)

こうなる。

![サイン波の絶対値。正だけに振れる、かまぼこをならべたようなグラフ。](https://i.imgur.com/hDjU1ik.png)

実装はこうだ。

```c
float dist = distance(fixed3(0,0,0), IN.worldPos);
float val = abs(sin(dist*3.0));
if(val > 0.98){
	o.Albedo = fixed4(1, 1, 1, 1);
} else {
	o.Albedo = fixed4(110/255.0, 87/255.0, 139/255.0, 1);
```

sin 関数への入力値から時間を引いて、sin 波を外側へ動かす。

```diff
 float dist = distance(fixed3(0,0,0), IN.worldPos);
-float val = abs(sin(dist*3.0));
+float val = abs(sin(dist*3.0-_Time*100));
 if(val > 0.98){
 	o.Albedo = fixed4(1, 1, 1, 1);
 } else {
 	o.Albedo = fixed4(110/255.0, 87/255.0, 139/255.0, 1);
 }
```

