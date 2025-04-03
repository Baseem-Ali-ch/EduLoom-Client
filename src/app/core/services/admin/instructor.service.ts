import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  // get user details from db
  getInstructor(): Observable<any> {
    return this._http.get(`${this._apiUrl}/admin/getAllInstructor`);
  }

  // update status
  updateInstructorStatus(id: string, status: boolean): Observable<any> {
    return this._http.patch(`${this._apiUrl}/admin/changeStatusIns/status`, { id, status });
  }
}
