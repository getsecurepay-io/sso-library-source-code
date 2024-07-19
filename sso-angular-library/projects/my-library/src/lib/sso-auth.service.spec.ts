import { TestBed } from '@angular/core/testing';

import { SsoAuthService } from './sso-auth.service';

describe('SsoAuthService', () => {
  let service: SsoAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SsoAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
