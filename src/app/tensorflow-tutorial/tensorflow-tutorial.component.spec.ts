import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TensorflowTutorialComponent } from './tensorflow-tutorial.component';

describe('TensorflowTutorialComponent', () => {
  let component: TensorflowTutorialComponent;
  let fixture: ComponentFixture<TensorflowTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TensorflowTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TensorflowTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
