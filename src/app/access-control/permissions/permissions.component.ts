import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PermissionsService } from '../../shared/services/permissions.service';
import { UserRole, Permission, RolePermission } from '../../shared/models/user.model';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  userRoles = Object.values(UserRole);
  availablePermissions: Permission[] = [];
  rolePermissions: RolePermission[] = [];

  constructor(private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.availablePermissions = this.permissionsService.getAvailablePermissions();
    this.permissionsService.getRolePermissions().subscribe(permissions => {
      this.rolePermissions = permissions;
    });
  }

  hasPermission(role: UserRole, permissionId: string): boolean {
    const rolePermission = this.rolePermissions.find(rp => rp.role === role);
    return rolePermission ? rolePermission.permissions.includes(permissionId) : false;
  }

  togglePermission(role: UserRole, permissionId: string): void {
    const rolePermissionIndex = this.rolePermissions.findIndex(rp => rp.role === role);
    
    if (rolePermissionIndex > -1) {
      const permissions = this.rolePermissions[rolePermissionIndex].permissions;
      const permissionIndex = permissions.indexOf(permissionId);
      
      if (permissionIndex > -1) {
        permissions.splice(permissionIndex, 1);
      } else {
        permissions.push(permissionId);
      }
    } else {
      this.rolePermissions.push({
        role,
        permissions: [permissionId]
      });
    }
  }

  savePermissions(): void {
    this.permissionsService.updateRolePermissions(this.rolePermissions);
    // Show success message
  }

  resetToDefaults(): void {
    const defaultPermissions: RolePermission[] = [
      {
        role: UserRole.ADMIN,
        permissions: this.availablePermissions.map(p => p.id)
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
    ];
    
    this.rolePermissions = defaultPermissions;
  }
}