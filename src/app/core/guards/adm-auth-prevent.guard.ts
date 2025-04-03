import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/admin/auth.service';

export const admAuthPreventGuard: CanActivateFn = (route, state) => {
const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }
  return true;};};
