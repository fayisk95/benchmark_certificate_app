import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest } from '../../core/models/user.model';
import { ApiService, ApiResponse } from '../../core/services/api.service';

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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _users = signal<User[]>([]);
  users = this._users.asReadonly();

  constructor(private apiService: ApiService) {
    this.loadUsers();
  }

  loadUsers(params?: any): Observable<UsersResponse> {
    return this.apiService.get<UsersResponse>('/users', params).pipe(
      tap(response => {
        this._users.set(response.users);
      })
    );
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.apiService.post<UserResponse>('/users', request).pipe(
      map(response => response.user),
      tap(user => {
        this._users.update(users => [...users, user]);
      })
    );
  }

  getUserById(id: string): User | undefined {
    return this.users().find(user => user.id === id);
  }

  getUserByIdFromApi(id: string): Observable<User> {
    return this.apiService.get<UserResponse>(`/users/${id}`).pipe(
      map(response => response.user)
    );
  }

  updateUser(id: string, updates: UpdateUserRequest): Observable<User> {
    return this.apiService.put<UserResponse>(`/users/${id}`, updates).pipe(
      map(response => response.user),
      tap(updatedUser => {
        this._users.update(users =>
          users.map(user =>
            user.id === id ? updatedUser : user
          )
        );
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.apiService.delete(`/users/${id}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(user => user.id !== id));
      })
    );
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.apiService.patch(`/users/${id}/toggle-status`, {}).pipe(
      tap(() => {
        this._users.update(users =>
          users.map(user =>
            user.id === id
              ? { ...user, isActive: !user.isActive }
              : user
          )
        );
      })
    );
  }

  getInstructors(): Observable<User[]> {
    return this.apiService.get<{ instructors: User[] }>('/users/instructors/list').pipe(
      map(response => response.instructors)
    );
  }
}