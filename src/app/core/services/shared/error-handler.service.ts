import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: any): void {
    console.error('An error occurred:', error);

    let errorMessage = 'Something went wrong. Please try again later.';
    let errorTitle = 'Error';

    if (error instanceof HttpErrorResponse) {
      errorTitle = 'HTTP Error';
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later.';
          break;
        default:
          errorMessage = `HTTP Error ${error.status}: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorTitle = 'Application Error';
      errorMessage = error.message || errorMessage;
    }

    Swal.fire({
      icon: 'error',
      title: errorTitle,
      text: errorMessage,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: 'rgb(8, 10, 24)',
      color: 'white',
    });
  }
}
