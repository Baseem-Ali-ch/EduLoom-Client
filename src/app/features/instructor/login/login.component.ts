import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppState } from '../../../state/user/user.state';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/instructor/auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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

  constructor(private _fb: FormBuilder, private _authService: AuthService, private _router: Router) {}

  ngOnInit(): void {
    this.form();

    // prevent navigate login page after loggined
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/instructor/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
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
      const loginSubscription = this._authService.login(email, password).subscribe({
        next: (res: any) => {
          if (res) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', res.token);
            this._router.navigate(['/instructor/dashboard']);
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
          } else {
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
