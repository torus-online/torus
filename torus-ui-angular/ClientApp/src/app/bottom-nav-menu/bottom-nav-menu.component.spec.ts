import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavMenuComponent } from './bottom-nav-menu.component';

describe('BottomNavMenuComponent', () => {
  let component: BottomNavMenuComponent;
  let fixture: ComponentFixture<BottomNavMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomNavMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
