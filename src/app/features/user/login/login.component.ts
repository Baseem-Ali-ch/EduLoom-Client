import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/user/auth.service';
import Swal from 'sweetalert2';
import { selectIsLoading } from '../../../state/user/user.selector';
import { AppState } from '../../../state/user/user.state';
import { login } from '../../../state/user/user.action';
import { SocialLoginModule, SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { PasswordValidatorDirective } from '../../../core/directives/password-validator.directive';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  token!: string;
  isLoading: boolean = false;
  showPassword: boolean = false;
  private _subscription: Subscription = new Subscription();

  constructor(private _fb: FormBuilder, private _store: Store<AppState>, private _authService: AuthService, private _router: Router, private _socialAuthService: SocialAuthService) {
    // select the loading state
    this._store.select(selectIsLoading).subscribe((isLoading) => (this.isLoading = isLoading));
  }

  ngOnInit(): void {
    this.form();

    // prevent navigate login page after loggined
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/student/dashboard']);
    }

    this.renderGoogleSignInButton();
  }

  

  // login form
  form(): void {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // login submit function
  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this._store.dispatch(login({ email: email, password: password }));
      const loginSubscription = this._authService.login(email, password).subscribe({
        next: (res: any) => {
          if (res) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', res.token);
            localStorage.setItem('refresh-token', res.refreshToken);
            this._router.navigate(['/student/dashboard']);
            Swal.fire({
              icon: 'success',
              title: res.message || 'Login Successfull!',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          } 
          else {
            Swal.fire({
              icon: 'error',
              title: 'Login failed',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          }
        },
        error: (error) => {
          console.log('Error during login', error);
          const errorMessage = error.error?.message || 'Login Failed';
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
        },
      });
      this._subscription.add(loginSubscription);
    } else {
      console.log('no find email');
      this.loginForm.markAllAsTouched();
    }
  }

  // show and hide password handling
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  renderGoogleSignInButton() {
    if (typeof google === 'undefined') {
      console.error('Google API not loaded');
      return;
    }

    google.accounts.id.initialize({
      client_id: '608019199691-eelbp162ca7ckpck9ukqthqi9jp993k1.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(document.getElementById('google-login-btn'), {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
    });

    google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    const idToken = response.credential;

    const googleLoginSubscription = this._authService.googleLogin({ token: idToken }).subscribe({
      next: (res) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', res.token);
        this._router.navigate(['/student/dashboard']);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
      },
      error: (error) => {
        console.error('Google login error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Google Login Failed',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
      },
    });
    this._subscription.add(googleLoginSubscription);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
