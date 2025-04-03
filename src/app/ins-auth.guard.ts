import { CanActivateFn } from '@angular/router';

export const insAuthGuard: CanActivateFn = (route, state) => {
  return true;
};
