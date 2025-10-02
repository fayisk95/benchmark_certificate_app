import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { Batch, CreateBatchRequest, UpdateBatchRequest } from '../../shared/models/batch.model';
import { ApiService } from './api.service';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationService } from '../../shared/services/notification.service';

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

  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  loadBatches(params?: any): Observable<BatchesResponse> {
    this.loadingService.show();
    return this.apiService.get<BatchesResponse>('/batches', params).pipe(
      tap(response => {
        this._batches.set(response.batches);
      }),
      catchError((error) => {
        this.notificationService.error('Failed to load batches');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  createBatch(request: CreateBatchRequest): Observable<Batch> {
    this.loadingService.show();
    return this.apiService.post<BatchResponse>('/batches', request).pipe(
      map(response => response.batch),
      tap(batch => {
        this._batches.update(batches => [...batches, batch]);
        this.notificationService.success('Batch created successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to create batch';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getBatchById(id: number): Batch | undefined {
    return this.batches().find(batch => batch.id === id);
  }

  getBatchByIdFromApi(id: string): Observable<Batch> {
    this.loadingService.show();
    return this.apiService.get<BatchResponse>(`/batches/${id}`).pipe(
      map(response => response.batch),
      catchError((error) => {
        this.notificationService.error('Failed to load batch details');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateBatch(id: string, updates: UpdateBatchRequest): Observable<Batch> {
    console.log('Updating batch with ID:', id, 'with updates:', updates);
    this.loadingService.show();
    return this.apiService.put<BatchResponse>(`/batches/${id}`, updates).pipe(
      map(response => response.batch),
      tap(updatedBatch => {
        this._batches.update(batches =>
          batches.map(batch =>
            batch.id.toString() === id ? updatedBatch : batch
          )
        );
        this.notificationService.success('Batch updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update batch';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteBatch(id: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/batches/${id}`).pipe(
      tap(() => {
        this._batches.update(batches => batches.filter(batch => batch.id.toString() !== id));
        this.notificationService.success('Batch deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete batch';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getBatchStats(): Observable<BatchStatsResponse> {
    this.loadingService.show();
    return this.apiService.get<BatchStatsResponse>('/batches/stats/overview').pipe(
      catchError((error) => {
        this.notificationService.error('Failed to load batch statistics');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}