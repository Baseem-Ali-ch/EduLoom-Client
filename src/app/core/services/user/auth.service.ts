
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../../models/IUser';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn: boolean = false;
  private userSubject = new BehaviorSubject<any>(null);

  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // Register
  register(user: IUser): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/register`, { user });
  }

  // Verify OTP
  verifyOtp(email: string, otp: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/verify-otp`, { email, otp });
  }

  // Resend OTP
  resendOtp(email: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/resend-otp`, { email });
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/login`, { email, password });
  }

  // Forget Password
  forgetPassword(email: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/forget-password`, { email });
  }

  // Reset Password
  resetPassword(password: string, token: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/reset-password`, {
      password,
      token,
    });
  }

  // Login with Google
  googleLogin(googleData: { token: string }): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/google-auth`, googleData);
  }

  // Get token from local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('isLoggedIn') === 'true';
  }
}