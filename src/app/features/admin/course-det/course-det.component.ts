import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { ICourse } from '../../../core/models/ICourse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-course-det',
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './course-det.component.html',
  styleUrl: './course-det.component.css'
})
export class CourseDetComponent implements OnInit, OnDestroy{
courseId: string | null = '';
  allCourses: ICourse[] = [];
  course!: ICourse | null;
  selectedLesson: any = null;
  activeTab: string = 'Modules';
  tabs: string[] = ['Modules', 'Assignments', 'Quizzes', 'Live Classes'];
  isLoading = true;
  expandedModules: boolean[] = [];
  documents: { [key: string]: string } = {};
  private _subscription: Subscription = new Subscription();

  constructor(private _route: ActivatedRoute, private _courseService: CourseServiceService) {}

  ngOnInit(): void {
    this.courseId = this._route.snapshot.paramMap.get('id');
    this.getCourse();
    this.getDocumentSignedUrl();
  }

  getCourse() {
    const courseSubscription = this._courseService.getCourses().subscribe({
      next: (response) => {
        this.allCourses = response.result;
        this.isLoading = false;
        this.course = this.allCourses.find((course) => course._id === this.courseId) || null;
        if (response.modules?.length && response.modules[0].lessons?.length) {
          this.selectedLesson = response.modules[0].lessons[0];
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
    this._subscription.add(courseSubscription);
  }

  getDocumentSignedUrl(): void {
    const courseId = this._route.snapshot.paramMap.get('id') || '';
    console.log('courseid', courseId);
    if (courseId) {
      const documentSubscription = this._courseService.getDocSignedUrl(courseId).subscribe({
        next: (response) => {
          this.documents = response.result;
          console.log('Signed URLs:', this.documents);

          this.course?.modules.forEach((module: any) => {
            module.lessons.forEach((lesson: any) => {
              if (lesson.document && this.documents[lesson.document]) {
                lesson.document = this.documents[lesson.document];
              }
            });
          });
        },
        error: (error) => {
          console.error('Error fetching signed URLs:', error);
        },
      });
      this._subscription.add(documentSubscription);
    }
  }

  selectLesson(lesson: any): void {
    this.selectedLesson = lesson;
  }

  toggleModule(index: number): void {
    this.expandedModules[index] = !this.expandedModules[index];
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
