import { TestBed } from '@angular/core/testing';

import { FeatureFlagsGuard } from './feature-flags.guard';

describe('FeatureFlagsGuard', () => {
  let guard: FeatureFlagsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FeatureFlagsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
