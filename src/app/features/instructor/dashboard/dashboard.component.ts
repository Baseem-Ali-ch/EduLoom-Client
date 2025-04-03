import { AfterViewInit, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { Subscription } from 'rxjs';
import { ICourse } from '../../../core/models/ICourse';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    InstructorSidebarComponent, 
    CommonModule, 
    RouterModule, 
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private _subscription: Subscription = new Subscription();

  courseEnrollmentData: { courseTitle: string; enrolledStudents: number }[] = [];

  public courseEnrollmentChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Important for responsive design
    scales: {
      x: {
        title: { display: true, text: 'Courses', color: '#ffffff' },
        ticks: { color: '#ffffff' },
      },
      y: {
        title: { display: true, text: 'Number of Enrolled Students', color: '#ffffff' },
        beginAtZero: true,
        ticks: {
          color: '#ffffff',
          stepSize: 10,
        },
      },
    },
    plugins: {
      legend: { display: true, labels: { color: '#ffffff' } },
      title: { display: true, text: 'Enrolled Students per Course', color: '#ffffff' },
    },
  };

  public courseEnrollmentChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Enrolled Students',
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  public courseEnrollmentChartType: ChartType = 'bar';

  constructor(
    private _courseService: CourseServiceService, 
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Force chart update after view initialization
    setTimeout(() => {
      this.updateChartView();
    });
  }

  loadDashboardData(): void {
    this._subscription.add(
      this._courseService.getCourses().subscribe({
        next: (response) => {
          const courses = response.result;
          console.log('courses', courses);

          // Process Enrollment Data
          this.courseEnrollmentData = courses.map((course: ICourse) => ({
            courseTitle: course.title,
            enrolledStudents: course.enrolledStudents.length || 0,
          }));

          this.updateCharts();
          this.updateChartView();
          this._cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching courses:', error);
        },
      })
    );
  }

  updateCharts(): void {
    this.courseEnrollmentChartData.labels = this.courseEnrollmentData.map((data) => data.courseTitle);
    this.courseEnrollmentChartData.datasets[0].data = this.courseEnrollmentData.map((data) => data.enrolledStudents);
  }

  updateChartView(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}