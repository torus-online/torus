import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSharesDialogComponent } from './send-shares-dialog.component';

describe('SendSharesDialogComponent', () => {
  let component: SendSharesDialogComponent;
  let fixture: ComponentFixture<SendSharesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendSharesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendSharesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
