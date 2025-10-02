import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);
  public notification$: Observable<NotificationConfig | null> = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    this.notificationSubject.next({ message, type, duration });

    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 4000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }

  hide() {
    this.notificationSubject.next(null);
  }
}
