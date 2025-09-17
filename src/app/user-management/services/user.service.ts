import { Injectable, signal } from '@angular/core';
import { User, CreateUserRequest, UpdateUserRequest } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _users = signal<User[]>([]);
  users = this._users.asReadonly();

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData() {
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@demo.com',
        role: 'Admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@demo.com',
        role: 'Supervisor',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        isActive: true
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.wilson@demo.com',
        role: 'Instructor',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        isActive: true
      },
      {
        id: '4',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@demo.com',
        role: 'Staff',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isActive: false
      }
    ];

    this._users.set(demoUsers);
  }

  createUser(request: CreateUserRequest): Promise<User> {
    return new Promise((resolve) => {
      const user: User = {
        id: Date.now().toString(),
        name: request.name,
        email: request.email,
        role: request.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      this._users.update(users => [...users, user]);
      resolve(user);
    });
  }

  getUserById(id: string): User | undefined {
    return this.users().find(user => user.id === id);
  }

  updateUser(id: string, updates: UpdateUserRequest): Promise<void> {
    return new Promise((resolve) => {
      this._users.update(users =>
        users.map(user =>
          user.id === id
            ? { ...user, ...updates, updatedAt: new Date() }
            : user
        )
      );
      resolve();
    });
  }

  deleteUser(id: string): Promise<void> {
    return new Promise((resolve) => {
      this._users.update(users => users.filter(user => user.id !== id));
      resolve();
    });
  }
}