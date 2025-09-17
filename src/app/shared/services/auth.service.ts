import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@cms.com',
      name: 'System Admin',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2', 
      email: 'supervisor@cms.com',
      name: 'John Supervisor',
      role: UserRole.SUPERVISOR,
      isActive: true,
      createdAt: new Date()
    }
  ];

  login(email: string, password: string): Observable<User | null> {
    const user = this.mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return of(user);
    }
    return of(null);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.currentUserSubject.next(user);
      return user;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isSupervisor(): boolean {
    return this.hasRole(UserRole.SUPERVISOR);
  }
}