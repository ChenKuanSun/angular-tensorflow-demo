import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawNumberComponent } from './draw-number.component';

describe('DrawNumberComponent', () => {
  let component: DrawNumberComponent;
  let fixture: ComponentFixture<DrawNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
