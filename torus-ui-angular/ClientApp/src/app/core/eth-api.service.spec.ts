import { TestBed } from '@angular/core/testing';

import { EthApiService } from './eth-api.service';

describe('EthApiService', () => {
  let service: EthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
