import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageConsentDialogComponent } from './storage-consent-dialog.component';

describe('StorageConsentDialogComponent', () => {
  let component: StorageConsentDialogComponent;
  let fixture: ComponentFixture<StorageConsentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageConsentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageConsentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
