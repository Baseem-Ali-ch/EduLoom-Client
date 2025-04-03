import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AppState } from '../../../state/user/user.state';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../state/user/user.selector';
import { IUser } from '../../../core/models/IUser';
import { Observable, Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ICourse } from '../../../core/models/ICourse';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  courses: ICourse[] = [];
  progressPercentage: number = 0;
  storedCourseId: string | null = null;
  isCompleted: boolean = false

  private _subscription: Subscription = new Subscription();
  constructor(private _courseService: CourseServiceService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this._courseService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.result; // Adjust based on your API response structure
        this.calculateProgressForAllCourses();
      },
      error: (error) => console.error('Error loading courses:', error),
    });
  }

  calculateProgressForAllCourses(): void {
    this.courses.forEach((course) => {
      // First check if course is already marked as completed in localStorage
      const completionKey = `completed_${course._id}`;
      if (localStorage.getItem(completionKey) === 'true') {
        course.progressPercentage = 100;
        course.isCompleted = true;
        return; // Skip calculation for completed courses
      }
  
      const totalLessons = course.modules.reduce(
        (sum: number, module: any) => sum + module.lessons.length, 0
      );
      const viewedLessons = JSON.parse(
        localStorage.getItem(`viewed_${course._id}`) || '[]'
      );
      
      course.progressPercentage = totalLessons > 0 ? 
        (viewedLessons.length / totalLessons) * 100 : 0;
      
      if (course.progressPercentage >= 100) {
        course.progressPercentage = 100; // Cap at 100%
        course.isCompleted = true; // Mark as completed
        
        // Store completion status in localStorage to prevent future changes
        localStorage.setItem(completionKey, 'true');
      } else {
        course.isCompleted = false;
      }
    });
  }

  getProgressForCourse(courseId: string): number {
    const course = this.courses.find(c => c._id === courseId);
    return course ? course.progressPercentage || 0 : 0;
  }

  isCourseCompleted(courseId: string): boolean {
    const course = this.courses.find(c => c._id === courseId);
    return course ? course.isCompleted || false : false;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
