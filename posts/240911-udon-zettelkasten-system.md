---
title: "ハッカソン成果物発表 - Udon Zettelkasten System の紹介"
date: "2024-09-11"
---

このテキストは、PNG ミュージアム × エンジニア集会ハッカソンの発表スライドをテキスト形式でまとめたものです。

## 刑事ドラマでよく見る「アレ」

- 壁にメモを貼り、糸でつないで整理するアレ。
- **ツェッテルカステン** - メモを整理する手法のひとつ。
- **Obsidian** のようなノートアプリでよく見かける。
- その「アレ」を **VRChat の中で実現** したい！

## さまざまなユースケースで役立つはず

- **哲学カフェ** などのディスカッションイベント
- VRChat 内での **バーチャル会議**
- **アイデア出し** や **ブレインストーミング**

## Udon Zettelkasten System

**VRChat 内で使える PKM ギミックを開発しました！**

(PKM = Personal Knowledge Management)

## 機能紹介 ①

- **メモの追加**: タイトル、色、テキスト、他のメモへのリンクを指定できる
- **メモの編集・削除**: メモを Use すると詳細が表示され、編集・削除ができる。
- **データ保存**: メモ帳などに保存して、インスタンスが変わっても編集を再開できる。

## 機能紹介 ②

- **多言語対応**: ChatGPT が一晩でやってくれました。なので正確性は 🥴
  - システムのタイムゾーンから自動で切り替わります。
- **計算の制限**: デフォルトで有効
  - メモが増えると計算量が指数関数的に増大するため、一定量を超えたら制限。
  - 計算誤差が発生する代わりに、動作が軽くなります。
- **LLM 向けの書き出し機能**:
  - NotebookLM などに資料として読ませるためのエクスポート機能

## その他の取り組み

- **シェーダー初挑戦！**
  - 地面のシェーダーを初めて書きました。
    - **ウユニ塩湖** のようなきれいに反射する地面にしたかった
    - **フレネル反射**を実装した
- **Booth ストア開設！**
  - Udon Zettelkasten System は **アセットとして販売予定** です（記事作成時点で販売開始しました！）。

https://nawashiro.booth.pm/items/6082934

## お礼

この場を借りて、制作にご協力いただいた方々に感謝いたします。

- **leafsketch さん**
- **不和カプリ さん**

本当にありがとうございます！

## リンク

**ぜひ、こちらのワールドで遊んでみてください！**

https://vrchat.com/home/world/wrld_b6c40f25-1670-4e73-849e-d8b5f4794951