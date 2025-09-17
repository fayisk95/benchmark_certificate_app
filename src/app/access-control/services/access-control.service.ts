import { Injectable, signal } from '@angular/core';
import { RolePermission, PERMISSIONS } from '../../core/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private _rolePermissions = signal<RolePermission[]>([]);
  rolePermissions = this._rolePermissions.asReadonly();

  constructor() {
    this.loadDefaultPermissions();
  }

  private loadDefaultPermissions() {
    const defaultRolePermissions: RolePermission[] = [
      {
        roleId: 'admin',
        roleName: 'Admin',
        permissions: Object.values(PERMISSIONS)
      },
      {
        roleId: 'supervisor',
        roleName: 'Supervisor',
        permissions: [
          PERMISSIONS.MANAGE_BATCHES,
          PERMISSIONS.ISSUE_CERTIFICATES,
          PERMISSIONS.VIEW_REPORTS,
          PERMISSIONS.MANUAL_NUMBER_ENTRY,
          PERMISSIONS.DASHBOARD_ACCESS
        ]
      },
      {
        roleId: 'instructor',
        roleName: 'Instructor',
        permissions: [
          PERMISSIONS.MANAGE_BATCHES,
          PERMISSIONS.ISSUE_CERTIFICATES,
          PERMISSIONS.DASHBOARD_ACCESS
        ]
      },
      {
        roleId: 'staff',
        roleName: 'Staff',
        permissions: [
          PERMISSIONS.ISSUE_CERTIFICATES,
          PERMISSIONS.DASHBOARD_ACCESS
        ]
      }
    ];

    // Load from localStorage if exists, otherwise use defaults
    const saved = localStorage.getItem('rolePermissions');
    if (saved) {
      this._rolePermissions.set(JSON.parse(saved));
    } else {
      this._rolePermissions.set(defaultRolePermissions);
    }
  }

  togglePermission(roleName: string, permission: string, checked: boolean) {
    this._rolePermissions.update(rolePermissions =>
      rolePermissions.map(rp => {
        if (rp.roleName === roleName) {
          const permissions = checked
            ? [...rp.permissions, permission].filter((p, i, arr) => arr.indexOf(p) === i) // Remove duplicates
            : rp.permissions.filter(p => p !== permission);
          
          return { ...rp, permissions };
        }
        return rp;
      })
    );
  }

  saveRolePermissions() {
    localStorage.setItem('rolePermissions', JSON.stringify(this.rolePermissions()));
  }

  resetToDefaults() {
    localStorage.removeItem('rolePermissions');
    this.loadDefaultPermissions();
  }

  hasPermission(roleName: string, permission: string): boolean {
    const rolePerms = this.rolePermissions().find(rp => rp.roleName === roleName);
    return rolePerms?.permissions.includes(permission) || false;
  }
}