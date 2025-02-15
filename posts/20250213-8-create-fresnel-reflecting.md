---
title: "8 フレネル反射をつくる"
date: "2025-02-13"
---

このシェーダー入門は、おもに数式に焦点をあてる。なぜかって？筆者が数学なんもわからんの民だからだ。まちがっていたらおしえてほしい。

---

ウユニ塩湖のような反射する床をつくる。

## 視差ベクトル

- カメラ位置と現在のピクセル位置の差を計算する
- 正規化する
- 視線の方向が求まる

```c
float3 viewDir = normalize(_WorldSpaceCameraPos - i.worldPos);
```

`i.worldPos` は `mul` 関数で求めている。

```c
v2f vert(appdata v)
{
	v2f o;
	o.worldPos = mul(unity_ObjectToWorld, v.vertex);
	...
	return o;
}
```

## 反射

法線ベクトルは `appdata` から渡されたままだとローカル座標系なので、ワールド座標系に変換する。 `UnityObjectToWorldNormal` 関数で求めている。

```c
struct appdata
{
	float4 normal: NORMAL;
	...
};

v2f vert(appdata v)
{
	v2f o;
	o.normal = UnityObjectToWorldNormal(v.normal);
	...
	return o;
}
```

視線ベクトルと法線ベクトルを使って、反射ベクトルを計算する。`reflect` 関数をつかう。

```c
half3 reflDir = reflect(-viewDir, i.normal);
```

得られた反射ベクトルと反射キューブマップを使って、反射光の色をサンプリングする。

```c
fixed4 reflectionColor = UNITY_SAMPLE_TEXCUBE_LOD(unity_SpecCube0, reflDir, 0);
```

## フレネル反射

視線ベクトルと法線ベクトルの内積を計算する。内積は、同じ角度のとき 1 で、反対の角度の時 -1 だ。その絶対値を取る（0 以上の値にする）。

```c
half vdotn = max(0, dot(viewDir, i.normal));
```

Schlick の近似式を使って、フレネル反射の強さを計算する（$\text{base}$ はベースの反射率、$\text{fresnel}$ は反射の強さ）。

$$\text{base}=0$$

$$\text{fresnel}=1$$

$$y=\text{base}+\left(1-\text{base}\right)\cdot\left(1-x\right)^5\cdot\text{fresnel}$$

![フレネル方程式のグラフ。xが増えるたびyは急速に 0 へ近づいていく。](https://i.imgur.com/GUBFyIH.png)

`_F0` はベースの反射率、`_Fresnel` は反射の強さ。

```c
half3 fresnel = (_F0 + (1.0h - _F0) * pow(1.0h - vdotn, 5)) * _Fresnel;
```

スペキュラー反射（鏡面反射）の変数をつくる。負にならないようにする。

```c
half3 specular = fresnel;
specular = max(0, specular);
```

元の色に、反射色とスペキュラー反射の値をかけた色を加えて、最終的な色を返す。

```c
return _MainColor + reflectionColor * half4(specular, 1);
```
