// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, catchError } from 'rxjs';
import { SharedService } from '../services/shared/shared.service';

export const studentAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const sharedService = inject(SharedService);
  const token = localStorage.getItem('token');

  // console.log('Interceptor triggered for URL:', req.url);

  if (token && !isTokenExpired(token)) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  if (token && isTokenExpired(token)) {
    // console.log('Token expired. Refreshing token...');
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      console.error('No refresh token found');
      return next(req);
    }

    return sharedService.refreshToken(refreshToken).pipe(
      switchMap((res: any) => {
        const newToken = res.token;
        localStorage.setItem('token', newToken);

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next(cloned);
      }),
      catchError((error) => {
        console.error('Failed to refresh token', error);
        return next(req);
      })
    );
  }

  console.log('No token found');
  return next(req);
};

// Helper function to check if the token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};
