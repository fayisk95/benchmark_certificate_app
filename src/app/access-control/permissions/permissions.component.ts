import { Component, OnInit } from '@angular/core';
import { SettingsService, RolePermissions } from '../../core/services/settings.service';
import { UserRole, Permission, RolePermission } from '../../shared/models/user.model';

@Component({
  standalone: false,
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  userRoles = Object.values(UserRole);
  availablePermissions: any[] = [
    { id: 'manage-users', name: 'Manage Users', description: 'Create, edit, and delete user accounts' },
    { id: 'manage-batches', name: 'Manage Batches', description: 'Create and manage certificate batches' },
    { id: 'issue-certificates', name: 'Issue Certificates', description: 'Generate and issue certificates' },
    { id: 'view-reports', name: 'View Reports', description: 'Access system reports and analytics' },
    { id: 'manual-number-entry', name: 'Manual Number Entry', description: 'Manually enter certificate numbers' },
    { id: 'dashboard-access', name: 'Dashboard Access', description: 'Access to main dashboard' }
  ];
  rolePermissions: RolePermissions = {};
  rolePermissionsArray: { role: string; permissions: string[] }[] = [];
  loading = false;
  saving = false;

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.loadRolePermissions();
  }

  loadRolePermissions(): void {
    this.loading = true;
    this.settingsService.getRolePermissions().subscribe({
      next: (response) => {
        this.rolePermissions = response.rolePermissions;
        this.updateRolePermissionsArray();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.loading = false;
      }
    });
  }

  updateRolePermissionsArray(): void {
    this.rolePermissionsArray = Object.keys(this.rolePermissions).map(role => ({
      role: role,
      permissions: this.rolePermissions[role as UserRole] || []
    }));
  }

  getPermissionName(permissionId: string): string {
    const permissionNames: { [key: string]: string } = {
      'manage-users': 'Manage Users',
      'manage-batches': 'Manage Batches',
      'issue-certificates': 'Issue Certificates',
      'view-reports': 'View Reports',
      'manual-number-entry': 'Manual Number Entry',
      'dashboard-access': 'Dashboard Access'
    };
    return permissionNames[permissionId] || permissionId;
  }

  hasPermission(role: UserRole, permissionId: string): boolean {
    const permissions = this.rolePermissions[role];
    return permissions ? permissions.includes(permissionId) : false;
  }

  togglePermission(role: UserRole, permissionId: string): void {
    if (!this.rolePermissions[role]) {
      this.rolePermissions[role] = [];
    }

    const permissions = this.rolePermissions[role];
    const permissionIndex = permissions.indexOf(permissionId);

    if (permissionIndex > -1) {
      permissions.splice(permissionIndex, 1);
    } else {
      permissions.push(permissionId);
    }
    this.updateRolePermissionsArray();
  }

  savePermissions(): void {
    this.saving = true;
    this.settingsService.updateRolePermissions(this.rolePermissions).subscribe({
      next: (response) => {
        console.log('Permissions saved successfully');
        this.saving = false;
        // Show success message
      },
      error: (error) => {
        console.error('Error saving permissions:', error);
        this.saving = false;
        // Show error message
      }
    });
  }

  resetToDefaults(): void {
    this.settingsService.resetRolePermissions().subscribe({
      next: (response) => {
        this.rolePermissions = response.rolePermissions;
        this.updateRolePermissionsArray();
        console.log('Permissions reset to defaults');
      },
      error: (error) => {
        console.error('Error resetting permissions:', error);
      }
    });
  }
}