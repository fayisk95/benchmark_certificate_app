import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
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

  constructor(private apiService: ApiService) { }

  // Group operations
  loadGroups(params?: any): Observable<MiscellaneousGroup[]> {
    return this.apiService.get<MiscellaneousGroup[]>('/groups/group-codes', params).pipe(
      tap(response => {
        this._groups.set(response);
      })
    );
  }

  createGroup(request: CreateGroupRequest): Observable<MiscellaneousGroup> {
    return this.apiService.post<GroupResponse>('/groups', request).pipe(
      map(response => response.group),
      tap(group => {
        this._groups.update(groups => [...groups, group]);
      })
    );
  }

  updateGroup(id: string, updates: UpdateGroupRequest): Observable<MiscellaneousGroup> {
    return this.apiService.put<GroupResponse>(`/groups/${id}`, updates).pipe(
      map(response => response.group),
      tap(updatedGroup => {
        this._groups.update(groups =>
          groups.map(group =>
            group.id.toString() === id ? updatedGroup : group
          )
        );
      })
    );
  }

  deleteGroup(id: string): Observable<any> {
    return this.apiService.delete(`/groups/group/${id}`).pipe(
      tap(() => {
        this._groups.update(groups => groups.filter(group => group.id.toString() !== id));
      })
    );
  }

  deleteRecord(id: string): Observable<any> {
    return this.apiService.delete(`/groups/${id}`).pipe(
      tap(() => {
        this._groups.update(groups => groups.filter(group => group.id.toString() !== id));
      })
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
    return this.apiService.get<GroupsResponse>(`/groups/by-code/${groupId}`).pipe(
      map(response => response.groups)
    );
  }
}