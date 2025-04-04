import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/user/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Subscription, throwIfEmpty } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  token: string | null = '';
  showPassword: boolean = false;
  private _subscription: Subscription = new Subscription();

  constructor(private _router: Router, private _authService: AuthService, private _fb: FormBuilder, private _route: ActivatedRoute) {}

  ngOnInit() {
    this.form();
    this.token = this._route.snapshot.paramMap.get('token');
    // prevent navigate register page after loggined
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/student/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // reset password form
  form(): void {
    this.passwordForm = this._fb.group(
      {
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

  onSubmit() {
    if (this.passwordForm.valid) {
      const newPassword = this.passwordForm.get('password')?.value;
      const onSubmitSubscription = this._authService.resetPassword(newPassword, this.token).subscribe({
        next: (response) => {
          console.log('reset password successful', response);
          if (response) {
            Swal.fire({
              icon: 'success',
              title: response.message,
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
          console.log('failed to reset password', error);
        },
      });
      this._subscription.add(onSubmitSubscription);
    }
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
