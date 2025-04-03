import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { insAuthGuard } from './ins-auth.guard';

describe('insAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => insAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
