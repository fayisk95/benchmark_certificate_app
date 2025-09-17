import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole, Permission, RolePermission } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private availablePermissions: Permission[] = [
    { id: 'manage-users', name: 'Manage Users', description: 'Create, edit, and delete users' },
    { id: 'manage-batches', name: 'Manage Batches', description: 'Create and manage training batches' },
    { id: 'issue-certificates', name: 'Issue Certificates', description: 'Create and issue certificates' },
    { id: 'view-reports', name: 'View Reports', description: 'Access reporting and analytics' },
    { id: 'manual-number-entry', name: 'Manual Number Entry', description: 'Override automatic numbering' },
    { id: 'dashboard-access', name: 'Dashboard Access', description: 'Access to main dashboard' }
  ];

  private rolePermissionsSubject = new BehaviorSubject<RolePermission[]>([
    {
      role: UserRole.ADMIN,
      permissions: ['manage-users', 'manage-batches', 'issue-certificates', 'view-reports', 'manual-number-entry', 'dashboard-access']
    },
    {
      role: UserRole.SUPERVISOR,
      permissions: ['manage-batches', 'issue-certificates', 'view-reports', 'manual-number-entry', 'dashboard-access']
    },
    {
      role: UserRole.INSTRUCTOR,
      permissions: ['issue-certificates', 'dashboard-access']
    },
    {
      role: UserRole.STAFF,
      permissions: ['issue-certificates', 'dashboard-access']
    }
  ]);

  getAvailablePermissions(): Permission[] {
    return this.availablePermissions;
  }

  getRolePermissions(): Observable<RolePermission[]> {
    return this.rolePermissionsSubject.asObservable();
  }

  updateRolePermissions(rolePermissions: RolePermission[]): void {
    this.rolePermissionsSubject.next(rolePermissions);
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
  }

  hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions = this.rolePermissionsSubject.value;
    const rolePermission = rolePermissions.find(rp => rp.role === userRole);
    return rolePermission ? rolePermission.permissions.includes(permission) : false;
  }
}