import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn: boolean = false;

  constructor(private _http: HttpClient) {}

  private _apiUrl = environment.apiUrl;

  // login
  login(email: string, password: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/admin/login`, { email, password });
  }

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.loggedIn || localStorage.getItem('isLoggedIn') === 'true';
  }
}
