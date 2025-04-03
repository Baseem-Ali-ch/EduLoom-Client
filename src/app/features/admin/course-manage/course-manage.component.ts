import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Subscription } from 'rxjs';
import { ICourse } from '../../../core/models/ICourse';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-manage',
  imports: [CommonModule, AdminSidebarComponent, RouterModule],
  templateUrl: './course-manage.component.html',
  styleUrl: './course-manage.component.css',
})
export class CourseManageComponent {
  allCourses: ICourse[] = [];
  progressPercentage: number = 0;
  courseId: string = '';

  private _subscription: Subscription = new Subscription();
  constructor(private _courseService: CourseServiceService) {}

  ngOnInit(): void {
    this.getCourse();
    const storedProgress = localStorage.getItem('progress');
    if (storedProgress !== null) {
      const [progressStr, courseId] = storedProgress.split('_');
      this.progressPercentage = Number(progressStr);
      this.courseId = courseId;
    }
  }

  // list all courses in dashboard
  getCourse() {
    const couponSubscription = this._courseService.getCourses().subscribe({
      next: (response) => {
        this.allCourses = response.result;
      },
      error: (error) => {
        console.error(error);
      },
    });
    this._subscription.add(couponSubscription);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
