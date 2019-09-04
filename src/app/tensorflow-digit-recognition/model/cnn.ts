/**
 * @license
 * 這些程式碼遵循Apache License
 * 自Tensorflow.js官方 https://www.tensorflow.org
 * 程式碼加以修正而完成
 */

import * as tf from '@tensorflow/tfjs';
import { defer } from 'rxjs';
import { MnistData } from '../dataPreprocessing/data';
declare var tfvis: any;

/**
 * 建立NN模型
 * @description 會建立一個28*28*1(HWC)的輸入，然後經過2組
 * 2D卷積跟MaxPooling，最後展平之後Softmax到10組結果。
 * 使用adam優化器
 * @return `model` 回傳一個建立完成的模型。
 */
export const buildModel = () => {
  const model = tf.sequential();
  // 28*28*1通道
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;

  // 增加一個2D卷基層
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));

  // 增加一個Max Pooling
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  // 一組不能解決的問體，就再多幾組(X
  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  // 展平層
  model.add(tf.layers.flatten());

  // Dense之後Softmax成10個輸出
  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  // 選擇optimizer 範例選亞當，應該沒有夏哇
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
};

/**
 * 訓練模型
 * @description 會建立一個28*28*1(HWC)的輸入，然後經過2組
 * 2D卷積跟MaxPooling，最後展平之後Softmax到10組結果。
 * 使用adam優化器
 * @param model 輸入一個定義好的NN網路。
 * @param data 輸入一個資料集(含訓練及測試)。
 * @return `model` 回傳一個訓練完成的模型。
 */
export const trainModel$ = (model: tf.Sequential, data: MnistData) => defer(async () => {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training', styles: { height: '1000px' }
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = 5500;
  const TEST_DATA_SIZE = 1000;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [
      d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
      d.labels
    ];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);
    return [
      d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
      d.labels
    ];
  });

  return await model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 20,
    shuffle: true,
    callbacks: fitCallbacks
  });
});


