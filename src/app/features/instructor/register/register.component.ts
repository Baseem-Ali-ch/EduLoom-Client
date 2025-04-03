import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppState } from '../../../state/user/user.state';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/instructor/auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PasswordValidatorDirective } from '../../../core/directives/password-validator.directive';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, PasswordValidatorDirective],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  private _subscription: Subscription = new Subscription();

  constructor(private _fb: FormBuilder, private _store: Store<AppState>, private _authService: AuthService, private _router: Router) {
    // select the loading state
    // this.store
    //   .select(selectIsLoading)
    //   .subscribe((isLoading) => (this.isLoading = isLoading));
  }

  ngOnInit(): void {
    this.form();
    
    // prevent navigate register page after loggined
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/instructor/dashboard']);
    }
  }

  // registration form
  form(): void {
    this.registerForm = this._fb.group(
      {
        userName: ['', [Validators.required, Validators.minLength(5)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.matchPassword }
    );
  }

  // password match function
  matchPassword(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { misMatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const onSubmitSubscription = this._authService.register(this.registerForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            localStorage.setItem('token', res.token);
            this._router.navigate(['/instructor/dashboard']);
            Swal.fire({
              icon: 'success',
              title: 'Registered Successfully',
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
              title: 'Failed to register',
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
          console.log('Error during registration', error);
          const errorMessage = error.error?.message;
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
      this._subscription.add(onSubmitSubscription);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
