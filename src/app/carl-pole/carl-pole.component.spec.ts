import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarlPoleComponent } from './carl-pole.component';

describe('CarlPoleComponent', () => {
  let component: CarlPoleComponent;
  let fixture: ComponentFixture<CarlPoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarlPoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarlPoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
