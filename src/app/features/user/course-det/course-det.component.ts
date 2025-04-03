import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage, ICourse } from '../../../core/models/ICourse';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { CertificatePipe } from '../../../core/pipes/certificate.pipe';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { response } from 'express';
import { IUser } from '../../../core/models/IUser';
import { generateChatRoomId } from '../../../core/utils/chat.utils';

@Component({
  selector: 'app-course-det',
  standalone: true,
  imports: [SidebarComponent, CommonModule, ReactiveFormsModule, FormsModule, CertificatePipe, RouterModule],
  templateUrl: './course-det.component.html',
  styleUrls: ['./course-det.component.css'],
})
export class CourseDetComponent implements OnInit, OnDestroy {
  courseId: string | null = '';
  allCourses: ICourse[] = [];
  course!: ICourse | null;

  selectedLesson: any = null;
  selectedDoc: any = null;

  activeTab: string = 'Modules';
  tabs: string[] = ['Modules', 'Assignments', 'Quizzes', 'Live Classes', 'Chat'];
  isLoading = true;
  expandedModules: boolean[] = [];
  documents: { [key: string]: string } = {};

  showModal: boolean = false;
  assignmentForm!: FormGroup;
  selectedAssignmentId: string | null = null;
  submissions: { [assignmentId: string]: string } = {};

  showQuizModal: boolean = false;
  selectedQuiz: any = null;
  currentQuestionIndex: number = 0;
  answers: { [questionId: string]: string } = {};
  quizResults: { correct: number; wrong: number; skipped: number } = { correct: 0, wrong: 0, skipped: 0 };
  totalMark: number = 0;
  previouseQuizMark: number = 0;

  isEnrolled: boolean = false;
  coupons: any[] = [];
  offers: any[] = [];
  selectedCoupon: string = '';
  selectedOffer: string = '';
  discountedAmount: number = 0;
  showEnrollModal: boolean = false;

  progressPercentage: number = 0;
  isCourseCompleted: boolean = false;
  achievements: { [quizId: string]: boolean } = {};

  showCertificateModal: boolean = false;
  certificateDataUrl: string | null = null;

  chatMessages: { sender: string; message: string; timestamp: string; isInstructor: boolean }[] = [];
  chatForm!: FormGroup;
  socket!: Socket;
  studentId: string | null = null;
  instructorId: string | null = null;
  student!: IUser;

  private _subscription: Subscription = new Subscription();

  constructor(private _route: ActivatedRoute, private _courseService: CourseServiceService, private _fb: FormBuilder, private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.courseId = this._route.snapshot.paramMap.get('id');
    this.studentId = this.getStudentIdFromToken();
    this.getStudent();
    this.getCourse();
    this.getDocumentSignedUrl();
    this.assingmentForm();
    this.chatFormInit();
    this.loadSubmissions(this.courseId as string);
    this.checkEnrollmentStatus(this.courseId as string);
    this.initializeSocket();
  }

  assingmentForm() {
    this.assignmentForm = this._fb.group({
      link: ['', [Validators.required, Validators.pattern('https?://.+')]],
    });
  }

  getStudent() {
    this._subscription.add(
      this._courseService.getAllStudents().subscribe({
        next: (response) => {
          this.student = response.result.find((student: IUser) => this.studentId === student._id);
          console.log('students', this.student.userName);
        },
        error: (error) => {
          console.log('error find student', error);
        },
      })
    );
  }

  loadSubmissions(courseId: string): void {
    this._subscription.add(
      this._courseService.getStudentSubmissions(courseId).subscribe({
        next: (response) => {
          this.submissions = response.result.reduce((acc: any, sub: any) => {
            acc[sub.assignmentId] = sub.link;
            return acc;
          }, {});
        },
        error: (error) => console.error('Error fetching submissions:', error),
      })
    );
  }

  openAssignmentModal(assignmentId: string): void {
    this.selectedAssignmentId = assignmentId;
    this.showModal = true;
    const existingLink = this.submissions[assignmentId];
    this.assignmentForm.patchValue({ link: existingLink || '' });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAssignmentId = null;
    this.assignmentForm.reset();
  }

