import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationService } from '../../shared/services/notification.service';

export interface AppSettings {
  [key: string]: {
    value: string;
    description: string;
    updated_at: string;
  };
}

export interface SettingsResponse {
  settings: AppSettings;
  message?: string;
}

export interface RolePermissions {
  [role: string]: string[];
}

export interface RolePermissionsResponse {
  rolePermissions: RolePermissions;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  getSettings(): Observable<SettingsResponse> {
    this.loadingService.show();
    return this.apiService.get<SettingsResponse>('/settings').pipe(
      catchError((error) => {
        this.notificationService.error('Failed to load settings');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getSetting(key: string): Observable<any> {
    return this.apiService.get(`/settings/${key}`);
  }

  updateSettings(settings: any): Observable<SettingsResponse> {
    this.loadingService.show();
    return this.apiService.put<SettingsResponse>('/settings', { settings }).pipe(
      tap(() => {
        this.notificationService.success('Settings updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update settings';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  resetSettings(): Observable<SettingsResponse> {
    return this.apiService.post<SettingsResponse>('/settings/reset', {});
  }

  getRolePermissions(): Observable<RolePermissionsResponse> {
    this.loadingService.show();
    return this.apiService.get<RolePermissionsResponse>('/settings/permissions/roles').pipe(
      catchError((error) => {
        this.notificationService.error('Failed to load role permissions');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateRolePermissions(rolePermissions: RolePermissions): Observable<RolePermissionsResponse> {
    this.loadingService.show();
    return this.apiService.put<RolePermissionsResponse>('/settings/permissions/roles', { rolePermissions }).pipe(
      tap(() => {
        this.notificationService.success('Role permissions updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update role permissions';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  resetRolePermissions(): Observable<RolePermissionsResponse> {
    return this.apiService.post<RolePermissionsResponse>('/settings/permissions/reset', {});
  }
}