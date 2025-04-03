import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { ICourse } from '../../../core/models/ICourse';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions, ChartType, ChartData } from 'chart.js';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, SidebarComponent, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './perfomance.component.html',
  styleUrls: ['./perfomance.component.css'],
})
export class PerformanceComponent implements OnInit {
  enrolledCoursesProgress: { courseId: string; title: string; progress: number; totalLessons: number; viewedLessons: number }[] = [];
  overallProgress: number = 0;

  // Pie chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Overall Course Completion Status' },
    },
  };

  public pieChartData: ChartData<'pie'> = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      { 
        data: [0, 0], 
        backgroundColor: ['#42A5F5', '#E0E0E0'] 
      },
    ]
  };
  
  public pieChartType: ChartType = 'pie';

  // Bar chart configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Courses' } },
      y: { title: { display: true, text: 'Progress (%)' }, beginAtZero: true, max: 100 },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Progress Across Enrolled Courses' },
    },
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Progress (%)', 
        backgroundColor: '#42A5F5' 
      },
    ]
  };
  
  public barChartType: ChartType = 'bar';

  private _subscription: Subscription = new Subscription();

  constructor(private _courseService: CourseServiceService, private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadEnrolledCoursesProgress();
  }

  loadEnrolledCoursesProgress(): void {
    this._subscription.add(
      this._courseService.getCourses().subscribe({
        next: (response) => {
          const enrolledCourses = response.result;
          this.enrolledCoursesProgress = enrolledCourses.map((course: ICourse) => {
            const totalLessons = course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0);
            const viewedLessons = JSON.parse(localStorage.getItem(`viewed_${course._id}`) || '[]');
            const progress = totalLessons > 0 ? (viewedLessons.length / totalLessons) * 100 : 0;
            return {
              courseId: course._id,
              title: course.title,
              progress: progress,
              totalLessons: totalLessons,
              viewedLessons: viewedLessons.length,
            };
          });

          this.calculateOverallProgress();
          this.updatePieChart();
          this.updateBarChart();
          this._cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching enrolled courses:', error);
        },
      })
    );
  }

  calculateOverallProgress(): void {
    if (this.enrolledCoursesProgress.length === 0) {
      this.overallProgress = 0;
      return;
    }
    const totalProgress = this.enrolledCoursesProgress.reduce((sum, course) => sum + course.progress, 0);
    this.overallProgress = totalProgress / this.enrolledCoursesProgress.length;
  }

  updatePieChart(): void {
    const completed = this.overallProgress;
    const remaining = 100 - this.overallProgress;
    this.pieChartData.datasets[0].data = [completed, remaining];
  }

  updateBarChart(): void {
    this.barChartData.labels = this.enrolledCoursesProgress.map((course) => course.title);
    this.barChartData.datasets[0].data = this.enrolledCoursesProgress.map((course) => course.progress);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}