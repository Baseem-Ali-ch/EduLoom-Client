import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  // get user details from db
  getUser(page: number, limit: number): Observable<any> {
    return this._http.get<any>(`${this._apiUrl}/admin/getAllUser?page=${page}&limit=${limit}`);
  }

  getUsers(): Observable<any> {
    return this._http.get<any>(`${this._apiUrl}/admin/getAllUser`);
  }

  // update status
  updateUserStatus(id: string, status: boolean): Observable<any> {
    return this._http.patch(`${this._apiUrl}/admin/changeStatus/status`, { id, status });
  }
}
