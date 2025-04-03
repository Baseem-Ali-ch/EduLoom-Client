import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { CommonModule } from '@angular/common';
import { InstructorService } from '../../../core/services/admin/instructor.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IInstructor } from '../../../core/models/Instructor';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-instructor-manage',
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule, FormsModule, TableComponent],
  templateUrl: './instructor-manage.component.html',
  styleUrl: './instructor-manage.component.css',
})
export class InstructorManageComponent implements OnInit, OnDestroy {
  allInstructors: IInstructor[] = [];
  filteredInstructors: IInstructor[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  private _subscription: Subscription = new Subscription();

  tableColumns = [
    { key: 'userName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'Actions', isAction: true },
  ];

  constructor(private _instructorService: InstructorService) {}

  ngOnInit(): void {
    this.getAllInstructor();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  getAllInstructor() {
    const instructorSubscription = this._instructorService.getInstructor().subscribe({
      next: (response) => {
        this.allInstructors = response;
        this.filterInstructor(); // Apply filters after fetching
      },
      error: (error) => console.error(error),
    });
    this._subscription.add(instructorSubscription);
  }

  filterInstructor() {
    this.filteredInstructors = this.allInstructors.filter((instructor) => {
      const matchesSearch = !this.searchTerm || instructor.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) || instructor.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'all' || (this.selectedStatus === 'active' && instructor.isActive) || (this.selectedStatus === 'inactive' && !instructor.isActive);

      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredInstructors.length / this.limit);
  }

  updateStatus(instructorId: string, status: boolean) {
    const updateStatusSubscription = this._instructorService.updateInstructorStatus(instructorId, status).subscribe({
      next: (response) => {
        const instructor = this.allInstructors.find((i) => i._id === instructorId);
        if (instructor) {
          instructor.isActive = status;
          this.filterInstructor(); // Re-filter after status update
        }
        console.log(response);
      },
      error: (error) => console.error(error),
    });
    this._subscription.add(updateStatusSubscription);
  }

  // Handle page changes from the table
  onPageChange(page: number) {
    this.currentPage = page;
    // If your API supports pagination, fetch new data here
    // For now, we'll rely on client-side pagination
  }

  // Handle actions from the table
  onActionClicked(event: { item: IInstructor; action: string }) {
    const { item, action } = event;
    switch (action) {
      case 'suspend':
      case 'activate':
        this.updateStatus(item._id!, action === 'activate');
        break;
      case 'edit':
        console.log('Edit instructor:', item); // Implement edit logic
        break;
    }
  }
}
