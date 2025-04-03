import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { NotificationService } from '../../../../core/services/user/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-modal.component.html',
    styleUrl: './notification-modal.component.css'
})
export class NotificationModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Input() data: any = null;

  @Output() close = new EventEmitter<void>();

  private _subscription: Subscription = new Subscription()
  constructor(private _notificationService: NotificationService) {}

  // ng on destroy
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // update the notification status
  updateStatus(notification: any, status: string) {
    const subscription = this._notificationService.updateNotificationStatus(notification._id, status).subscribe((updatedNotification) => {
      notification.status = status;

      if (status === 'accepted') {
        this._notificationService.sendAcceptanceEmail(notification.userId).subscribe(() => {
          console.log('Email sent successfully');
        });
      }
    });
    this._subscription.add(subscription)
  }

  
}
