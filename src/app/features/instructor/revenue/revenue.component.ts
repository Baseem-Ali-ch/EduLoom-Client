// revenue.component.ts
import { Component, OnInit } from '@angular/core';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { CommonModule } from '@angular/common';
import { IRevenue } from '../../../core/models/Instructor';
import { SharedService } from '../../../core/services/shared/shared.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [InstructorSidebarComponent, CommonModule],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css'],
})
export class RevenueComponent implements OnInit {
  revenues: IRevenue[] = [];
  totalRevenue: number = 0;
  insWithdrawableAmount: number = 0; 
  instructorId: string | null = null;
  currentPage: number = 1;
  limit: number = 10;
  private subscription: Subscription = new Subscription();

  constructor(private _sharedService: SharedService) {}

  ngOnInit(): void {
    this.instructorId = this.getInstructorId();
    this.loadInstructorRevenue();
  }

  get paginatedRevenues(): IRevenue[] {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    return this.revenues.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.revenues.length / this.limit);
  }

  getInstructorId(): string | null {
    const token = localStorage.getItem('instructorToken') || localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  loadInstructorRevenue(): void {
    this._sharedService.getRevenue().subscribe({
      next: (response) => {
        this.revenues = response.result.map((revenue: IRevenue) => ({
          ...revenue,
          insWithdrawn: revenue.insWithdrawn || false, // Default to false if not set
          insWithdrawableAmount: revenue.insWithdrawn ? 0 : revenue.instructorShare, // Set withdrawable amount
        }));

        // Process each revenue entry to fetch course details
        this.revenues = this.revenues.map((revenue) => {
          this._sharedService.getCourseByEnrollmentId(revenue.enrollment).subscribe({
            next: (response) => {
              revenue.courseTitle = response.title;
              revenue.price = response.price;
              revenue.studentName = response.enrolledStudents[0].studentId.userName;
            },
            error: (error) => {
              console.error('Error fetching course details:', error);
              revenue.courseTitle = 'N/A';
              revenue.price = 0;
              revenue.studentName = 'N/A';
            },
          });
          return revenue;
        });

        // Calculate total revenue and withdrawable amount
        this.totalRevenue = this.revenues.reduce((sum, revenue) => sum + revenue.instructorShare, 0);
        this.insWithdrawableAmount = this.revenues.reduce(
          (sum, revenue) => sum + (revenue.insWithdrawableAmount || 0),
          0
        );
      },
      error: (error) => {
        console.error('Error fetching revenue:', error);
      },
    });
  }

  withdrawAll(): void {
    Swal.fire({
      title: 'Confirm Withdrawal',
      text: `Are you sure you want to withdraw ₹${this.insWithdrawableAmount.toFixed(2)}?`,
      icon: 'question',
      toast: true,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, withdraw',
      background: 'rgb(8, 10, 24)',
      color: 'white',
    }).then((result) => {
      if (result.isConfirmed) {
        this._sharedService.withdrawAllRevenue(this.instructorId!).subscribe({
          next: (response) => {
            // Update all revenues as withdrawn
            this.revenues = this.revenues.map((revenue) => ({
              ...revenue,
              withdrawn: true,
              withdrawableAmount: 0,
            }));
            this.insWithdrawableAmount = 0; // Reset withdrawable amount
            Swal.fire({
              icon: 'success',
              title: 'Withdrawal Requested',
              text: 'Your withdrawal request has been processed',
              toast: true,
              position: 'top-end',
              timer: 3000,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Withdrawal Failed',
              text: error.error?.message || 'Something went wrong',
              toast: true,
              position: 'top-end',
              timer: 3000,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, this.currentPage - halfRange);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
