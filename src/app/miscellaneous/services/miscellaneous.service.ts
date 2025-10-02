import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationService } from '../../shared/services/notification.service';
import {
  MiscellaneousGroup,
  CreateGroupRequest,
  UpdateGroupRequest,
} from '../models/miscellaneous.model';

interface GroupsResponse {
  groups: MiscellaneousGroup[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GroupResponse {
  group: MiscellaneousGroup;
  message?: string;
}
@Injectable({
  providedIn: 'root'
})
export class MiscellaneousService {
  private _groups = signal<MiscellaneousGroup[]>([]);

  groups = this._groups.asReadonly();

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  // Group operations
  loadGroups(params?: any): Observable<MiscellaneousGroup[]> {
    this.loadingService.show();
    return this.apiService.get<MiscellaneousGroup[]>('/groups/group-codes', params).pipe(
      tap(response => {
        this._groups.set(response);
      }),
      catchError((error) => {
        this.notificationService.error('Failed to load groups');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  createGroup(request: CreateGroupRequest): Observable<MiscellaneousGroup> {
    this.loadingService.show();
    return this.apiService.post<GroupResponse>('/groups', request).pipe(
      map(response => response.group),
      tap(group => {
        this._groups.update(groups => [...groups, group]);
        this.notificationService.success('Group created successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to create group';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateGroup(id: string, updates: UpdateGroupRequest): Observable<MiscellaneousGroup> {
    this.loadingService.show();
    return this.apiService.put<GroupResponse>(`/groups/${id}`, updates).pipe(
      map(response => response.group),
      tap(updatedGroup => {
        this._groups.update(groups =>
          groups.map(group =>
            group.id.toString() === id ? updatedGroup : group
          )
        );
        this.notificationService.success('Group updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update group';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteGroup(id: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/groups/group/${id}`).pipe(
      tap(() => {
        this._groups.update(groups => groups.filter(group => group.id.toString() !== id));
        this.notificationService.success('Group deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete group';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteRecord(id: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/groups/${id}`).pipe(
      tap(() => {
        this._groups.update(groups => groups.filter(group => group.id.toString() !== id));
        this.notificationService.success('Record deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete record';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getGroupById(id: number): MiscellaneousGroup | undefined {
    return this.groups().find(group => group.id === id);
  }

  getGroupByIdFromApi(id: string): Observable<MiscellaneousGroup> {
    return this.apiService.get<GroupResponse>(`/groups/${id}`).pipe(
      map(response => response.group)
    );
  }

  getRecordsByGroup(groupId: string): Observable<MiscellaneousGroup[]> {
    this.loadingService.show();
    return this.apiService.get<GroupsResponse>(`/groups/by-code/${groupId}`).pipe(
      map(response => response.groups),
      catchError((error) => {
        this.notificationService.error('Failed to load records');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}