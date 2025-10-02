import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap, map, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { User, UserRole, LoginRequest, LoginResponse } from '../models/user.model';
import { LoadingService } from './loading.service';
import { NotificationService } from './notification.service';

interface ProfileResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<User | null> {
    const loginData: LoginRequest = { email, password };
    this.loadingService.show();

    return this.apiService.post<LoginResponse>('/auth/login', loginData).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.notificationService.success('Login successful');
      }),
      map(response => response.user),
      catchError((error) => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.notificationService.error(errorMessage);
        return of(null);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  private loadUserProfile(): Observable<ProfileResponse> {
    return this.apiService.get<ProfileResponse>('/auth/profile');
  }

  logout(): void {
    this.apiService.post('/auth/logout', {}).subscribe({
      complete: () => {
        this.clearAuthData();
      },
      error: () => {
        this.clearAuthData();
      }
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken') && this.currentUserSubject.value !== null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
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

  updateProfile(profileData: Partial<User>): Observable<ProfileResponse> {
    this.loadingService.show();
    return this.apiService.put<ProfileResponse>('/auth/profile', profileData).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.notificationService.success('Profile updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update profile';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.put('/auth/change-password', {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        this.notificationService.success('Password changed successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to change password';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}