import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user.model';
import { ApiService } from '../../core/services/api.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationService } from '../../shared/services/notification.service';

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UserResponse {
  user: User;
  message?: string;
}

interface InstructorsResponse {
  instructors: User[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _users = signal<User[]>([]);
  users = this._users.asReadonly();

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  loadUsers(params?: any): Observable<UsersResponse> {
    this.loadingService.show();
    return this.apiService.get<UsersResponse>('/users', params).pipe(
      tap(response => {
        this._users.set(response.users);
      }),
      catchError((error) => {
        this.notificationService.error('Failed to load users');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  createUser(request: CreateUserRequest): Observable<User> {
    this.loadingService.show();
    return this.apiService.post<UserResponse>('/users', request).pipe(
      map(response => response.user),
      tap(user => {
        this._users.update(users => [...users, user]);
        this.notificationService.success('User created successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to create user';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getUserById(id: number): User | undefined {
    return this.users().find(user => user.id === id);
  }

  getUserByIdFromApi(id: string): Observable<User> {
    this.loadingService.show();
    return this.apiService.get<UserResponse>(`/users/${id}`).pipe(
      map(response => response.user),
      catchError((error) => {
        this.notificationService.error('Failed to load user details');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateUser(id: string, updates: UpdateUserRequest): Observable<User> {
    this.loadingService.show();
    return this.apiService.put<UserResponse>(`/users/${id}`, updates).pipe(
      map(response => response.user),
      tap(updatedUser => {
        this._users.update(users =>
          users.map(user =>
            user.id.toString() === id ? updatedUser : user
          )
        );
        this.notificationService.success('User updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update user';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteUser(id: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/users/${id}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(user => user.id.toString() !== id));
        this.notificationService.success('User deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete user';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  toggleUserStatus(id: number): Observable<any> {
    this.loadingService.show();
    return this.apiService.patch(`/users/${id}/toggle-status`, {}).pipe(
      tap((response: any) => {
        this._users.update(users =>
          users.map(user =>
            user.id === id
              ? { ...user, is_active: response.is_active }
              : user
          )
        );
        this.notificationService.success('User status updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to toggle user status';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getInstructors(): Observable<User[]> {
    this.loadingService.show();
    return this.apiService.get<InstructorsResponse>('/users/instructors/list').pipe(
      map(response => response.instructors),
      catchError((error) => {
        this.notificationService.error('Failed to load instructors');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}