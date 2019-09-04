import { Directive, HostListener, ElementRef, Output, EventEmitter, OnInit } from '@angular/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[drawable]'
})
export class DrawableDirective implements OnInit {
  pos = { x: 0, y: 0 };
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  @Output() newImage = new EventEmitter();

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.canvas = this.el.nativeElement as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
  }

  @HostListener('mouseup', ['$event'])
  onUp(event) {
    this.newImage.emit(this.getImgData());
  }

  @HostListener('mouseenter', ['$event'])
  onEnter(event) {
    this.setPosition(event);
  }

  @HostListener('mousedown', ['$event'])
  onMove(event) {
    this.setPosition(event);
  }

  @HostListener('mousemove', ['$event'])
  onDown(event) {

    if (event.buttons !== 1) {
      return;
    }

    this.ctx.beginPath(); // begin

    this.ctx.lineWidth = 10;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#111111';

    this.ctx.moveTo(this.pos.x, this.pos.y);
    this.setPosition(event);
    this.ctx.lineTo(this.pos.x, this.pos.y);

    this.ctx.stroke();
  }

  @HostListener('resize', ['$event'])
  onResize(event) {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
  }

  setPosition(event) {
    this.pos.x = event.offsetX;
    this.pos.y = event.offsetY;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  getImgData(): ImageData {
    return this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

}
