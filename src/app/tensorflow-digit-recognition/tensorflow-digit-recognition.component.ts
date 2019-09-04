import { Component, OnInit } from '@angular/core';
import { MnistData } from './dataPreprocessing/data';
import * as tf from '@tensorflow/tfjs';
import { defer, from } from 'rxjs';
import { tap, concatMap, map } from 'rxjs/operators';
import { buildModel, trainModel$ } from './model/cnn';

declare var tfvis: any;

@Component({
  selector: 'app-tensorflow-digit-recognition',
  templateUrl: './tensorflow-digit-recognition.component.html',
  styleUrls: ['./tensorflow-digit-recognition.component.scss']
})
export class TensorflowDigitRecognitionComponent implements OnInit {

  /**
   * 載入資料集
   * @returns `data` 回傳載入完成的資料集。
   */
  loadData$ = () => defer(async () => {
    const data = new MnistData();
    await data.load();
    return data;
  })

  /**
   * 檢視樣本
   * @param data  輸入一個資料集，並在Tensorflow visor樣板上顯示
   */
  showExamples$ = (data: MnistData) => defer(async () => {
    // 用Tensorflow visor(vega庫)做視覺化
    const surface =
      tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data' });

    // 取前20個範例
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];
    // 做成Canvas丟到tfvis的面板裡
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      canvas.style.margin = '4px';
      await tf.browser.toPixels((imageTensor as tf.Tensor<tf.Rank.R2>), canvas);
      surface.drawArea.appendChild(canvas);
      imageTensor.dispose();
    }
  })

  /**
   * 保存模型
   * @param model 輸入一個模型保存到`localstorage://my-model`
   */
  saveModel$ = (model: tf.Sequential) => from(model.save('localstorage://my-model'));


  constructor() { }


  ngOnInit() {
    console.log('載入資料');
    this.loadData$().pipe(
      tap(() => console.log('檢視樣本')),
      // 載入完之後把資料印出來
      concatMap((data: MnistData) => this.showExamples$(data).pipe(
        map(() => data)
      )),
      tap(() => console.log('建立模型')),
      // 建立模型
      map((data: MnistData) => {
        const model = buildModel();
        tfvis.show.modelSummary({ name: 'Model Architecture' }, model);
        return [model, data];
      }),
      // 訓練模型
      tap(() => console.log('訓練模型')),
      concatMap((value: [tf.Sequential, MnistData]) => trainModel$(...value).pipe(map(() => value))),
      // 保存模型
      tap(() => console.log('保存模型')),
      concatMap((value: [tf.Sequential, MnistData]) => this.saveModel$(value[0]).pipe(map(() => value))),
    ).subscribe();
  }




  /**
   * 從測試集裡驗證準確率
   * @param model 輸入一個模型
   * @param data 輸入一個資料集
   * @param testDataSize 輸入測試資料集大小
   * @return [`preds`, `labels`] 回傳一個預測的結果跟一個解答。
   */
  doPrediction(model: tf.Sequential, data: MnistData, testDataSize = 500) {
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const testData = data.nextTestBatch(testDataSize);
    const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
    const labels = testData.labels.argMax(-1);
    const preds = (model.predict(testxs) as tf.Tensor).argMax(-1);

    testxs.dispose();
    return [preds, labels];
  }


  // showAccuracy$ = (model: tf.Sequential, data: MnistData) => defer(async () => {
  //   const [preds, labels] = this.doPrediction(model, data);
  //   const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  //   const container = { name: 'Accuracy', tab: 'Evaluation' };
  //   tfvis.show.perClassAccuracy(container, classAccuracy, this.classNames);
  //   labels.dispose();
  // })

  // showConfusion$ = (model: tf.Sequential, data: MnistData) => defer(async () => {
  //   const [preds, labels] = this.doPrediction(model, data);
  //   const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  //   const container = { name: 'Confusion Matrix', tab: 'Evaluation' };
  //   tfvis.render.confusionMatrix(
  //     container, { values: confusionMatrix }, this.classNames);

  //   labels.dispose();
  // })


}
