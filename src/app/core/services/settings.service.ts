import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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
  constructor(private apiService: ApiService) {}

  getSettings(): Observable<SettingsResponse> {
    return this.apiService.get<SettingsResponse>('/settings');
  }

  getSetting(key: string): Observable<any> {
    return this.apiService.get(`/settings/${key}`);
  }

  updateSettings(settings: any): Observable<SettingsResponse> {
    return this.apiService.put<SettingsResponse>('/settings', { settings });
  }

  resetSettings(): Observable<SettingsResponse> {
    return this.apiService.post<SettingsResponse>('/settings/reset', {});
  }

  getRolePermissions(): Observable<RolePermissionsResponse> {
    return this.apiService.get<RolePermissionsResponse>('/settings/permissions/roles');
  }

  updateRolePermissions(rolePermissions: RolePermissions): Observable<RolePermissionsResponse> {
    return this.apiService.put<RolePermissionsResponse>('/settings/permissions/roles', { rolePermissions });
  }

  resetRolePermissions(): Observable<RolePermissionsResponse> {
    return this.apiService.post<RolePermissionsResponse>('/settings/permissions/reset', {});
  }
}