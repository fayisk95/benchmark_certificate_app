import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { 
  MiscellaneousGroup, 
  MiscellaneousRecord, 
  CreateGroupRequest, 
  UpdateGroupRequest,
  CreateRecordRequest,
  UpdateRecordRequest
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

interface RecordsResponse {
  records: MiscellaneousRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface RecordResponse {
  record: MiscellaneousRecord;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MiscellaneousService {
  private _groups = signal<MiscellaneousGroup[]>([]);
  private _records = signal<MiscellaneousRecord[]>([]);
  
  groups = this._groups.asReadonly();
  records = this._records.asReadonly();

  constructor(private apiService: ApiService) {}

  // Group operations
  loadGroups(params?: any): Observable<GroupsResponse> {
    return this.apiService.get<GroupsResponse>('/groups', params).pipe(
      tap(response => {
        this._groups.set(response.groups);
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

  // Record operations
  loadRecords(groupId?: number, params?: any): Observable<RecordsResponse> {
    const endpoint = groupId ? `/groups/${groupId}/records` : '/records';
    return this.apiService.get<RecordsResponse>(endpoint, params).pipe(
      tap(response => {
        this._records.set(response.records);
      })
    );
  }

  createRecord(request: CreateRecordRequest): Observable<MiscellaneousRecord> {
    return this.apiService.post<RecordResponse>('/records', request).pipe(
      map(response => response.record),
      tap(record => {
        this._records.update(records => [...records, record]);
      })
    );
  }

  updateRecord(id: string, updates: UpdateRecordRequest): Observable<MiscellaneousRecord> {
    return this.apiService.put<RecordResponse>(`/records/${id}`, updates).pipe(
      map(response => response.record),
      tap(updatedRecord => {
        this._records.update(records =>
          records.map(record =>
            record.id.toString() === id ? updatedRecord : record
          )
        );
      })
    );
  }

  deleteRecord(id: string): Observable<any> {
    return this.apiService.delete(`/records/${id}`).pipe(
      tap(() => {
        this._records.update(records => records.filter(record => record.id.toString() !== id));
      })
    );
  }

  getRecordsByGroup(groupId: number): MiscellaneousRecord[] {
    return this.records().filter(record => record.group_id === groupId);
  }

  // Utility methods
  getGroupCodes(): string[] {
    const codes = this.groups().map(group => group.group_code);
    return [...new Set(codes)].sort();
  }
}