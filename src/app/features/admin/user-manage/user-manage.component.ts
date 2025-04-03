import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { UsersService } from '../../../core/services/admin/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IUser } from '../../../core/models/IUser';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
    selector: 'app-user-manage',
    standalone: true,
    imports: [AdminSidebarComponent, CommonModule, FormsModule, TableComponent],
    templateUrl: './user-manage.component.html',
    styleUrl: './user-manage.component.css'
})
export class UserManageComponent implements OnInit, OnDestroy {
  allUsers: IUser[] = [];
  filteredUsers: IUser[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  private _subscription: Subscription = new Subscription();

  // Column configuration for the generic table
  tableColumns = [
    { key: 'userName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'Actions', isAction: true }
  ];

  constructor(private _userService: UsersService) {}

  ngOnInit(): void {
    this.getAllUser();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  getAllUser() {
    const allUserSubscription = this._userService.getUser(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.allUsers = response.users;
        this.totalPages = response.totalPages;
        this.filterUsers();
      },
      error: (error) => console.error(error)
    });
    this._subscription.add(allUserSubscription);
  }

  filterUsers() {
    this.filteredUsers = this.allUsers.filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        user.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredUsers.length / this.limit);
  }

  // Handle page changes from the table
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllUser(); 
  }

  // Handle actions from the table
  onActionClicked(event: { item: IUser; action: string }) {
    const { item, action } = event;
    switch (action) {
      case 'suspend':
      case 'activate':
        this.updateStatus(item._id!, action === 'activate');
        break;
      case 'edit':
        console.log('Edit user:', item); 
        break;
    }
  }

  updateStatus(userId: string, status: boolean) {
    const updateStatusSubscription = this._userService.updateUserStatus(userId, status).subscribe({
      next: (response) => {
        const user = this.allUsers.find((u) => u._id === userId);
        if (user) {
          user.isActive = status;
          this.filterUsers();
        }
        console.log(response);
      },
      error: (error) => console.error(error)
    });
    this._subscription.add(updateStatusSubscription);
  }
}
