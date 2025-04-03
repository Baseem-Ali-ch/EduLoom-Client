import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { admAuthPreventGuard } from './adm-auth-prevent.guard';

describe('admAuthPreventGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => admAuthPreventGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
