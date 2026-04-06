---
title: "Linux でファイルをいじると Google Drive と同期されるやつ"
date: "2026-04-06T16:50:47+09:00"
---

[](https://brid.gy/publish/bluesky) [](https://brid.gy/publish/mastodon)

> [!NOTE]
> 
> 2026 年 4 月 6 日: スクリプトに軽微な変更を加えました。ちょっと様子見中です。

Linux でファイルをいじると勝手に Google Drive と同期されるやつをやる。

私は Fedora Workstation を使用している。

## TOC

## インストール

[Rclone](https://rclone.org/) をインストールしておく。公式のドキュメントに従って GoogleDrive と連携しておく。

ローカルディレクトリとリモートディレクトリの接続を確立しておく。このとき、ローカルディレクトリは空の状態で行う。はじめから差分があるとちょっと具合が悪い。

```bash
rclone bisync ローカルディレクトリ gdrive:リモートディレクトリ --resync
```

## デバウンス監視スクリプトを書く

スクリプトを書く。以下をさせる。

- ログイン時に同期する
- ファイルに変更があれば、10 分待ってから同期する
- 同期処理中にファイル変更があれば中断する

注意点: ローカルとリモートが矛盾したときはローカルを優先しています。多くの場合これでいいと思いますが、保証はしません。`rclone bisync` コマンドの `--conflict-resolve` 引数を変更すれば、他のオプションを利用できます。詳しくは [rclone bisync](https://rclone.org/commands/rclone_bisync/) をご参照ください。

```bash
sudo nano /usr/local/bin/rclone-bisync-watch.sh 
```

```sh
#!/bin/bash

WATCH_DIR= # ローカルディレクトリを指定する。
REMOTE= # "gdrive:リモートディレクトリ" を指定する
LOCKFILE="/tmp/rclone-bisync.lock"
DEBOUNCE=600 # 同期したあと、待つ時間。単位は秒。

log() { echo "$(date '+%F %T') $1"; }

# 多重起動防止
exec 9>"$LOCKFILE"
flock -n 9 || exit 0

while true; do
    log "Running bisync..."

    # 同期中の変更を監視し、来たら rclone をSIGINTで止める（Graceful Shutdown狙い）
    (
      inotifywait -r -e modify,create,delete,move --exclude '\.swp$|\.tmp$' "$WATCH_DIR" >/dev/null 2>&1
      log "Change during bisync -> sending SIGINT"
      kill -INT "$RCLONE_PID" 2>/dev/null
    ) &
    MON_PID=$!

    # 同期。--recover は割り込みからの回復を支援
    rclone bisync "$WATCH_DIR" "$REMOTE" --recover --quiet --conflict-resolve path1 &
    RCLONE_PID=$!
    wait "$RCLONE_PID"
    STATUS=$?
    
    # 監視プロセスを掃除
    kill "$MON_PID" 2>/dev/null
    wait "$MON_PID" 2>/dev/null

    if [ $STATUS -eq 0 ]; then
        notify-send "rclone bisync" "Sync completed successfully"
    elif (( STATUS >= 128 )); then
        SIG=$((STATUS - 128))
        # ここで SIG=2 なら interrupted (SIGINT) と確定
        log "Sync interrupted (signal=$SIG, status=$STATUS)"
    else
        notify-send "rclone bisync ERROR" "Sync failed (status=$STATUS)"
    fi
    
    log "Bisync completed."

    # 変更検知（1イベントで即抜ける）
    inotifywait -r -e modify,create,delete,move --exclude '\.swp$|\.tmp$' "$WATCH_DIR" >/dev/null 2>&1

    log "Change detected. Waiting for debounce..."
    sleep $DEBOUNCE
done
```

実行権限を付与しておく。

```bash
sudo chmod +x /usr/local/bin/rclone-bisync-watch.sh
```

## systemd ユーザーサービスを作成する

「オンラインになってから実行せよ」など、なにかと指示することがある。

```bash
mkdir -p ~/.config/systemd/user  
nano ~/.config/systemd/user/rclone-bisync.service
```

```
[Unit]
Description=Rclone Bisync Watch Service
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/rclone-bisync-watch.sh
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

## 有効化する

```bash
systemctl --user daemon-reload
systemctl --user enable rclone-bisync.service
systemctl --user start rclone-bisync.service
```

再起動すると機能するはず。

## ログを見る

```
journalctl --user -u rclone-bisync.service -f
```
