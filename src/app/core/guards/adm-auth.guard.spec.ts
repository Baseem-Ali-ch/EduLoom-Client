import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { admAuthGuard } from './adm-auth.guard';

describe('admAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => admAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
