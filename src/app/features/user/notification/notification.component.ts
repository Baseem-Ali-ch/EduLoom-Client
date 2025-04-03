import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/user/notification.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable, Subscription } from 'rxjs';
import { selectLoginDetails } from '../../../state/user/user.selector';
import { Store } from '@ngrx/store';
import { IUser } from '../../../core/models/IUser';
import { AppState } from '../../../state/user/user.state';
import { jwtDecode } from 'jwt-decode';
import { OnIdentifyEffects } from '@ngrx/effects';
import { IAnnouncement } from '../../../core/models/Instructor';
import { AnnouncementService } from '../../../core/services/instructor/announcement.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [SidebarComponent, CommonModule, NotificationModalComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  isModalOpen: boolean = false;
  notificationData: any;
  userId: string = '';
  token!: string | null;
  announcements: IAnnouncement[] = [];

  private _subscription: Subscription = new Subscription();

  constructor(private _notificationService: NotificationService, private _announcmentService: AnnouncementService) {}

  ngOnInit(): void {
    this.fetchNotification();
    this.loadAnnouncements();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // fetch all notification
  fetchNotification() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      // Decode the token to get userId
      const decodedToken: any = jwtDecode(this.token);
      const userId = decodedToken.id;

      const fetchNotificationSubscription = this._notificationService.getNotification().subscribe((data) => {
        this.notifications = data.filter((notification) => notification.userId === userId);
      });
      this._subscription.add(fetchNotificationSubscription);
    } else {
      console.error('No token found in session storage');
      this.notifications = [];
    }
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

  loadAnnouncements(): void {
    this._announcmentService.getAnnouncements().subscribe(
      (response) => {
        this.announcements = response.result;
      },
      (error) => {
        console.error('Error fetching announcements:', error);
      }
    );
  }
}
