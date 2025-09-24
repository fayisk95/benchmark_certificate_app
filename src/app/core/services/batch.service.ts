import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Batch, CreateBatchRequest, UpdateBatchRequest } from '../../shared/models/batch.model';
import { ApiService } from './api.service';

interface BatchesResponse {
  batches: Batch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface BatchResponse {
  batch: Batch;
  message?: string;
}

interface BatchStatsResponse {
  batchesByType: Array<{ batch_type: string; count: number }>;
  batchesByCertType: Array<{ certificate_type: string; count: number }>;
  monthlyBatches: Array<{ month: string; count: number }>;
  totalParticipants: number;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private _batches = signal<Batch[]>([]);
  batches = this._batches.asReadonly();

  constructor(private apiService: ApiService) {}

  loadBatches(params?: any): Observable<BatchesResponse> {
    return this.apiService.get<BatchesResponse>('/batches', params).pipe(
      tap(response => {
        this._batches.set(response.batches);
      })
    );
  }

  createBatch(request: CreateBatchRequest): Observable<Batch> {
    return this.apiService.post<BatchResponse>('/batches', request).pipe(
      map(response => response.batch),
      tap(batch => {
        this._batches.update(batches => [...batches, batch]);
      })
    );
  }

  getBatchById(id: number): Batch | undefined {
    return this.batches().find(batch => batch.id === id);
  }

  getBatchByIdFromApi(id: string): Observable<Batch> {
    return this.apiService.get<BatchResponse>(`/batches/${id}`).pipe(
      map(response => response.batch)
    );
  }

  updateBatch(id: string, updates: UpdateBatchRequest): Observable<Batch> {
    return this.apiService.put<BatchResponse>(`/batches/${id}`, updates).pipe(
      map(response => response.batch),
      tap(updatedBatch => {
        this._batches.update(batches =>
          batches.map(batch =>
            batch.id.toString() === id ? updatedBatch : batch
          )
        );
      })
    );
  }

  deleteBatch(id: string): Observable<any> {
    return this.apiService.delete(`/batches/${id}`).pipe(
      tap(() => {
        this._batches.update(batches => batches.filter(batch => batch.id.toString() !== id));
      })
    );
  }

  getBatchStats(): Observable<BatchStatsResponse> {
    return this.apiService.get<BatchStatsResponse>('/batches/stats/overview');
  }
}