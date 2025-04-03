import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/user/auth.service';
import { registerSuccess } from '../../../state/user/user.action';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-otp',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './otp.component.html',
    styleUrl: './otp.component.css'
})
export class OtpComponent implements OnInit, OnDestroy {
  otpForm!: FormGroup;
  email!: string | null;
  isExpired: boolean = false;
  timer: any;
  remainingTime = 60;
  token!: string;
  user: any;
  private _subscription: Subscription = new Subscription();

  constructor(private _fb: FormBuilder, private _store: Store, private _route: ActivatedRoute, private _authService: AuthService, private _router: Router) {}

  ngOnInit(): void {
    this.form();

    this.startTimer();

    // retrive the email in params
    this._route.params.subscribe((params) => {
      this.email = params['email'];
    });

    // prevent navigate otp page after loggined
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/student/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // otp verification form
  form(): void {
    this.otpForm = this._fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // verify otp handling
  verifyOTP(): void {
    if (this.otpForm.valid && this.email) {
      const { otp } = this.otpForm.value;
      const verifyOtpSubscription = this._authService.verifyOtp(this.email, otp).subscribe({
        next: (res: any) => {
          if (res) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', res.token);
            this._router.navigate(['/student/dashboard']);
            Swal.fire({
              icon: 'success',
              title: res.message || 'Registration Successfull!',
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
              title: 'Registration failed',
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
          const errorMessage = error.error?.message || 'Registration Failed';
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
      this._subscription.add(verifyOtpSubscription);
    } else {
      console.log('no find email');
      this.otpForm.markAllAsTouched();
    }
  }

  // resend otp function handling
  resendOTP(): void {
    if (this.isExpired && this.email) {
      const resendOtpSubscription = this._authService.resendOtp(this.email).subscribe({
        next: (res: any) => {
          // Restart the timer after sending a new OTP
          this.startTimer();
        },
        error: (error) => {
          console.log('Error while resending OTP', error);
        },
      });
      this._subscription.add(resendOtpSubscription);
    } else {
      console.log('Please wait until the timer expires.');
    }
  }

  // timer handling function
  startTimer(): void {
    this.isExpired = false;
    this.remainingTime = 60;
    this.timer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.isExpired = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

 
}