  submitOrUpdateAssignment(): void {
    if (this.assignmentForm.valid && this.selectedAssignmentId) {
      const link = this.assignmentForm.value.link;
      const courseId = this.course?._id as string;
      const isUpdate = !!this.submissions[this.selectedAssignmentId];

      this._subscription.add(
        this._courseService.submitAssignment(courseId, this.selectedAssignmentId, link).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: isUpdate ? 'Assignment Updated Successfully' : 'Assignment Submitted Successfully',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
            this.submissions[this.selectedAssignmentId!] = link;
            this.closeModal();
          },
          error: (error) => {
            console.error('Error:', error);
            Swal.fire({
              icon: 'error',
              title: isUpdate ? 'Update Failed' : 'Submission Failed',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
        })
      );
    } else {
      this.assignmentForm.markAllAsTouched();
    }
  }

  hasSubmission(assignmentId: string): boolean {
    return !!this.submissions[assignmentId];
  }

  getCourse() {
    this._subscription.add(
      this._courseService.getCourses().subscribe({
        next: (response) => {
          this.allCourses = response.result;
          this.isLoading = false;
          this.course = this.allCourses.find((course) => course._id === this.courseId) || null;
          if (this.course) {
            this.instructorId = typeof this.course.instructorId === 'string' ? this.course.instructorId! : this.course.instructorId?._id!;
            this.checkCourseCompletion();
            this.calculateProgress();
          }
        },
        error: (error) => console.error(error),
      })
    );
  }

  getDocumentSignedUrl(): void {
    const courseId = this._route.snapshot.paramMap.get('id') || '';
    if (courseId) {
      this._subscription.add(
        this._courseService.getDocSignedUrl(courseId).subscribe({
          next: (response) => {
            this.documents = response.result;
            this.course?.modules.forEach((module: any) => {
              module.lessons.forEach((lesson: any) => {
                if (lesson.document && this.documents[lesson.document]) {
                  lesson.document = this.documents[lesson.document];
                }
              });
            });
          },
          error: (error) => console.error('Error fetching signed URLs:', error),
        })
      );
    }
  }

  selectLesson(lesson: any): void {
    this.selectedLesson = null;
    setTimeout(() => {
      this.selectedLesson = lesson;
      this._cdr.detectChanges();
      if (this.isEnrolled) {
        this.markLessonAsViewed(lesson._id);
      }
    }, 0);
  }

  toggleModule(index: number): void {
    this.expandedModules[index] = !this.expandedModules[index];
  }

  openQuizModal(quiz: any): void {
    this.selectedQuiz = quiz;
    this.showQuizModal = true;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.quizResults = { correct: 0, wrong: 0, skipped: 0 };
  }

  closeQuizModal(): void {
    this.showQuizModal = false;
    this.selectedQuiz = null;
  }

  selectAnswer(questionId: string, optionText: string): void {
    this.answers[questionId] = optionText;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.selectedQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  skipQuestion(): void {
    const questionId = this.selectedQuiz.questions[this.currentQuestionIndex]._id;
    if (!this.answers[questionId]) {
      this.quizResults.skipped++;
    }
    this.nextQuestion();
  }

  submitQuiz(): void {
    const courseId = this.course?._id as string;
    const quizId = this.selectedQuiz._id;

    this._courseService.getQuizId(quizId);

    this.totalMark = 0;
    for (let question of this.selectedQuiz.questions) {
      const studentAnswer = this.answers[question._id];
      const correctAnswer = question.options.find((opt: any) => opt.isCorrect)?.optionText;
      if (studentAnswer && studentAnswer === correctAnswer) {
        this.totalMark += 1;
      }
    }

    const totalQuestions = this.selectedQuiz.questions.length;
    const percentage = (this.totalMark / totalQuestions) * 100;

    const quizResult = {
      course: this.course?.title,
      totalMark: this.totalMark,
      totalQuestions: totalQuestions,
      percentage: percentage.toFixed(2),
      date: new Date().toISOString(),
    };
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizResult));

