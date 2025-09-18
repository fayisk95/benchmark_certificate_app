import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../../shared/models/user.model';

@Component({
  standalone: false,
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];
  users: User[] = [
    {
      id: '1',
      email: 'admin@cms.com',
      name: 'System Admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      email: 'supervisor@cms.com',
      name: 'John Supervisor',
      role: UserRole.SUPERVISOR,
      isActive: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '3',
      email: 'instructor@cms.com',
      name: 'Jane Instructor',
      role: UserRole.INSTRUCTOR,
      isActive: true,
      createdAt: new Date('2024-02-01')
    },
    {
      id: '4',
      email: 'staff@cms.com',
      name: 'Mike Staff',
      role: UserRole.STAFF,
      isActive: false,
      createdAt: new Date('2024-02-15')
    }
  ];

  filteredUsers = [...this.users];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue) ||
      user.role.toLowerCase().includes(filterValue)
    );
  }

  createUser(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

  editUser(user: User): void {
    this.router.navigate(['/dashboard/users/edit', user.id]);
  }

  toggleUserStatus(user: User): void {
    user.isActive = !user.isActive;
    // In real app, call API to update user status
  }
}