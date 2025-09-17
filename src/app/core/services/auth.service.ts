import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  constructor() {
    // Initialize with demo admin user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this._currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Demo authentication
      setTimeout(() => {
        if (email === 'admin@demo.com' && password === 'admin123') {
          const user: User = {
            id: '1',
            name: 'Admin User',
            email: 'admin@demo.com',
            role: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          };
          
          this._currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }
}