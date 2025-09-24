import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest, CertificateStatus } from '../../shared/models/certificate.model';
import { ApiService } from './api.service';

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

  constructor(private apiService: ApiService) {}

  loadCertificates(params?: any): Observable<CertificatesResponse> {
    return this.apiService.get<CertificatesResponse>('/certificates', params).pipe(
      tap(response => {
        this._certificates.set(response.certificates);
      })
    );
  }

  createCertificate(request: CreateCertificateRequest): Observable<Certificate> {
    return this.apiService.post<CertificateResponse>('/certificates', request).pipe(
      map(response => response.certificate),
      tap(certificate => {
        this._certificates.update(certs => [...certs, certificate]);
      })
    );
  }

  getCertificateById(id: number): Certificate | undefined {
    return this.certificates().find(cert => cert.id === id);
  }

  getCertificateByIdFromApi(id: string): Observable<Certificate> {
    return this.apiService.get<CertificateResponse>(`/certificates/${id}`).pipe(
      map(response => response.certificate)
    );
  }

  getCertificatesByStatus(status: CertificateStatus): Certificate[] {
    return this.certificates().filter(cert => cert.status === status);
  }

  updateCertificate(id: string, updates: UpdateCertificateRequest): Observable<Certificate> {
    return this.apiService.put<CertificateResponse>(`/certificates/${id}`, updates).pipe(
      map(response => response.certificate),
      tap(updatedCertificate => {
        this._certificates.update(certs =>
          certs.map(cert =>
            cert.id.toString() === id ? updatedCertificate : cert
          )
        );
      })
    );
  }

  deleteCertificate(id: string): Observable<any> {
    return this.apiService.delete(`/certificates/${id}`).pipe(
      tap(() => {
        this._certificates.update(certs => certs.filter(cert => cert.id.toString() !== id));
      })
    );
  }

  uploadAttachment(certificateId: string, file: File, fileType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    return this.apiService.uploadFile(`/certificates/${certificateId}/attachments`, formData);
  }

  deleteAttachment(certificateId: string, attachmentId: string): Observable<any> {
    return this.apiService.delete(`/certificates/${certificateId}/attachments/${attachmentId}`);
  }

  updateCertificateStatuses(): Observable<any> {
    return this.apiService.post('/certificates/update-statuses', {});
  }

  getCertificateStats(): Observable<CertificateStatsResponse> {
    return this.apiService.get<CertificateStatsResponse>('/certificates/stats/overview');
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
}