import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodelawsComponent } from './codelaws.component';

describe('CodelawsComponent', () => {
  let component: CodelawsComponent;
  let fixture: ComponentFixture<CodelawsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodelawsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodelawsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
