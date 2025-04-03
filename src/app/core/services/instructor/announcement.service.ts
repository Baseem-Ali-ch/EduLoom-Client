import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private _apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<any> {
    return this.http.get(`${this._apiUrl}/instructor/announcements`);
  }

  getAnnouncement(id: string): Observable<any> {
    return this.http.get(`${this._apiUrl}/instructor/announcements/single/${id}`);
  }

  createAnnouncement(announcement: any): Observable<any> {
    console.log('announcement', announcement)
    return this.http.post(`${this._apiUrl}/instructor/announcements`, announcement);
  }

  updateAnnouncement(id: string, announcement: any): Observable<any> {
    return this.http.put(`${this._apiUrl}/instructor/announcements/${id}`, announcement);
  }

  deleteAnnouncement(id: string): Observable<any> {
    return this.http.delete(`${this._apiUrl}/instructor/announcements/${id}`);
  }
}
