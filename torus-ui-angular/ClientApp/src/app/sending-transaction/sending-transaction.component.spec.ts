import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendingTransactionComponent } from './sending-transaction.component';

describe('SendingTransactionComponent', () => {
  let component: SendingTransactionComponent;
  let fixture: ComponentFixture<SendingTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendingTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendingTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
