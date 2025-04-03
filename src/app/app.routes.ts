import { Routes } from '@angular/router';
import { RegisterComponent } from './features/user/register/register.component';
import { LoginComponent } from './features/user/login/login.component';
import { OtpComponent } from './features/user/otp/otp.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { authGuard } from './core/guards/auth.guard';
import { UserComponent } from './features/user/user/user.component';
import { ForgetPasswordComponent } from './features/user/forget-password/forget-password.component';
import { ResetPasswordComponent } from './features/user/reset-password/reset-password.component';
import { ForgetPasswordComponentIns } from './features/instructor/forget-password/forget-password.component';
import { ResetPasswordComponentIns } from './features/instructor/reset-password/reset-password.component';
import { insAuthGuard } from './core/guards/ins-auth.guard';
import { admAuthGuard } from './core/guards/adm-auth.guard';
import { AddCourseComponent } from './features/instructor/add-course/add-course.component';

export const routes: Routes = [
  // student routes
  { path: '', redirectTo: '/student/login', pathMatch: 'full' },
  {
    path: 'student',
    component: UserComponent,
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'otp-verify/:email', component: OtpComponent },
      { path: 'forget-password', component: ForgetPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'dashboard', loadComponent: () => import('./features/user/dashboard/dashboard.component').then((c) => c.DashboardComponent), canActivate: [authGuard] },
      { path: 'profile', loadComponent: () => import('./features/user/profile/profile.component').then((c) => c.ProfileComponent), canActivate: [authGuard] },
      { path: 'notification', loadComponent: () => import('./features/user/notification/notification.component').then((c) => c.NotificationComponent), canActivate: [authGuard] },
      { path: 'course/:id', loadComponent: () => import('./features/user/course-det/course-det.component').then((c) => c.CourseDetComponent), canActivate: [authGuard] },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'perfomance', loadComponent: () => import('./features/user/perfomance/perfomance.component').then((c) => c.PerformanceComponent), canActivate: [authGuard] },
      { path: 'achivements', loadComponent: () => import('./features/user/achivements/achivements.component').then((c) => c.AchivementsComponent), canActivate: [authGuard] },
      
    ],
  },

  // admin routes
  { path: 'admin', redirectTo: '/admin/login', pathMatch: 'full' },
  {
    path: 'admin',
    component: UserComponent,
    children: [
      { path: 'login', loadComponent: () => import('./features/admin/login/login.component').then((c) => c.AdminLoginComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((c) => c.DashboardComponent), canActivate: [admAuthGuard] },
      { path: 'notification', loadComponent: () => import('./features/admin/notification/notification.component').then((c) => c.NotificationComponent), canActivate: [admAuthGuard] },
      { path: 'profile', loadComponent: () => import('./features/admin/profile/profile.component').then((c) => c.ProfileComponent), canActivate: [admAuthGuard] },
      { path: 'students', loadComponent: () => import('./features/admin/user-manage/user-manage.component').then((c) => c.UserManageComponent), canActivate: [admAuthGuard] },
      { path: 'instructors', loadComponent: () => import('./features/admin/instructor-manage/instructor-manage.component').then((c) => c.InstructorManageComponent), canActivate: [admAuthGuard] },
      { path: 'offer', loadComponent: () => import('./features/admin/offer-manage/offer-manage.component').then((c) => c.OfferManageComponent), canActivate: [admAuthGuard]},
      { path: 'coupon', loadComponent: () => import('./features/admin/coupon-manage/coupon-manage.component').then((c) => c.CouponManageComponent), canActivate: [admAuthGuard]},
      { path: 'course', loadComponent: () => import('./features/admin/course-manage/course-manage.component').then((c) => c.CourseManageComponent), canActivate: [admAuthGuard]},
      { path: 'course/:id', loadComponent: () => import('./features/admin/course-det/course-det.component').then((c) => c.CourseDetComponent), canActivate: [admAuthGuard] },
      {path: 'revenue', loadComponent: () => import('./features/admin/revenue/revenue.component').then((c) => c.RevenueComponent)},


    ],
  },

  // instructor routes
  { path: 'instructor', redirectTo: '/instructor/login', pathMatch: 'full' },
  {
    path: 'instructor',
    component: UserComponent,
    children: [
      { path: 'forget-password', component: ForgetPasswordComponentIns },
      { path: 'reset-password/:token', component: ResetPasswordComponentIns },
      { path: 'register', loadComponent: () => import('./features/instructor/register/register.component').then((c) => c.RegisterComponent) },
      { path: 'login', loadComponent: () => import('./features/instructor/login/login.component').then((c) => c.LoginComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/instructor/dashboard/dashboard.component').then((c) => c.DashboardComponent), canActivate: [insAuthGuard] },
      { path: 'profile', loadComponent: () => import('./features/instructor/profile/profile.component').then((c) => c.ProfileComponent), canActivate: [insAuthGuard] },
      { path: 'courses', loadComponent: () => import('./features/instructor/course/course.component').then((c) => c.CourseComponent), canActivate: [insAuthGuard] },
      { path: 'add-course', loadComponent: () => import('./features/instructor/add-course/add-course.component').then((c) => c.AddCourseComponent), canActivate: [insAuthGuard] },
      { path: 'course/:id', loadComponent: () => import('./features/instructor/course-det/course-det.component').then((c) => c.CourseDetComponent), canActivate: [insAuthGuard] },
      { path: 'courses/:courseId', component: AddCourseComponent },
      {path: 'students', loadComponent: () => import('./features/instructor/students/students.component').then((c) => c.StudentsComponent)},
      {path: 'revenue', loadComponent: () => import('./features/instructor/revenue/revenue.component').then((c) => c.RevenueComponent)},
      {path: 'announcement', loadComponent: () => import('./features/instructor/announcement/announcement.component').then((c) => c.AnnouncementComponent)}

    ],
  },

  { path: '**', component: NotfoundComponent },
];
