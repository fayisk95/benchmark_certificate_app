import { Injectable, signal } from '@angular/core';
import { Certificate, CreateCertificateRequest, CertificateStatus } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private _certificates = signal<Certificate[]>([]);
  certificates = this._certificates.asReadonly();

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData() {
    const demoCertificates: Certificate[] = [
      {
        id: '1',
        certificateNumber: 'FS-2024-001',
        batchId: '1',
        batchNumber: 'B-1001',
        name: 'Ahmed Hassan',
        nationality: 'UAE',
        eidLicense: '784-1234-5678901-2',
        employer: 'ABC Corporation',
        trainingName: 'Fire Safety Training',
        trainingDate: new Date('2024-01-15'),
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2025-01-20'),
        status: 'Active',
        attachments: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        certificateNumber: 'WS-2024-001',
        batchId: '2',
        batchNumber: 'B-1002',
        name: 'Mohammed Ali',
        nationality: 'India',
        eidLicense: '784-9876-5432109-8',
        employer: 'XYZ Industries',
        trainingName: 'Water Safety Training',
        trainingDate: new Date('2024-02-01'),
        issueDate: new Date('2024-02-05'),
        dueDate: new Date('2024-03-15'), // Expiring soon for demo
        status: 'Expiring Soon',
        attachments: [],
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05')
      }
    ];
    
    this._certificates.set(demoCertificates);
  }

  createCertificate(request: CreateCertificateRequest): Promise<Certificate> {
    return new Promise((resolve) => {
      const certificate: Certificate = {
        id: Date.now().toString(),
        certificateNumber: request.certificateNumber || this.generateCertificateNumber(),
        batchId: request.batchId,
        batchNumber: 'B-' + request.batchId, // In real app, get from batch service
        name: request.name,
        nationality: request.nationality,
        eidLicense: request.eidLicense,
        employer: request.employer,
        trainingName: request.trainingName,
        trainingDate: request.trainingDate,
        issueDate: request.issueDate,
        dueDate: request.dueDate,
        status: this.calculateStatus(request.dueDate),
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this._certificates.update(certs => [...certs, certificate]);
      resolve(certificate);
    });
  }

  private generateCertificateNumber(): string {
    return `CERT-${Date.now()}`;
  }

  private calculateStatus(dueDate: Date): CertificateStatus {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (dueDate < now) {
      return 'Expired';
    } else if (dueDate < thirtyDaysFromNow) {
      return 'Expiring Soon';
    }
    return 'Active';
  }

  getCertificateById(id: string): Certificate | undefined {
    return this.certificates().find(cert => cert.id === id);
  }

  getCertificatesByStatus(status: CertificateStatus): Certificate[] {
    return this.certificates().filter(cert => cert.status === status);
  }

  updateCertificate(id: string, updates: Partial<Certificate>): Promise<void> {
    return new Promise((resolve) => {
      this._certificates.update(certs => 
        certs.map(cert => 
          cert.id === id 
            ? { ...cert, ...updates, updatedAt: new Date() }
            : cert
        )
      );
      resolve();
    });
  }

  deleteCertificate(id: string): Promise<void> {
    return new Promise((resolve) => {
      this._certificates.update(certs => certs.filter(cert => cert.id !== id));
      resolve();
    });
  }

  getStatistics() {
    const certs = this.certificates();
    return {
      total: certs.length,
      active: certs.filter(c => c.status === 'Active').length,
      expired: certs.filter(c => c.status === 'Expired').length,
      expiringSoon: certs.filter(c => c.status === 'Expiring Soon').length
    };
  }
}