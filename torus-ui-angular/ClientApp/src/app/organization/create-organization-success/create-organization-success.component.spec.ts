import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganizationSuccessComponent } from './create-organization-success.component';

describe('CreateOrganizationSuccessComponent', () => {
  let component: CreateOrganizationSuccessComponent;
  let fixture: ComponentFixture<CreateOrganizationSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOrganizationSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrganizationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
