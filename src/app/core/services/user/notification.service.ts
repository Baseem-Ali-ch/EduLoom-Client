import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // get all notifications
  getNotification(): Observable<any[]> {
    return this._http.get<any[]>(`${this._apiUrl}/student/notification`);
  }

  // update notification status
  updateNotificationStatus(id: string, status: string): Observable<any> {
    return this._http.put(`${this._apiUrl}/student/notification/${id}`, { status });
  }

  // send email if status accepted
  sendAcceptanceEmail(userId: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/send-email`, {
      userId,
      message: 'You are accepted!',
    });
  }
}
