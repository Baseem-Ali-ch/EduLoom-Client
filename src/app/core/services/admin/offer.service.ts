import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IOffer } from '../../models/IAdmin';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private _apiUrl = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  // get token from session
  getToken() {
    return localStorage.getItem('token');
  }

  // get user details from db
  getOffers(): Observable<any> {
    return this._http.get(`${this._apiUrl}/admin/get-offers`);
  }

  addOffer(offerData: IOffer): Observable<any> {
    return this._http.post(`${this._apiUrl}/admin/add-offer`, { offerData });
  }

  // update status
  updateOfferStatus(id: string, status: boolean): Observable<any> {
    return this._http.patch(`${this._apiUrl}/admin/change-offer/status`, { id, status });
  }

  updateOffer(offer: IOffer): Observable<any> {
    return this._http.put(`${this._apiUrl}/admin/update-offer/${offer._id}`, offer);
  }
}
