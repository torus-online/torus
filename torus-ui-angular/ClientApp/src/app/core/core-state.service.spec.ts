import { TestBed } from '@angular/core/testing';

import { CoreStateService } from './core-state.service';

describe('CoreStateService', () => {
  let service: CoreStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
