import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DrawableDirective } from './drawable.directive';
import * as tf from '@tensorflow/tfjs';
import { defer, Subject } from 'rxjs';
import { tap, map, debounceTime, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-draw-number',
  templateUrl: './draw-number.component.html',
  styleUrls: ['./draw-number.component.scss']
})
export class DrawNumberComponent implements OnInit, OnDestroy {
  // 收集訂閱統一取消訂閱
  subs = new SubSink();
  // 把資料轉成可觀察物件
  predictInput$ = new Subject<ImageData>();
  // 定義模型
  model: tf.LayersModel;
  // 定義結果
  result: string;
  // 這個中文不會打，應該是抓Directive取得的DOM
  @ViewChild(DrawableDirective, { static: false }) canvas: DrawableDirective;

  /**
   * 載入模型
   * @param model  輸入一個變數來保存模型。
   * @returns `model` 回傳一個已經載入完成的模型。
   */
  loadModel$ = () => defer(async () => this.model = await tf.loadLayersModel('assets/model.json'))
    .pipe(tap(() => console.log('model trained!')))

  /**
   * 預測模型
   * @param ImageData  輸入一個圖像來讓模型做預測
   * @returns `output` 傳回一個預測完的字串0-9，
   * 如果沒有預測結果，則回傳`辨識不出來`。
   */
  predict$ = (imageData: ImageData) => defer(
    // 避免記憶體爆掉
    async () => await tf.tidy(() => {
      // 把Canvas轉成Tensor Type
      let img: any = tf.browser.fromPixels(imageData, 1);
      img = img.reshape([1, 28, 28, 1]);
      img = tf.cast(img, 'float32');
      return this.model.predict(img);
    })
  ).pipe(
    // 除錯並觀察預測結果
    tap((output: any) => console.log(Array.from(output.dataSync()))),
    // 尋找準確度約為100%的值
    map((output: any) => Array.from(output.dataSync()).find((acc) => acc === 1)),
    // 過濾沒有結果的字轉成'辨識不出來'，轉換成字串
    map((output: string) => output ? output.toString() : '辨識不出來')
  )

  // 還在娘胎裡要做的事
  constructor() {
    // 載入模型
    this.loadModel$().subscribe();
  }

  // 生出來看到人要做的事
  ngOnInit() {

    // 上完廁所記得沖水，訂閱
    this.subs.add(
      // 當輸入持續800毫秒未改變就開始預測
      this.predictInput$.pipe(
        debounceTime(800),
        switchMap((img: ImageData) => this.predict$(img)),
        map((result: string) => this.result = result),
      ).subscribe()
    );
  }

  // 記得剪臍帶
  ngOnDestroy() {
    // 離開前沖水
    this.subs.unsubscribe();
  }

  // 清空結果
  clear() {
    this.canvas.clear();
    this.result = '';
  }

}
