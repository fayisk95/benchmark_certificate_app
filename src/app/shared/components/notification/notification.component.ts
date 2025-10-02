import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationConfig } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" *ngIf="notification">
      <div class="notification" [ngClass]="'notification-' + notification.type">
        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✓</span>
          <span *ngIf="notification.type === 'error'">✕</span>
          <span *ngIf="notification.type === 'warning'">⚠</span>
          <span *ngIf="notification.type === 'info'">ⓘ</span>
        </div>
        <div class="notification-message">{{ notification.message }}</div>
        <button class="notification-close" (click)="close()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification {
      display: flex;
      align-items: center;
      min-width: 300px;
      max-width: 500px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
    }

    .notification-success {
      border-left-color: #4caf50;
      background: #f1f8f4;
    }

    .notification-error {
      border-left-color: #f44336;
      background: #fef1f0;
    }

    .notification-warning {
      border-left-color: #ff9800;
      background: #fff8f0;
    }

    .notification-info {
      border-left-color: #2196f3;
      background: #f0f7ff;
    }

    .notification-icon {
      font-size: 20px;
      font-weight: bold;
      margin-right: 12px;
      min-width: 24px;
      text-align: center;
    }

    .notification-success .notification-icon {
      color: #4caf50;
    }

    .notification-error .notification-icon {
      color: #f44336;
    }

    .notification-warning .notification-icon {
      color: #ff9800;
    }

    .notification-info .notification-icon {
      color: #2196f3;
    }

    .notification-message {
      flex: 1;
      color: #333;
      font-size: 14px;
      line-height: 1.5;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      color: #999;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .notification-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #666;
    }
  `]
})
export class NotificationComponent implements OnInit {
  notification: NotificationConfig | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notification$.subscribe(notification => {
      this.notification = notification;
    });
  }

  close() {
    this.notificationService.hide();
  }
}
