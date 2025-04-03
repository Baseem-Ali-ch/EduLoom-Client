import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser } from '../../models/IUser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _apiUrl = environment.apiUrl;
  private _photoUrlSubject = new BehaviorSubject<string | null>(null);
  profilePhoto$ = this._photoUrlSubject.asObservable();

  constructor(private _http: HttpClient) {}

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  // get user details from db
  getInstructor(): Observable<any> {
    return this._http.get(`${this._apiUrl}/instructor/getInstructor`, {});
  }

  getImage(): Observable<any> {
    return this._http.get(`${this._apiUrl}/instructor/getImage`);
  }

  // update user details
  updateUser(userData: IUser): Observable<any> {
    return this._http.put(`${this._apiUrl}/instructor/profileUpdate`, userData, {});
  }

  updateProfilePhoto(photoUrl: string) {
    this._photoUrlSubject.next(photoUrl);
  }

  // upload profile photo
  uploadProfilePhoto(formData: FormData): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/profile-photo`, formData, {});
  }

  // get full image URL
  getFullImageUrl(photoUrl: string | undefined): string {
    if (!photoUrl) {
      return 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    }
    return photoUrl.startsWith('http') ? photoUrl : `${this._apiUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
  }

  // change password
  changePassword(passwordData: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/change-password`, passwordData, {});
  }

  logout(): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/logout`, {});
  }
}
