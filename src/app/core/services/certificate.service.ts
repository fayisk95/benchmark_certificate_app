import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest, CertificateStatus, ExportCertificateRequest } from '../../shared/models/certificate.model';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../shared/services/loading.service';
import { NotificationService } from '../../shared/services/notification.service';

interface CertificatesResponse {
  certificates: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CertificateResponse {
  certificate: Certificate;
  message?: string;
}

interface CertificateStatsResponse {
  certificatesByStatus: Array<{ status: string; count: number }>;
  certificatesByTraining: Array<{ training_name: string; count: number }>;
  monthlyCertificates: Array<{ month: string; count: number }>;
  expiringSoon: number;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private _certificates = signal<Certificate[]>([]);
  certificates = this._certificates.asReadonly();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  loadCertificates(params?: any): Observable<CertificatesResponse> {
    this.loadingService.show();
    return this.apiService.get<CertificatesResponse>('/certificates', params).pipe(
      tap(response => {
        this._certificates.set(response.certificates);
      }),
      catchError((error) => {
        this.notificationService.error('Failed to load certificates');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  createCertificate(request: CreateCertificateRequest): Observable<Certificate> {
    this.loadingService.show();
    return this.apiService.post<CertificateResponse>('/certificates', request).pipe(
      map(response => response.certificate),
      tap(certificate => {
        this._certificates.update(certs => [...certs, certificate]);
        this.notificationService.success('Certificate created successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to create certificate';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getCertificateById(id: number): Certificate | undefined {
    return this.certificates().find(cert => cert.id === id);
  }

  getCertificateByIdFromApi(id: string): Observable<Certificate> {
    this.loadingService.show();
    return this.apiService.get<CertificateResponse>(`/certificates/${id}`).pipe(
      map(response => response.certificate),
      catchError((error) => {
        this.notificationService.error('Failed to load certificate details');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getCertificatesByStatus(status: CertificateStatus): Certificate[] {
    return this.certificates().filter(cert => cert.status === status);
  }

  updateCertificate(id: string, updates: UpdateCertificateRequest): Observable<Certificate> {
    this.loadingService.show();
    return this.apiService.put<CertificateResponse>(`/certificates/${id}`, updates).pipe(
      map(response => response.certificate),
      tap(updatedCertificate => {
        this._certificates.update(certs =>
          certs.map(cert =>
            cert.id.toString() === id ? updatedCertificate : cert
          )
        );
        this.notificationService.success('Certificate updated successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to update certificate';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteCertificate(id: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/certificates/${id}`).pipe(
      tap(() => {
        this._certificates.update(certs => certs.filter(cert => cert.id.toString() !== id));
        this.notificationService.success('Certificate deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete certificate';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  uploadAttachment(certificateId: string, file: File, fileType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    this.loadingService.show();
    return this.apiService.uploadFile(`/certificates/${certificateId}/attachments`, formData).pipe(
      tap(() => {
        this.notificationService.success('File uploaded successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to upload file';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
  downloadFile(filePath: string) {
    this.loadingService.show();
    return this.apiService.getFile(`/certificates/download?file=${filePath}`);
  }
  deleteAttachment(certificateId: string, attachmentId: string): Observable<any> {
    this.loadingService.show();
    return this.apiService.delete(`/certificates/${certificateId}/attachments/${attachmentId}`).pipe(
      tap(() => {
        this.notificationService.success('Attachment deleted successfully');
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Failed to delete attachment';
        this.notificationService.error(errorMessage);
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateCertificateStatuses(): Observable<any> {
    return this.apiService.post('/certificates/update-statuses', {});
  }

  getCertificateStats(): Observable<CertificateStatsResponse> {
    this.loadingService.show();
    return this.apiService.get<CertificateStatsResponse>('/certificates/stats/overview').pipe(
      catchError((error) => {
        this.notificationService.error('Failed to load certificate statistics');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getStatistics() {
    const certs = this.certificates();
    return {
      total: certs.length,
      active: certs.filter(c => c.status === CertificateStatus.ACTIVE).length,
      expired: certs.filter(c => c.status === CertificateStatus.EXPIRED).length,
      expiringSoon: certs.filter(c => c.status === CertificateStatus.EXPIRING_SOON).length
    };
  }

  exportCertificates(certificates: ExportCertificateRequest): Observable<any> {
    this.loadingService.show();
    return this.http.post('http://localhost:3000/api/export/generate-certificate', certificates, {
      responseType: 'blob' as 'blob',
      observe: 'body'
    }).pipe(
      tap(() => {
        this.notificationService.success('Certificates exported successfully');
      }),
      catchError((error) => {
        this.notificationService.error('Failed to export certificates');
        throw error;
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}