import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/instructor/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-ins-forget-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forget-password.component.html',
    styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponentIns implements OnInit, OnDestroy {
  forgetPasswordForm!: FormGroup;
  private _subscription: Subscription = new Subscription();

  constructor(private _authService: AuthService, private _router: Router, private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // forget password form
  form(): void {
    this.forgetPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  forgetPassword() {
    if (this.forgetPasswordForm.valid) {
      const email = this.forgetPasswordForm.get('email')?.value;
      const forgetPasswordSubscription = this._authService.forgetPassword(email).subscribe({
        next: (res) => {
          console.log('reset password', res);
          if (res) {
            Swal.fire({
              icon: 'success',
              title: res.message,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          }
          this._router.navigate(['/instructor/login']);
        },
        error: (error) => {
          console.log('failed to send reset password', error);
        },
      });
      this._subscription.add(forgetPasswordSubscription);
    }
  }
}
