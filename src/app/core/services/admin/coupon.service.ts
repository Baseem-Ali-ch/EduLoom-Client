import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICoupon } from '../../models/IAdmin';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private _apiUrl = environment.apiUrl;

  
    constructor(private _http: HttpClient) {}
  
    // get token from session
    getToken() {
      return localStorage.getItem('token');
    }
  
    // get user details from db
    getCoupons(): Observable<any> {
      return this._http.get(`${this._apiUrl}/admin/get-coupons`)
    }

    addCoupon(couponData: ICoupon): Observable<any>{
      return this._http.post(`${this._apiUrl}/admin/add-coupon`, {couponData})
    }
  
    // update status
    updateCouponStatus(id: string, status: boolean): Observable<any> {
      return this._http.patch(`${this._apiUrl}/admin/change-coupon/status`, { id, status });
    }

    updateCoupon(coupon: ICoupon): Observable<any> {
        return this._http.put(`${this._apiUrl}/admin/update-coupon/${coupon._id}`, coupon);
      }
}
