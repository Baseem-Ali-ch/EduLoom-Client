import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const errorHandleInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'An unknown error occured';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again';
        router.navigate(['/student/login']);
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission';
      } else if (error.status === 404) {
        errorMessage = 'Not found';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error, Please try again later';
      }
      Swal.fire({
        icon: 'error',
        title: errorMessage,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'rgb(8, 10, 24)',
        color: 'white',
      });
      return throwError(() => error);
    })
  );
};
