import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/instructor/auth.service';
import { inject } from '@angular/core';

export const insAuthGuard: CanActivateFn = (route, state) => {
const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/instructor/login']);
    return false;
  }};
