import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IInstructor } from '../../models/Instructor';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn: boolean = false;

  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // reigster
  register(instructor: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/register`, { instructor });
  }

  // login
  login(email: string, password: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/login`, { email, password });
  }

  // forget password
  forgetPassword(email: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/forget-password`, { email });
  }

  //reset password
  resetPassword(password: string, token: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/reset-password`, { password, token });
  }

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('isLoggedIn') === 'true';
  }
}
