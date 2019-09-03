import { Component, OnInit, OnDestroy } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import { from, defer, animationFrameScheduler, timer, of, Observable } from 'rxjs';
import { concatMap, tap, map, observeOn, takeUntil, repeat } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-posenet',
  templateUrl: './posenet.component.html',
  styleUrls: ['./posenet.component.scss'],
  // changeDetection: 0,
})
export class PosenetComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  // 線條寬度，顏色
  lineWidth = 2;
  color = 'aqua';

  // image
  imageObj = new Image();
  imageName = 'https://angular.io/assets/images/logos/angular/angular.png';

  video: HTMLVideoElement;

  constructor() {
    // 載入圖片
    this.imageObj.src = this.imageName;
  }

  ngOnInit() {
    // 初始化相機
    this.webcam_init();
    const action$ = (model: posenet.PoseNet) =>
      defer(() => model.estimateMultiplePoses(this.video)).pipe(
        observeOn(animationFrameScheduler),
        tap((predictions: posenet.Pose[]) => this.renderPredictions(predictions)),
        takeUntil(timer(1000)),
        repeat()
      );
    // 訂閱Observeable
    this.subs.add(
      // 下載模型
      from(posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: 257,
        quantBytes: 2
      })).pipe(
        // 讀取圖片
        concatMap(model => this.loadImage$().pipe(map(() => model))),
        // 預測
        concatMap(model => action$(model)),
      ).subscribe()
    );
  }

  // Image Observable
  loadImage$(): Observable<(observer: any) => void> {
    return of((observer: any) => {
      this.imageObj.onload = () => {
        observer.onNext(this.imageObj);
        observer.onCompleted();
      };
      this.imageObj.onerror = (err) => {
        observer.onError(err);
      };
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // utils 計算工具
  calDistance(position1: { x: number, y: number }, position2: { x: number, y: number }, ): number {
    return Math.floor(Math.sqrt((position1.x - position2.x) ** 2 + (position1.y - position2.y) ** 2));
  }
  toTuple({ y, x }) {
    return [y, x];
  }

  // 初始化相機
  webcam_init() {
    this.video = document.getElementById('vid') as HTMLVideoElement;
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
        }
      })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          this.video.play();
        };
      });
  }

  // 預測完畫進去圖案上
  renderPredictions = (predictions: posenet.Pose[]) => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    // 設定寬高
    canvas.width = 800;
    canvas.height = 600;
    // 清空畫布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // 畫上Video
    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    // 定義最低準確度達多少就畫圖  (15%)
    const minConfidence = 0.15;
    // 把每一個物件畫上去
    predictions.forEach(({ score, keypoints }) => {
      if (score >= minConfidence) {
        this.drawKeypoints(keypoints, minConfidence, ctx);
        this.drawSkeleton(keypoints, minConfidence, ctx);
      }
    });
  }

  drawPoint(ctx: CanvasRenderingContext2D, y: number, x: number, r: number, color: string) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawSegment([ay, ax]: any, [by, bx]: any, color: string, scale: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  drawKeypoints(keypoints: posenet.Keypoint[], minConfidence: number, ctx: CanvasRenderingContext2D, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];
      if (keypoint.score < minConfidence) {
        continue;
      }
      const { y, x } = keypoint.position;
      if (i > 5) {
        this.drawPoint(ctx, y * scale, x * scale, 3, this.color);
      } else {
        if (i === 0) {
          // 根據肩膀寬度決定圖案大小
          const qrcodeSize = this.calDistance(keypoints[3].position, keypoints[4].position) * 2;
          ctx.drawImage(this.imageObj, x - (qrcodeSize / 2), y - (qrcodeSize / 2), qrcodeSize, qrcodeSize);
        }
      }
    }
  }

  drawSkeleton(keypoints: posenet.Keypoint[], minConfidence: number, ctx: CanvasRenderingContext2D, scale = 1) {
    const adjacentKeyPoints =
      posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach((keypoint) => {
      this.drawSegment(
        this.toTuple(keypoint[0].position), this.toTuple(keypoint[1].position), this.color,
        scale, ctx);
    });
  }
}
