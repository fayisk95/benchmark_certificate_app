import { Component, inject, OnInit } from '@angular/core';
import { PERMISSIONS } from '../../core/models/permission.model';
import { AccessControlService } from '../services/access-control.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.scss']
})
export class AccessControlComponent implements OnInit {
  private accessControlService = inject(AccessControlService);
  private notificationService = inject(NotificationService);

  roles = ['Admin', 'Supervisor', 'Instructor', 'Staff'];
  permissions = Object.values(PERMISSIONS);
  rolePermissions = this.accessControlService.rolePermissions;

  ngOnInit() {
    // Role permissions are loaded from service
    console.log('Loaded role permissions:', this.rolePermissions);
  }

  hasPermission(role: string, permission: string): boolean {
    const rolePerms = this.rolePermissions().find(rp => rp.roleName === role);
    return rolePerms?.permissions.includes(permission) || false;
  }

  togglePermission(role: string, permission: string, checked: boolean) {
    this.accessControlService.togglePermission(role, permission, checked);
  }

  saveChanges() {
    this.accessControlService.saveRolePermissions();
  }

  resetToDefaults() {
    this.notificationService.warning('Reset functionality will clear all custom permissions. Contact administrator to proceed.');
  }

  getPermissionDescription(permission: string): string {
    const descriptions: { [key: string]: string } = {
      [PERMISSIONS.MANAGE_USERS]: 'Create, edit, and delete user accounts',
      [PERMISSIONS.MANAGE_BATCHES]: 'Create and manage training batches',
      [PERMISSIONS.ISSUE_CERTIFICATES]: 'Issue and manage certificates',
      [PERMISSIONS.VIEW_REPORTS]: 'Access reports and analytics',
      [PERMISSIONS.MANUAL_NUMBER_ENTRY]: 'Override auto-generated numbers',
      [PERMISSIONS.DASHBOARD_ACCESS]: 'Access to main dashboard'
    };
    return descriptions[permission] || '';
  }
}