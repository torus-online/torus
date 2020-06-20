import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallMetamaskComponent } from './install-metamask.component';

describe('InstallMetamaskComponent', () => {
  let component: InstallMetamaskComponent;
  let fixture: ComponentFixture<InstallMetamaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallMetamaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallMetamaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
