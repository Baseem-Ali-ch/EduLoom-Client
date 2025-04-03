import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-notification-modal',
    imports: [CommonModule],
    templateUrl: './notification-modal.component.html',
    styleUrl: './notification-modal.component.css'
})
export class NotificationModalComponent {
  @Input() isOpen = false;
  @Input() data: any = null;

  @Output() close = new EventEmitter<void>();
}
