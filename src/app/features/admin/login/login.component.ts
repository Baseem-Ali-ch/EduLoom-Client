import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/admin/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  token!: string;
  isLoading: boolean = false;
  showPassword: boolean = false;
  private _subscription: Subscription = new Subscription();

  constructor(private _fb: FormBuilder, private _adminAuthService: AuthService, private _router: Router) {}

  // ng on init
  ngOnInit(): void {
    this.form();

    // prevent navigate login page after loggined
    if (this._adminAuthService.isLoggedIn()) {
      this._router.navigate(['/admin/dashboard']);
    }
  }
  
  // ng on destroy
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
      const adminAuthServiceSubscription = this._adminAuthService.login(email, password).subscribe({
        next: (res: any) => {
          if (res) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', res.token);
            this._router.navigate(['/admin/dashboard']);
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
      this._subscription.add(adminAuthServiceSubscription);
    } else {
      console.log('no find email');
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