    const resultsMessage = `
      Score: ${this.totalMark}/${totalQuestions}<br>
      Percentage: ${percentage.toFixed(2)}%
    `;

    if (percentage >= 50) {
      this.awardAchievement(quizId);
      Swal.fire({
        icon: 'success',
        title: 'Congratulations!',
        html: `Achievement Unlocked!`,
        toast: true,
        position: 'top-end',
        background: 'rgb(8, 10, 24)',
        color: 'white',
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Quiz Completed',
        html: resultsMessage,
        toast: true,
        position: 'top-end',
        background: 'rgb(8, 10, 24)',
        color: 'white',
      });
    }

    this.closeQuizModal();
  }

  // Award an achievement by storing it in local storage
  awardAchievement(quizId: string): void {
    const achievementKey = `achievement_${quizId}`;
    const achievement = {
      quizId: quizId,
      unlocked: true,
      unlockedDate: new Date().toISOString(),
    };
    localStorage.setItem(achievementKey, JSON.stringify(achievement));
  }

  getQuizButtonText(quizId: string): string {
    if (!this.isEnrolled) return 'Take Quiz';
    const storedResult = localStorage.getItem(`quiz_${quizId}`);
    if (storedResult) {
      const { percentage } = JSON.parse(storedResult);
      return parseFloat(percentage) >= 80 ? 'You Are Done' : 'Retake Quiz';
    }
    return 'Take Quiz';
  }

  getQuizButtonClass(quizId: string): string {
    if (!this.isEnrolled) return 'bg-blue-500 hover:bg-blue-600';
    const storedResult = localStorage.getItem(`quiz_${quizId}`);
    if (storedResult) {
      const { percentage } = JSON.parse(storedResult);
      return parseFloat(percentage) >= 80 ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-blue-500 hover:bg-blue-600';
  }

  getCurrentQuestion() {
    return this.selectedQuiz?.questions[this.currentQuestionIndex];
  }

  checkEnrollmentStatus(courseId: string): void {
    console.log('check enroll');
    this._subscription.add(
      this._courseService.checkEnrollment(courseId).subscribe({
        next: (response) => {
          this.isEnrolled = response.isEnrolled;
          console.log('is enrolled', response);
          if (this.isEnrolled) {
            this.chatForm.get('message')?.enable();
          } else {
            this.chatForm.get('message')?.disable();
          }
        },
        error: (error) => console.error('Error checking enrollment:', error),
      })
    );
  }

  loadCouponsAndOffers(): void {
    this._subscription.add(
      this._courseService.getCouponsAndOffers().subscribe({
        next: (response) => {
          this.coupons = response.result;
        },
        error: (error) => console.error('Error fetching coupons/offers:', error),
      })
    );
  }

  openEnrollModal(): void {
    this.showEnrollModal = true;
    this.loadCouponsAndOffers();
    this.selectedCoupon = '';
    this.selectedOffer = '';
    this.discountedAmount = this.course?.price as number;
  }

  closeEnrollModal(): void {
    this.showEnrollModal = false;
  }

  applyCouponOrOffer(): void {
    let discount = 0;
    const originalAmount = this.course?.price as number;

    if (this.selectedCoupon) {
      const coupon = this.coupons.find((c) => c._id === this.selectedCoupon);
      if (coupon) discount += coupon.discount;
    }

    if (this.selectedOffer) {
      const offer = this.offers.find((o) => o._id === this.selectedOffer);
      if (offer) discount += offer.discount;
    }

    this.discountedAmount = Math.max(0, originalAmount - discount);
  }

  async initiatePayment(): Promise<void> {
    const courseId = this.course?._id as string;
    const amount = this.discountedAmount * 100;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = () => {
      this._subscription.add(
        this._courseService.createRazorpayOrder(courseId, amount).subscribe({
          next: (response) => {
            const options = {
              key: environment.RAZORPAY_KEY_ID,
              amount: response.amount,
              currency: response.currency,
              name: 'EduLoom',
              description: `Enrollment for ${this.course?.title}`,
              order_id: response.id,
              handler: (paymentResponse: any) => {
                this.verifyPayment(paymentResponse, courseId);
              },
              prefill: {
                name: 'Student Name',
                email: 'student@example.com',
              },
              theme: { color: '#686CFD' },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          },
          error: (error) => {
            console.error('Error creating order:', error);
            Swal.fire({
              icon: 'error',
              title: 'Payment Initiation Failed',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
        })
      );
    };
  }

  verifyPayment(paymentResponse: any, courseId: string): void {
    this._subscription.add(
      this._courseService
        .verifyPayment({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          courseId,
        })
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.isEnrolled = true;
              this._courseService.enrollmentSubject(this.isEnrolled);
              Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: 'rgb(8, 10, 24)',
                color: 'white',
              });
              this.closeEnrollModal();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Payment Verification Failed',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: 'rgb(8, 10, 24)',
                color: 'white',
              });
            }
          },
          error: (error) => {
            console.error('Error verifying payment:', error);
            Swal.fire({
              icon: 'error',
              title: 'Payment Verification Failed',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
        })
    );
  }

  isContentLocked(tab: string, index?: number): boolean {
    if (this.isEnrolled) return false;
    if (tab === 'Modules' && index === 0) return false;
    return true;
  }

  markLessonAsViewed(lessonId: string): void {
    // Check if course is already completed
    if (localStorage.getItem(`completed_${this.courseId}`) === 'true') {
      return; // Don't update if already completed
    }

    const viewedLessons = JSON.parse(localStorage.getItem(`viewed_${this.courseId}`) || '[]');

    if (!viewedLessons.includes(lessonId)) {
      viewedLessons.push(lessonId);
      localStorage.setItem(`viewed_${this.courseId}`, JSON.stringify(viewedLessons));
      this.calculateProgress();
      this.checkCourseCompletion();
    }
  }

  calculateProgress(): void {
    if (!this.isEnrolled || !this.course) {
      this.progressPercentage = 0;
      return;
    }
    const totalLessons = this.course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0);
    const viewedLessons = JSON.parse(localStorage.getItem(`viewed_${this.courseId}`) || '[]');
    this.progressPercentage = totalLessons > 0 ? (viewedLessons.length / totalLessons) * 100 : 0;
    if (this.progressPercentage === 100) {
      localStorage.setItem('progress', `${this.progressPercentage}_${this.courseId}`);
    }
  }

  checkCourseCompletion(): void {
    if (!this.course) return;

    if (localStorage.getItem(`completed_${this.courseId}`) === 'true') {
      this.isCourseCompleted = true;
      this.progressPercentage = 100;
      return;
    }

    const totalLessons = this.course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0);
    const viewedLessons = JSON.parse(localStorage.getItem(`viewed_${this.courseId}`) || '[]');

    const isComplete = viewedLessons.length === totalLessons && totalLessons > 0;
    this.isCourseCompleted = isComplete;

    if (isComplete) {
      this.progressPercentage = 100;
      localStorage.setItem(`completed_${this.courseId}`, 'true');

      if (!localStorage.getItem('is certified')) {
        this.generateCertificatePreview();
        this.showCertificateModal = true;
        // localStorage.removeItem(`viewed_${this.courseId}`);
      }
    }
  }

  generateCertificatePreview(): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setDrawColor(200, 160, 80);
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);

    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(0);
    doc.text('CERTIFICATE', 148, 50, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(200, 160, 80);
    doc.text('OF COMPLETION', 148, 65, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(80);
    doc.text('This Certificate is Proudly Presented to', 148, 85, { align: 'center' });

    doc.setFontSize(26);
    doc.setTextColor(0);
    doc.setFont('times', 'italic');
    doc.text(`${this.student.userName}`, 148, 105, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('times', 'normal');
    doc.text(`For successfully completing the course:`, 148, 120, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`"${this.course?.title}"`, 148, 135, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 148, 165, { align: 'center' });

    this.certificateDataUrl = doc.output('datauristring');
    localStorage.setItem(`is certified_${this.course?._id}`, 'true');
  }

  downloadCertificate(): void {
    if (this.certificateDataUrl) {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setDrawColor(200, 160, 80);
      doc.setLineWidth(4);
      doc.rect(10, 10, 277, 190);

      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.rect(15, 15, 267, 180);

      doc.setFont('times', 'bold');
      doc.setFontSize(30);
      doc.setTextColor(0);
      doc.text('CERTIFICATE', 148, 50, { align: 'center' });

      doc.setFontSize(20);
      doc.setTextColor(200, 160, 80);
      doc.text('OF COMPLETION', 148, 65, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(80);
      doc.text('This Certificate is Proudly Presented to', 148, 85, { align: 'center' });

      doc.setFontSize(26);
      doc.setTextColor(0);
      doc.setFont('times', 'italic');
      doc.text(`${this.student.userName}`, 148, 105, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('times', 'normal');
      doc.text(`For successfully completing the course:`, 148, 120, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`"${this.course?.title}"`, 148, 135, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 148, 165, { align: 'center' });

      doc.save(`certificate_${this.courseId}.pdf`);
    }
  }

  closeCertificateModal(): void {
    this.showCertificateModal = false;
    this.certificateDataUrl = null;
  }

  generateCertificate(): void {
    this.generateCertificatePreview();
    this.downloadCertificate();
  }

  // awardAchievement(quizId: string): void {
  //   this.achievements[quizId] = true;
  //   localStorage.setItem(`achievements_${this.courseId}`, JSON.stringify(this.achievements));
  // }

  loadAchievements(): void {
    const storedAchievements = localStorage.getItem(`achievements_${this.courseId}`);
    this.achievements = storedAchievements ? JSON.parse(storedAchievements) : {};
  }

  hasAchievement(quizId: string): boolean {
    return !!this.achievements[quizId];
  }

  getStudentIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  chatFormInit(): void {
    this.chatForm = this._fb.group({
      message: [{ value: '', disabled: !this.isEnrolled }, Validators.required],
    });
  }

  initializeSocket(): void {
    this.socket = io(environment.apiUrl, {
      auth: { token: localStorage.getItem('token') },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Student connected to chat server with ID:', this.socket.id);
      if (this.studentId && this.instructorId) {
        const chatRoomId = this.generateChatRoomId();
        console.log('Student joining chat room:', chatRoomId);
        this.socket.emit('joinPrivateChat', { chatRoomId });
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('Student connection error:', err);
      // Add user feedback here
    });

    this.socket.on('chatMessage', (data: any) => {
      console.log('Student received message:', data);
      // Make sure we're using the right chatRoomId
      const expectedRoomId = this.generateChatRoomId();
      if (data.chatRoomId === expectedRoomId) {
        this.chatMessages.push({
          ...data,
          isInstructor: data.sender === this.instructorId,
        });
        this._cdr.detectChanges();
        this.scrollToBottom();
      } else {
        console.warn('Message for different room received:', data.chatRoomId, 'Expected:', expectedRoomId);
      }
    });

    this.socket.on('previousMessages', (messages: any[]) => {
      this.chatMessages = messages.map((msg) => ({
        ...msg,
        isInstructor: msg.sender === this.instructorId,
      }));
      this._cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  sendMessage(): void {
    if (this.chatForm.valid && this.studentId && this.instructorId) {
      const message = this.chatForm.value.message;
      const chatRoomId = this.generateChatRoomId();

      this.socket.emit('chatMessage', {
        chatRoomId,
        sender: this.studentId,
        message,
      });

      this.chatForm.reset();
    }
  }

  generateChatRoomId(): string {
    // Sort IDs to ensure consistent room ID regardless of who initiates
    const ids = [this.instructorId, this.studentId].sort();
    return `${ids[0]}_${ids[1]}`.replace(/[^a-zA-Z0-9]/g, '');
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
