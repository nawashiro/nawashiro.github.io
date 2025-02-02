---
title: "哲学対話イベントで使える Udon ギミックを作った話 #4 - マルチスレッド"
date: "2025-02-02"
---
## UdonSharp のマルチスレッド処理

長時間かかる処理を実行する際、軽量化のために別スレッドで処理を行いたいと考えました。しかし、UdonSharp は基本的にシングルスレッドで動作するため、マルチスレッド処理を直接的に実装することはできません。そこで、**AudioFilter**を利用して別スレッドを動かす方法を採用しました。音声の処理は画面の描画とは別のスレッドで実行されるため、この仕組みを活用することが可能です。

この方法については、[【VRChat】Udonでマルチスレッド処理を行う - ku6draVR](https://www.ku6dra.stream/blog/multithreading-in-udon) を参考にしました。以下の説明はこのサイトからの引用が多く含まれています。詳しく知りたい方や実装を試みる方は、原典を参照されることをお勧めします。

## Controller と Worker の用意

まず、**Controller**と**Worker**の 2 つのスクリプトを用意します。Worker スクリプトは無効化された空の Game Object に貼り付け、Audio Source コンポーネントを追加しておきます。

### Controller スクリプトの実装

Controller スクリプトでは、Worker を実行する関数を定義します。

```csharp
/// <summary>
/// Workerの実行を開始する関数
/// </summary>
public void WorkerExecute()
{
    if (_worker.enabled)
    {
        // Workerへ必要なデータを渡す
        _worker._Initialize(渡したい引数);
        _isWorkerRunning = _worker.IsRunning;

        // GameObject（またはAudioSource）を有効化し、OnAudioFilterRead()を実行させる
        // 実行中はWorkerに触らないこと
        _worker.gameObject.SetActive(true);
        SendCustomEventDelayedFrames(nameof(_CheckWorkerState), 4);
    }
}
```

次に、Worker の終了を監視する関数を用意します。

```csharp
/// <summary>
/// Workerの終了を監視する関数
/// </summary>
public void _CheckWorkerState()
{
    if (_isWorkerRunning[0])
    {
        SendCustomEventDelayedFrames(nameof(_CheckWorkerState), 4);
    }
    else
    {
        // 処理終了後はOnAudioFilterRead()が実行されないようにする
        _worker.gameObject.SetActive(false);
        _OnWorkerComplete();
    }
}
```

Worker が終了した際の処理も定義します。

```csharp
/// <summary>
/// Worker終了後の処理
/// </summary>
public void _OnWorkerComplete()
{
    // Workerが終了した後の処理をここに書く
}
```

### Worker スクリプトの実装

Worker スクリプトでは、初期化処理を行います。

```csharp
public void _Initialize(渡したい引数)
{
    // 実行前の処理をここに書く
    // 実行フラグを立てる
    IsRunning[0] = true;
}
```

次に、Audio Thread を用意します。

```csharp
// Audio Thread
public void _onAudioFilterRead()
{
    OnAudioFilterRead(null, 0);
}

private void OnAudioFilterRead(float[] _, int __)
{
    if (IsRunning[0])
    {
        _stopwatch.Restart();

        bool condition = true;
        while (condition)
        {
            // ここに時間のかかるループ処理を書く
            // ループ全体を一度に実行せず、一部だけを実行し、定期的に（数ミリ秒ごとが望ましい）経過時間を確認する
            // 一定時間経過したら中断
            if (_stopwatch.ElapsedMilliseconds >= 17)
            {
                condition = false;
            }
        }

        // 処理が完了したかチェック
        if (/* 処理完了条件 */)
        {
            // ループ内で使用した配列の解放など
            IsRunning[0] = false;
        }
    }
}
```

### 注意点

- **実行中は Worker に触らない**：実行中に Worker に触れると不具合が生じる可能性があります。データのやり取りをする場合は、配列の参照を経由してください。
- **Editor での動作**：Unity Editor で再生中に UdonSharpBehaviour コンポーネントが付いた Game Object を選択しないようにしてください。選択すると壊れる恐れがあります。
- **Audio Thread の占有**：Audio Thread を長時間占有しないように注意してください。長時間占有すると、その間の全ての音声出力が途切れてしまいます。

## 次回予告

次回は軽量化の続きを、特に斥力のランダムスキップと疑似乱数について扱います。

[ハッカソン成果物発表 - Udon Zettelkasten System の紹介](240911-udon-zettelkasten-system.md)