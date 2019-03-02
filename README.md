# カルーセル
## 使い方

以下の構造でマークアップをします。（インデントは親子関係を表します）
セマンティクス上に問題がなければ、それぞれ任意のHTML要素を使用できます。
class名はオプションで変更することが可能です。

### script要素で以下のように記述をします。
#### デフォルト値で実行

```javascript
$('rootになる任意のclass名').setCarousel();
```

#### オプションを設定して実行
```javascript
$('rootになる任意のclass名').setCarousel({
　　プロパティ: オプション,
　　プロパティ: オプション,
　　プロパティ: オプション
});
```

#### マークアップ
```HTML
<div class="carousel（任意のclass名を設定。ここがrootになる）">
  <div class="carousel__slide-wrap">
    <div class="carousel__slide-inner">
      <div class="carousel__wrap">
        <div class="carousel__item">
          <p>任意の子要素</p>
        </div><!-- /.carousel__item -->
        <div class="carousel__item">
          <p>任意の子要素</p>
        </div><!-- /.carousel__item -->
      </div><!-- /.carousel__slide-wrap -->
    </div><!-- /.carousel__slide-inner -->
  </div><!-- /.carousel__slide-wrap -->
</div><!-- /.carousel -->

```

## オプション

|プロパティ|型|オプション|デフォルト値|説明|
|---|---|---|---|---|
|animationType|String|slide, fade|slide|アニメーションパターン|
|duration|Number|1000 / 任意の数値|300|スライドの速度（数値 / 1000 + 秒）|
|easing|String|cssの値と同様|ease|イージング|
|dots|Boolean|true, false|true|インジケーターの有無を設定できるようになる予定|
|column|Number|1~3まで|1|表示カラム数|
|spColumn|Number|1~3まで|none|ブレイクポイント以下のカラム数（設定しなければcolumnを引き継ぎます）|
|colMargin|Number|任意の数値|none|カラム間の余白（数値 + px）|
|autoPlay|Boolean|true, false|false|自動再生|
|onStopPlay|Boolean|true, false|false|マウスオンした際にスライドを停止する|
|playInterval|Number|任意の数値|5000|自動再生の間隔（数値 / 1000 + 秒）|
|swipe|Boolean|true, false|false|スワイプ判定の有無|
|breakPoint|Number|任意の数値|768|カラム数切り替える場合のwidth|
|resizeThreshold|Number|任意の数値|200|リサイズイベント発生間隔|

## 注意点
- autoPlayがtrueかつanimationTypeがslideの状態で、durationとplayIntervalを極端に早く設定し超高速自動再生を行うとスライドが静かに息を引き取ります。
