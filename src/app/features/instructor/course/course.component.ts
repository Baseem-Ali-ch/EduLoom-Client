import { Component, OnDestroy, OnInit } from '@angular/core';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { Router, RouterModule } from '@angular/router';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { Subscription } from 'rxjs';
import { ICourse } from '../../../core/models/ICourse';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [InstructorSidebarComponent, RouterModule, CommonModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css',
})
export class CourseComponent implements OnInit, OnDestroy {
  allCourses: ICourse[] = [];

  private _subscription: Subscription = new Subscription();
  constructor(private _courseService: CourseServiceService, private _router: Router) {}

  ngOnInit(): void {
    this.getCourse();
  }

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

  editCourse(courseId: string | undefined): void {
    this._router.navigate(['/instructor/courses', courseId]);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
