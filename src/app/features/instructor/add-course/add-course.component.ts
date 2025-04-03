import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { CouponService } from '../../../core/services/admin/coupon.service';
import { OfferService } from '../../../core/services/admin/offer.service';
import { ICoupon, IOffer } from '../../../core/models/IAdmin';
import { environment } from '../../../../environments/environment';
import { ILesson, IModule } from '../../../core/models/Instructor';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InstructorSidebarComponent],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css'],
})
export class AddCourseComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 4;
  courseForm!: FormGroup;
  coupons: ICoupon[] = [];
  offers: IOffer[] = [];
  private _subscription = new Subscription();
  courseId: string | null = null;
  isEditMode = false;
  isLoading: boolean = false;
  private filePreviews: Map<string, SafeUrl> = new Map();
  private saveAsDraft: boolean = false;

  constructor(private _fb: FormBuilder, private _courseService: CourseServiceService, private _couponService: CouponService, private _offerService: OfferService, private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initializeForm();
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourseData(this.courseId);
    } else {
      this.addModule();
    }
    this.getAllCoupon();
    this.getAllOffer();
  }

  get coursePreview() {
    return this.courseForm.value;
  }

  // course validation handling
  initializeForm(): void {
    this.courseForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', Validators.required],
      difficultyLevel: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      coupon: [''],
      offer: [''],
      status: ['draft'],
      modules: this._fb.array([]),
      assignments: this._fb.array([]),
      quizzes: this._fb.array([]),
      liveClasses: this._fb.array([]),
    });
  }

  // load the course data
  loadCourseData(courseId: string): void {
    this._courseService.getCourses().subscribe({
      next: (response) => {
        const course = response.result.find((c: any) => c._id === courseId);
        if (course) {
          this.courseForm.patchValue({
            title: course.title,
            description: course.description,
            category: course.category,
            difficultyLevel: course.difficultyLevel,
            price: course.price,
            coupon: course.coupon || '',
            offer: course.offer || '',
            status: course.status || 'draft',
          });

          const modulesArray = this.modulesArray;
          modulesArray.clear();

          course.modules.forEach((module: IModule) => {
            const lessonsArray = this._fb.array(
              module.lessons.map((lesson: ILesson) =>
                this._fb.group({
                  title: [lesson.title, Validators.required],
                  content: [lesson.content, Validators.required],
                  document: [lesson.document, Validators.required],
                })
              )
            );
            const moduleGroup = this._fb.group({
              title: [module.title, Validators.required],
              lessons: lessonsArray,
            });
            modulesArray.push(moduleGroup);
          });

          this.loadAssignments(course.assignments);
          this.loadQuizzes(course.quizzes);
          this.loadLiveClasses(course.liveClasses);
        }
      },
      error: (error) => console.error('Error loading course:', error),
    });
  }

  getDocumentDisplayValue(document: any): string {
    if (!document) return '';
    if (document instanceof File) {
      return document.name; // Display file name for uploaded files
    } else if (typeof document === 'string') {
      // Optionally, extract file name from URL for better readability
      const fileName = document.split('/').pop() || document;
      return fileName;
    }
    return '';
  }

  // load assignments
  loadAssignments(assignments: any[]): void {
    const assignmentsArray = this.getAssignmentsArray();
    assignmentsArray.clear();
    assignments.forEach((assignment: any) => {
      assignmentsArray.push(
        this._fb.group({
          assignmentTitle: [assignment.assignmentTitle, Validators.required],
          assignmentDescription: [assignment.assignmentDescription, Validators.required],
        })
      );
    });
  }

  // load the quizzes
  loadQuizzes(quizzes: any[]): void {
    const quizzesArray = this.getQuizzesArray();
    quizzesArray.clear();
    quizzes.forEach((quiz: any) => {
      const questionsArray = this._fb.array(
        quiz.questions.map((question: any) =>
          this._fb.group({
            questionText: [question.questionText, Validators.required],
            options: this._fb.array(
              question.options.map((option: any) =>
                this._fb.group({
                  optionText: [option.optionText, Validators.required],
                  isCorrect: [option.isCorrect],
                })
              )
            ),
          })
        )
      );
      quizzesArray.push(
        this._fb.group({
          title: [quiz.title, Validators.required],
          questions: questionsArray,
        })
      );
    });
  }

  // laod live class
  loadLiveClasses(liveClasses: any[]): void {
    const liveClassesArray = this.getLiveClassesArray();
    liveClassesArray.clear();
    liveClasses.forEach((liveClass: any) => {
      liveClassesArray.push(
        this._fb.group({
          title: [liveClass.title, Validators.required],
          scheduleDate: [liveClass.scheduleDate, Validators.required],
          duration: [liveClass.duration, Validators.required],
          meetingLink: [liveClass.meetingLink, Validators.required],
        })
      );
    });
  }

  // get all coupons
  getAllCoupon(): void {
    this._subscription.add(
      this._couponService.getCoupons().subscribe({
        next: (response) => (this.coupons = response.result),
        error: (error) => console.error(error),
      })
    );
  }

  // get all offer
  getAllOffer(): void {
    this._subscription.add(
      this._offerService.getOffers().subscribe({
        next: (response) => (this.offers = response.result),
        error: (error) => console.error(error),
      })
    );
  }

  // next step handle in course creation form
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.isStepValid()) {
        this.currentStep++;
      } else {
        this.markStepFieldsAsTouched();
      }
    }
  }

  // previous step handle in course creation form
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ensure the steps valid
  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return (this.courseForm.get('title')?.valid && this.courseForm.get('description')?.valid && this.courseForm.get('category')?.valid && this.courseForm.get('difficultyLevel')?.valid) || false;
      case 2:
        return this.modulesArray.valid;
      case 3:
        return true; // Adjust as needed
      case 4:
        return this.courseForm.get('price')?.valid || false;
      default:
        return true;
    }
  }

  markStepFieldsAsTouched(): void {
    switch (this.currentStep) {
      case 1:
        this.courseForm.get('title')?.markAsTouched();
        this.courseForm.get('description')?.markAsTouched();
        this.courseForm.get('category')?.markAsTouched();
        this.courseForm.get('difficultyLevel')?.markAsTouched();
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        this.courseForm.get('price')?.markAsTouched();
        break;
      default:
        break;
    }
  }

  // get modules array
  get modulesArray(): FormArray {
    return this.courseForm.get('modules') as FormArray;
  }

  // add modules
  addModule(): void {
    const moduleGroup = this._fb.group({
      title: ['', Validators.required],
      lessons: this._fb.array([]),
    });
    this.modulesArray.push(moduleGroup);
    this.addLesson(this.modulesArray.length - 1);
  }

  // delete modules
  deleteModule(moduleIndex: number): void {
    this.modulesArray.removeAt(moduleIndex);
  }

  // get lesson array
  getLessonsArray(moduleIndex: number): FormArray {
    return this.modulesArray.at(moduleIndex).get('lessons') as FormArray;
  }

  // add lesons
  addLesson(moduleIndex: number): void {
    const lessonGroup = this._fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      document: [null],
    });
    this.getLessonsArray(moduleIndex).push(lessonGroup);
  }

  // delete lessons
  deleteLesson(moduleIndex: number, lessonIndex: number): void {
    this.getLessonsArray(moduleIndex).removeAt(lessonIndex);
  }

  // get assignment array
  getAssignmentsArray(): FormArray {
    return this.courseForm.get('assignments') as FormArray;
  }

  // add assignment
  addAssignment(): void {
    const assignmentGroup = this._fb.group({
      assignmentTitle: ['', Validators.required],
      assignmentDescription: ['', Validators.required],
    });
    this.getAssignmentsArray().push(assignmentGroup);
  }

  // delete assignment array
  deleteAssignment(index: number): void {
    this.getAssignmentsArray().removeAt(index);
  }

  // get quiz array
  getQuizzesArray(): FormArray {
    return this.courseForm.get('quizzes') as FormArray;
  }

  // add quiz
  addQuiz(): void {
    const quizGroup = this._fb.group({
      title: ['', Validators.required],
      questions: this._fb.array([]),
    });
    this.getQuizzesArray().push(quizGroup);
  }

  // delete quiz
  deleteQuiz(index: number): void {
    this.getQuizzesArray().removeAt(index);
  }

  // get question array
  getQuestionsArray(quizIndex: number): FormArray {
    return this.getQuizzesArray().at(quizIndex).get('questions') as FormArray;
  }

  // add questions
  addQuestion(quizIndex: number): void {
    const questionGroup = this._fb.group({
      questionText: ['', Validators.required],
      options: this._fb.array([]),
    });
    this.getQuestionsArray(quizIndex).push(questionGroup);
  }

  // delete questions
  deleteQuestion(quizIndex: number, questionIndex: number): void {
    this.getQuestionsArray(quizIndex).removeAt(questionIndex);
  }

  // get options array
  getOptionsArray(quizIndex: number, questionIndex: number): FormArray {
    return this.getQuestionsArray(quizIndex).at(questionIndex).get('options') as FormArray;
  }

  // add options
  addOption(quizIndex: number, questionIndex: number): void {
    const optionGroup = this._fb.group({
      optionText: ['', Validators.required],
      isCorrect: [false],
    });
    this.getOptionsArray(quizIndex, questionIndex).push(optionGroup);
  }

  // delete options
  deleteOption(quizIndex: number, questionIndex: number, optionIndex: number): void {
    this.getOptionsArray(quizIndex, questionIndex).removeAt(optionIndex);
  }

  // get live class array
  getLiveClassesArray(): FormArray {
    return this.courseForm.get('liveClasses') as FormArray;
  }

  addLiveClass(): void {
    const liveClassGroup = this._fb.group({
      title: ['', Validators.required],
      scheduleDate: ['', Validators.required],
      duration: ['', Validators.required],
      meetingLink: ['', Validators.required],
    });
    this.getLiveClassesArray().push(liveClassGroup);
  }

  generateMeetLink(liveClassIndex: number): void {
    const liveClassGroup = this.getLiveClassesArray().at(liveClassIndex) as FormGroup;
    const title = liveClassGroup.get('title')?.value;
    const scheduleDate = liveClassGroup.get('scheduleDate')?.value;
    const duration = liveClassGroup.get('duration')?.value;

    if (!title || !scheduleDate || !duration) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill in all required fields before generating a meeting link',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'rgb(8, 10, 24)',
        color: 'white',
      });
      return;
    }

    // Generate a unique room name using the title and timestamp
    const roomName = `live-class-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    console.log('meeting link', meetingLink);
    // Update the form with the generated meeting link
    liveClassGroup.patchValue({ meetingLink });

    Swal.fire({
      icon: 'success',
      title: 'Meeting Link Generated Successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: 'rgb(8, 10, 24)',
      color: 'white',
    });
  }

  // delete live class
  deleteLiveClass(index: number): void {
    this.getLiveClassesArray().removeAt(index);
  }

  // slect files
  onFileChange(event: Event, moduleIndex: number, lessonIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const lessonControl = this.getLessonsArray(moduleIndex).at(lessonIndex);
      lessonControl.patchValue({ document: file });
      console.log('Selected file:', file.name, file.size, file.type);
    }
  }

  // Determine the type of document (image, video, pdf, etc.)
  getDocumentType(document: any): string {
    if (!document) return 'other';
    if (document instanceof File) {
      const mimeType = document.type.toLowerCase();
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType === 'application/pdf') return 'pdf';
      return 'other';
    } else if (typeof document === 'string') {
      const extension = document.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension!)) return 'image';
      if (['mp4', 'webm', 'ogg'].includes(extension!)) return 'video';
      if (extension === 'pdf') return 'pdf';
      return 'other';
    }
    return 'other';
  }

  // Get a preview URL for the document (handles both URLs and File objects)
  getDocumentPreviewUrl(document: any): SafeUrl | string {
    if (!document) return '';
    if (document instanceof File) {
      const fileKey = `${document.name}-${document.size}`;
      if (!this.filePreviews.has(fileKey)) {
        const url = URL.createObjectURL(document);
        this.filePreviews.set(fileKey, this.sanitizer.bypassSecurityTrustUrl(url));
      }
      return this.filePreviews.get(fileKey) as SafeUrl;
    } else if (typeof document === 'string') {
      return document; // Assume this is an S3 URL
    }
    return '';
  }

  // Check if the document is a File object (new upload) rather than a string (existing URL)
  isFileObject(document: any): boolean {
    return document instanceof File;
  }

  // course submit handle
  onSubmit(): void {
    if (this.courseForm.valid || this.saveAsDraft) {
      this.isLoading = true;

      const courseData = this.courseForm.value;
      const files: File[] = [];
      const formData = new FormData();

      courseData.modules.forEach((module: any) => {
        module.lessons.forEach((lesson: any) => {
          if (lesson.document instanceof File) {
            files.push(lesson.document);
          }
        });
      });

      const courseDataWithoutFiles = {
        ...courseData,
        status: this.saveAsDraft ? 'draft' : 'published',
        modules: courseData.modules.map((module: any) => ({
          title: module.title,
          lessons: module.lessons.map((lesson: any) => ({
            title: lesson.title,
            content: lesson.content,
            document: lesson.document instanceof File ? undefined : lesson.document,
          })),
        })),
      };

      formData.append('courseData', JSON.stringify(courseDataWithoutFiles));
      files.forEach((file) => formData.append('documents', file));

      let request: Observable<any>;
      if (this.isEditMode && this.courseId) {
        request = this.saveAsDraft
          ? this._courseService.updateCourse(this.courseId, formData)
          : this._courseService.updateCourse(this.courseId, formData).pipe(
              switchMap(() => this._courseService.publishCourse(this.courseId!)) // Publish after updating
            );
      } else {
        request = this._courseService.createCourse(formData);
        if (!this.saveAsDraft) {
          request = request.pipe(
            switchMap((response) => this._courseService.publishCourse(response.result._id)) // Publish after creating
          );
        }
      }

      this._subscription.add(
        request.subscribe({
          next: (response) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: this.saveAsDraft ? 'Course Saved as Draft' : this.isEditMode ? 'Course Updated and Published' : 'Course Created and Published',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
            this.router.navigate(['/instructor/courses']);
          },
          error: (error) => {
            console.error('Error:', error);
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: this.saveAsDraft ? 'Failed to Save Draft' : this.isEditMode ? 'Course Update Failed' : 'Course Creation Failed',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
          complete: () => {
            this.isLoading = false;
          },
        })
      );
    } else {
      this.courseForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Please fill all required fields',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'rgb(8, 10, 24)',
        color: 'white',
      });
    }
  }

  // Add a method to handle saving as draft
  saveDraft(): void {
    this.saveAsDraft = true;
    this.onSubmit();
  }

  // Add a method to handle publishing
  publish(): void {
    this.saveAsDraft = false;
    this.onSubmit();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
