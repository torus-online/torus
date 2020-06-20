import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganizationSendingDialogComponent } from './create-organization-sending-dialog.component';

describe('CreateOrganizationSendingDialogComponent', () => {
  let component: CreateOrganizationSendingDialogComponent;
  let fixture: ComponentFixture<CreateOrganizationSendingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrganizationSendingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrganizationSendingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
