// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { catchError, map, mergeMap, Observable, of, tap } from 'rxjs';
// import * as AuthAction from './user.action';
// import Swal from 'sweetalert2';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { Injectable } from '@angular/core';

// @Injectable()
// export class AuthEffects {
//   constructor(
//     private actions$: Actions,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     console.log('auth service', this.authService)
//   }

//   register$ = createEffect(() => 
//     this.actions$.pipe(
//       ofType(AuthAction.register),
//       tap(action => console.log('Register action:', action)), // Add debug logging
//       mergeMap(action => 
//         this.authService.register(action.email, action.password, action.userName).pipe(
//           map(() => AuthAction.registerSuccess({ email: action.email })),
//           catchError(error => {
//             console.error('Registration error:', error);
//             return of(AuthAction.authFailure({ error: error.message }));
//           })
//         )
//       )
//     )
//   )

//   registerSuccess$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(AuthAction.registerSuccess),
//         tap(({ email }) => {
//           this.router.navigate(['/otp-verify'], {
//             queryParams: { email },
//           });
//           Swal.fire({
//             icon: 'success',
//             title: 'Registration Successful',
//             text: 'Please verify your OTP',
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             background: 'rgb(8, 10, 24)',
//             color: 'white',
//           });
//         })
//       ),
//     { dispatch: false }
//   );

//   verifyOtp$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthAction.verifyOtp),
//       mergeMap((action) =>
//         this.authService.verifyOtp(action.email, action.otp).pipe(
//           map((user) => AuthAction.verifyOtpSuccess({ user })),
//           catchError((error) =>
//             of(AuthAction.authFailure({ error: error.message }))
//           )
//         )
//       )
//     )
//   );

//   verifyOtpSuccess$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(AuthAction.verifyOtpSuccess),
//         tap(() => {
//           this.router.navigate(['/dashboard']);
//           Swal.fire({
//             icon: 'success',
//             title: 'OTP Verified',
//             text: 'Welcome to your dashboard',
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             background: 'rgb(8, 10, 24)',
//             color: 'white',
//           });
//         })
//       ),
//     { dispatch: false }
//   );

//   login$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(AuthAction.login),
//       mergeMap((action) =>
//         this.authService.login(action.email, action.password).pipe(
//           map((user) => AuthAction.loginSuccess({ user })),
//           catchError((error) =>
//             of(AuthAction.authFailure({ error: error.message }))
//           )
//         )
//       )
//     )
//   );

//   loginSuccess$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(AuthAction.loginSuccess),
//         tap(() => {
//           this.router.navigate(['/dashboard']);
//           Swal.fire({
//             icon: 'success',
//             title: 'Login Successful',
//             toast: true,
//             position: 'top-end',
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             background: 'rgb(8, 10, 24)',
//             color: 'white',
//           });
//         })
//       ),
//     { dispatch: false }
//   );

//   logout$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(AuthAction.logout),
//         tap(() => {
//           this.authService.logout();
//           this.router.navigate(['/login']);
//         })
//       ),
//     { dispatch: false }
//   );
// }
