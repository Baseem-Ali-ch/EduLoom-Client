import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IRevenue } from '../../models/Instructor';
import { ICourse } from '../../models/ICourse';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private _apiUrl = environment.apiUrl;
  constructor(private _http: HttpClient) {}

  // Register
  refreshToken(refreshToken: string | null): Observable<any> {
    return this._http.post(`${this._apiUrl}/shared/refresh-token`, { refreshToken });
  }

  getRevenue(): Observable<any> {
    return this._http.get(`${this._apiUrl}/shared/revenue`);
  }

  getCourseByEnrollmentId(enrollmentId: string): Observable<any> {
    return this._http.get(`${this._apiUrl}/shared/enrollment/${enrollmentId}`);
  }

  withdrawAllRevenue(instructorId: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/shared/instructor/withdraw-all`, { instructorId });
  }

  withdrawAdmAllRevenue(instructorId: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/shared/admin/withdraw-all`, { instructorId });
  }
}
