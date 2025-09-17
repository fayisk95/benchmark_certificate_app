import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { User, UserRole } from '../../../core/models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  users: User[] = [];
  displayedColumns = ['name', 'email', 'role', 'isActive', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.users = this.userService.users();
  }

  createUser() {
    this.router.navigate(['/users/create']);
  }

  editUser(user: User) {
    this.router.navigate(['/users/edit', user.id]);
  }

  async deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      await this.userService.deleteUser(user.id);
      this.loadUsers();
    }
  }

  async toggleUserStatus(user: User) {
    await this.userService.updateUser(user.id, { isActive: !user.isActive });
    this.loadUsers();
  }

  getRoleColor(role: UserRole): string {
    const colors = {
      'Admin': '#f44336',
      'Supervisor': '#ff9800',
      'Instructor': '#2196f3',
      'Staff': '#4caf50'
    };
    return colors[role] || '#666';
  }
}