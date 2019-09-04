import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TensorflowDigitRecognitionComponent } from './tensorflow-digit-recognition.component';

describe('TensorflowDigitRecognitionComponent', () => {
  let component: TensorflowDigitRecognitionComponent;
  let fixture: ComponentFixture<TensorflowDigitRecognitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TensorflowDigitRecognitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TensorflowDigitRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
