import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/user/notification.service';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAnnouncement } from '../../../core/models/Instructor';
import { AnnouncementService } from '../../../core/services/instructor/announcement.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NotificationModalComponent, CommonModule, AdminSidebarComponent, ReactiveFormsModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  isModalOpen: boolean = false;
  notificationData: any;

  isVisibleForm: boolean = false;
  announcementForm!: FormGroup;
  announcements: IAnnouncement[] = [];
  editMode: boolean = false;
  editAnnouncementId: string | null = null;
  instructorId: string | null = null;

  private _subscription: Subscription = new Subscription();

  constructor(private _notificationService: NotificationService, private _fb: FormBuilder, private _announcementService: AnnouncementService) {
    this.initializeForms();
  }

  // ng on init
  ngOnInit(): void {
    this.fetchNotification();
    this.loadAnnouncements();
    this.instructorId = this.getInstructorId();
  }

  // ng on destory
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // fetch all notification
  fetchNotification() {
    const subscription = this._notificationService.getNotification().subscribe((data) => {
      this.notifications = data;
    });
    this._subscription.add(subscription);
  }

  openModal(notifacation: any) {
    this.notificationData = notifacation;
    this.isModalOpen = true;
  }

  // close modal
  closeModal() {
    this.isModalOpen = false;
    this.notificationData = null;
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

  initializeForms(): void {
    this.announcementForm = this._fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  toggelForm(): void {
    this.isVisibleForm = !this.isVisibleForm;
    if (!this.isVisibleForm) {
      this.editMode = false;
      this.editAnnouncementId = null;
      this.announcementForm.reset();
    }
  }

  loadAnnouncements(): void {
    this._announcementService.getAnnouncements().subscribe(
      (response) => {
        this.announcements = response.result.filter((announcement: IAnnouncement) => this.instructorId === announcement.instructorId);
        console.log('annou', this.announcements);
      },
      (error) => {
        console.error('Error fetching announcements:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.announcementForm.valid) {
      const announcementData = {
        ...this.announcementForm.value,
        instructorId: this.instructorId,
      };

      if (this.editMode && this.editAnnouncementId) {
        // Update existing announcement
        this._announcementService.updateAnnouncement(this.editAnnouncementId, announcementData).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Announcement updated succesfully',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
            this.loadAnnouncements();
            this.toggelForm();
          },
          (error) => {
            console.error('Error updating announcement:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to update announcement',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          }
        );
      } else {
        // Create new announcement
        this._announcementService.createAnnouncement(announcementData).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Announcement created successfully',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
            this.loadAnnouncements();
            this.toggelForm();
          },
          (error) => {
            console.error('Error creating announcement:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to create announcement',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: 'rgb(8, 10, 24)',
              color: 'white',
            });
          }
        );
      }
    }
  }

}
