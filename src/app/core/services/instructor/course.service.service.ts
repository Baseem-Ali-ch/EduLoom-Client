import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap } from 'rxjs';
import { ICourse } from '../../models/ICourse';
import { environment } from '../../../../environments/environment';
import { IUser } from '../../models/IUser';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class CourseServiceService {
  private _apiUrl = environment.apiUrl;
  private _clientId = environment.ZOOM_CLIENT_ID;
  private _clientSecret = environment.ZOOM_SECRET_ID;
  private _enrollmentSubject = new BehaviorSubject<boolean>(false);
  enrollment$ = this._enrollmentSubject.asObservable();
  private _quizIdSubject = new BehaviorSubject<string | null>(null);
  quizId$ = this._quizIdSubject.asObservable();

  constructor(private _http: HttpClient) {}

  // get course api
  getCourses(): Observable<any> {
    return this._http.get<ICourse[]>(`${this._apiUrl}/instructor/get-courses`);
  }

  // create course api
  createCourse(formData: FormData): Observable<any> {
    console.log('Sending FormData to backend:');
    for (let [key, value] of (formData as any).entries()) {
      console.log(`${key}:`, value);
    }
    return this._http.post(`${this._apiUrl}/instructor/create-course`, formData);
  }

  publishCourse(courseId: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/publish-course/${courseId}`, {});
  }

  // update course api
  updateCourse(courseId: string, formData: FormData): Observable<any> {
    return this._http.put(`${this._apiUrl}/instructor/update-course/${courseId}`, formData);
  }

  // get documents as a signed url api
  getDocSignedUrl(courseId: string): Observable<any> {
    return this._http.get(`${this._apiUrl}/instructor/get-doc`, { params: { courseId } });
  }

  // submit assignment api
  submitAssignment(courseId: string, assignmentId: string, link: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/submit-assignment`, { courseId, assignmentId, link });
  }

  // get assignment submission api
  getStudentSubmissions(courseId: string): Observable<any> {
    return this._http.get(`${this._apiUrl}/student/submissions/${courseId}`);
  }

  // submit quiz api
  submitQuiz(courseId: string, quizId: string, answers: { [questionId: string]: string }): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/submit-quiz`, { courseId, quizId, answers });
  }

  // check student enrollment api
  checkEnrollment(courseId: string): Observable<any> {
    return this._http.get(`${this._apiUrl}/student/enrollment/${courseId}`, { withCredentials: true });
  }

  // get coupon api
  getCouponsAndOffers(): Observable<any> {
    return this._http.get(`${this._apiUrl}/student/coupons`);
  }

  // payment handle api
  createRazorpayOrder(courseId: string, amount: number): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/enroll`, { courseId, amount });
  }

  // payment verify handle api
  verifyPayment(paymentData: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/student/verify-payment`, paymentData);
  }

  getAllStudents(): Observable<any> {
    return this._http.get(`${this._apiUrl}/instructor/get-students`);
  }

  enrollmentSubject(status: boolean) {
    this._enrollmentSubject.next(status);
  }

  getQuizId(quizId: string) {
    this._quizIdSubject.next(quizId);
  }

  generateZoom(title: string, scheduleDate: string, duration: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/instructor/zoom/create-meeting`, { title, scheduleDate, duration });
  }
}
