import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { defer, Subject, of } from 'rxjs';
import { tap, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tensorflow-tutorial',
  templateUrl: './tensorflow-tutorial.component.html',
  styleUrls: ['./tensorflow-tutorial.component.scss']
})
export class TensorflowTutorialComponent implements OnInit {

  // 簡單的線性回歸
  predictInput$ = new Subject<number>();

  linearModel: tf.Sequential;

  result: number;

  train$ = () => defer(() => {
    // 建立一個模型
    this.linearModel = tf.sequential();
    // 加入一層
    this.linearModel.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    // 把模型打包，然後決定optimizer
    this.linearModel.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
    // 定義輸入
    const xs = tf.tensor1d([3.2, 4.4, 5.5]);
    const ys = tf.tensor1d([1.6, 2.7, 3.5]);
    // 訓練
    return this.linearModel.fit(xs, ys);
  }).pipe(
    tap(() => console.log('model trained!'))
  )

  predict$ = (val: number) => of(this.linearModel.predict(tf.tensor2d([val], [1, 1])))
    .pipe(
      tap((output: any) => console.log(Array.from(output.dataSync())[0])),
      map((output: any) => Array.from(output.dataSync())[0])
    )

  constructor() {
    this.train$().subscribe();
  }


  ngOnInit() {
    this.predictInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((val: number) => this.predict$(+val)),
      map((result: number) => this.result = result),
    ).subscribe();
  }
}
