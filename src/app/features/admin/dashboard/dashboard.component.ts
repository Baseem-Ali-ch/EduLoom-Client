import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Subscription } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CourseServiceService } from '../../../core/services/instructor/course.service.service';
import { ICourse } from '../../../core/models/ICourse';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { InstructorService } from '../../../core/services/admin/instructor.service';
import { UsersService } from '../../../core/services/admin/users.service';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Add standalone
  imports: [
    AdminSidebarComponent, 
    BaseChartDirective, 
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private _subscription: Subscription = new Subscription();

  courseEnrollmentData: { courseTitle: string; enrolledStudents: number }[] = [];
  totalStudents: number = 0;
  totalInstructors: number = 0;
  totalCourses: number = 0;

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
    private _cdr: ChangeDetectorRef, 
    private _instructorService: InstructorService, 
    private _userService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadInstructors();
    this.loadStudents();
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
          this.totalCourses = courses.length;
          
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

  loadInstructors(): void {
    this._subscription.add(
      this._instructorService.getInstructor().subscribe({
        next: (response) => {
          this.totalInstructors = response.length;
          console.log('totalInstructors', this.totalInstructors);
        },
        error: (error) => {
          console.error('Error fetching instructors:', error);
        },
      })
    );
  }

  loadStudents(): void {
    this._subscription.add(
      this._userService.getUsers().subscribe({
        next: (response) => {
          this.totalStudents = response.totalUsers;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
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