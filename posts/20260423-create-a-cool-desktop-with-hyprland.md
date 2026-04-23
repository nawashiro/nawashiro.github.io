---
title: "【Linuxデスクトップ元年】hyperlandでかっこいいデスクトップをやる"
date: "2026-04-23T16:24:33+09:00"
---

[](https://brid.gy/publish/bluesky) [](https://brid.gy/publish/mastodon)

<img class="u-featured" src="https://i.imgur.com/y4swkSc.png" alt="End-4氏のhyprlandカスタムを導入した画面" style="display:none"/>

<p class="e-bridgy-mastodon-content e-bridgy-bluesky-content">Linuxデスクトップ（正確にはウィンドウ管理）にHyprlandを使うとなんだかすごくかっこよくなる。</p>

これは End-4 氏のカスタムを導入したもの。

![デスクトップのスクリーンショット](https://i.imgur.com/y4swkSc.png)

## TOC

## 環境

Fedora Workstation

## 基本

copr リポジトリの有効化

```bash
sudo dnf copr enable solopasha/hyprland
```

パッケージのインストール

```bash
sudo dnf install hyprland foot fuzzel mako hyprpaper waybar
```

日本語入力

```sh
sudo dnf install fcitx5 fcitx5-mozc fcitx5-configtool
```

設定

```conf:~/.config/hypr/hyprland.conf
# ==========================================
# Monitor & Autostart
# ==========================================
# 接続されたディスプレイを自動で最適解像度に設定
monitor=,preferred,auto,auto

# 必須デーモンの起動
exec-once = hyprpaper
exec-once = mako
exec-once = waybar

# ==========================================
# Input Method (Fcitx5)
# ==========================================
# 古いアプリでも日本語入力できるようにするためのおまじない
env = XMODIFIERS, @im=fcitx
env = QT_IM_MODULE, fcitx

# Hyprland起動時にバックグラウンドでFcitx5を自動起動
exec-once = fcitx5 -d

input {
    kb_layout = jp     # JISキーボード
}

# ==========================================
# Variables
# ==========================================
$terminal = foot
$menu = fuzzel
$mainMod = SUPER

# ==========================================
# Look & Feel
# ==========================================

# TODO

# ==========================================
# Keybindings (Vim-like / Essential)
# ==========================================
bind = $mainMod, Return, exec, $terminal  # ターミナル起動
bind = $mainMod, D, exec, $menu           # ランチャー起動
bind = $mainMod, Q, killactive,           # ウィンドウを閉じる
bind = $mainMod SHIFT, E, exit,           # Hyprlandを終了
bind = $mainMod, Space, togglefloating,   # フローティング切り替え
bind = $mainMod, F, fullscreen,           # フルスクリーン切り替え

# Vimキーバインドでのフォーカス移動
bind = $mainMod, H, movefocus, l
bind = $mainMod, L, movefocus, r
bind = $mainMod, K, movefocus, u
bind = $mainMod, J, movefocus, d

# ワークスペース切り替え (1〜5)
bind = $mainMod, 1, workspace, 1
bind = $mainMod, 2, workspace, 2
bind = $mainMod, 3, workspace, 3
bind = $mainMod, 4, workspace, 4
bind = $mainMod, 5, workspace, 5

# ウィンドウをワークスペースへ移動
bind = $mainMod SHIFT, 1, movetoworkspace, 1
bind = $mainMod SHIFT, 2, movetoworkspace, 2
bind = $mainMod SHIFT, 3, movetoworkspace, 3
```

再ログイン時に hyprland を選択する。

## アレンジレシピ

> [!WARNING]
> 
> 自分でカスタマイズせず、出来上がったものを導入する場合は「誰かが作ったすごいカスタムを導入する」まで飛ばしてください。
> 
> 既存のカスタムを除去する手間が発生します。

Wiki のサンプルをコピーする。

- [Variables – Hyprland Wiki](https://wiki.hypr.land/Configuring/Variables/)
- [Binds – Hyprland Wiki](https://wiki.hypr.land/Configuring/Binds/)

## Waybar

設定ファイル

```json:~/.config/waybar/config
{
    "layer": "top",
    "position": "top",
    "height": 36,
    "spacing": 10,
    "modules-left": ["hyprland/workspaces", "hyprland/window"],
    "modules-center": ["clock"],
    "modules-right": ["custom/weather", "pulseaudio", "tray"],

    "hyprland/workspaces": {
        "format": "{name}",
        "disable-scroll": true,
        "all-outputs": true
    },
    "hyprland/window": {
        "format": "{}",
        "max-length": 20
    },
    "clock": {
        "format": "{:%Y-%m-%d %H:%M}",
        "tooltip-format": "<tt>{calendar}</tt>"
    },
    "custom/weather": {
        "format": "{}",
        "exec": "curl -s 'wttr.in/Chiyoda?format=1'",
        "interval": 3600
    },
    "pulseaudio": {
        "format": "🔊  {volume}%",
        "format-muted": "Mute",
        "on-click": "pavucontrol"
    },
    "tray": {
        "spacing": 8
    }
}
```

スタイル

```css:~/.config/waybar/style.css
{
    "layer": "top",
    "position": "top",
    "height": 36,
    "spacing": 10,
    "modules-left": ["hyprland/workspaces", "hyprland/window"],
    "modules-center": ["clock"],
    "modules-right": ["custom/weather", "pulseaudio", "tray"],

    "hyprland/workspaces": {
        "format": "{name}",
        "disable-scroll": true,
        "all-outputs": true
    },
    "hyprland/window": {
        "format": "{}",
        "max-length": 20
    },
    "clock": {
        "format": "{:%Y-%m-%d %H:%M}",
        "tooltip-format": "<tt>{calendar}</tt>"
    },
    "custom/weather": {
        "format": "{}",
        "exec": "curl -s 'wttr.in/Chiyoda?format=1'",
        "interval": 3600
    },
    "pulseaudio": {
        "format": "🔊  {volume}%",
        "format-muted": "Mute",
        "on-click": "pavucontrol"
    },
    "tray": {
        "spacing": 8
    }
}
seduce5468@fedora:~$ ^C
seduce5468@fedora:~$ cat ~/.config/waybar/style.css
* {
  font-family: "sans-serif";
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 0;
  min-height: 0;
}

window#waybar {
  background-color: coral;
  /* バー全体の背景は透明 */
}

/* 左右・中央のブロックごとに背景色と角丸をつける */
.modules-left,
.modules-center,
.modules-right {
  background-color: rgba(30, 30, 46, 0.85);
  border-radius: 18px;
  padding: 0 16px;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: 8px;
  margin-left: 8px;
  color: #eeeeee;
}

#workspaces button {
  color: #6c7086;
  padding: 0 8px;
  transition: all 0.2s ease;
}

#workspaces button.active {
  color: #89b4fa;
  /* アクティブな画面は青色に */
}

#workspaces button:hover {
  background-color: transparent;
  color: #f38ba8;
  box-shadow: none;
}
```

プロセス再起動

```bash
killall waybar; waybar &
```

## ランダム背景

スクリプトを書く。

```sh:~/.config/hypr/random_wp.sh
#!/bin/bash

# 壁紙が入っているフォルダ
DIR="PATH/TO/IMAGE"

# 古い職人が生きていたら殺して、新しく雇い直す
killall hyprpaper
hyprpaper &
sleep 1

while true; do
    # フォルダの中からランダムに1枚選ぶ
    PIC=$(find "$DIR" -type f \( -iname \*.jpg -o -iname \*.png -o -iname \*.jpeg \) | shuf -n 1)

    if [ -n "$PIC" ]; then
        # 職人に画像を読み込ませて、画面に貼らせる
        hyprctl hyprpaper preload "$PIC"
        hyprctl hyprpaper wallpaper ",contain:$PIC" # containはお好みで
        # メモリ節約のため、画面に貼ってない古い画像を破棄させる
        hyprctl hyprpaper unload all
    fi

    # 3分（180秒）待ってからループの最初に戻る
    sleep 180
done
```

設定ファイル

```diff:~/.config/hypr/hyprland.conf
-exec-once = hyprpaper
+exec-once = ~/.config/hypr/random_wp.sh
```

ログインし直すと反映される。

## 誰かが作ったすごいカスタムを導入する

> [!WARNING]
> 
> 既存のカスタムがある場合は、適宜バックアップ等行い、除去してください。

設定ファイルを Hyprland dotfiles という。end_4 氏の dot を導入する。

[GitHub - end-4/dots-hyprland: Usability-first dotfiles · GitHub](https://github.com/end-4/dots-hyprland)

この三行でセットアップできる。

```bash
git clone https://github.com/end-4/dots-hyprland.git
cd dots-hyprland
./setup install
```
