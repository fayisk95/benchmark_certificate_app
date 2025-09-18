import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Certificate, CertificateStatus, AttachmentType } from '../../shared/models/certificate.model';

@Component({
  standalone: false,
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  displayedColumns: string[] = ['certificateNumber', 'name', 'employer', 'trainingName', 'issueDate', 'dueDate', 'status', 'attachments', 'actions'];

  public AttachmentType = AttachmentType;

  certificates: Certificate[] = [
    {
      id: '1',
      certificateNumber: 'FS-2024-0001',
      batchId: '1',
      name: 'Ahmed Al Mansouri',
      nationality: 'UAE',
      eidLicense: '784-1234-1234567-1',
      employer: 'ABC Construction Ltd',
      trainingName: 'Fire Safety Training',
      trainingDate: new Date('2024-01-15'),
      issueDate: new Date('2024-01-17'),
      dueDate: new Date('2025-01-17'),
      status: CertificateStatus.ACTIVE,
      attachments: [
        {
          id: '1',
          certificateId: '1',
          fileName: 'eid_ahmed.pdf',
          fileType: AttachmentType.EID,
          fileUrl: '/uploads/eid_ahmed.pdf',
          uploadedAt: new Date()
        }
      ],
      createdAt: new Date('2024-01-17')
    },
    {
      id: '2',
      certificateNumber: 'WS-2024-0001',
      batchId: '2',
      name: 'John Smith',
      nationality: 'UK',
      eidLicense: 'DL-12345678',
      employer: 'Marine Services Co',
      trainingName: 'Water Safety Training',
      trainingDate: new Date('2024-02-01'),
      issueDate: new Date('2024-02-03'),
      dueDate: new Date('2024-03-03'),
      status: CertificateStatus.EXPIRING_SOON,
      attachments: [],
      createdAt: new Date('2024-02-03')
    }
  ];

  filteredCertificates = [...this.certificates];
  statusFilter = '';
  statuses = Object.values(CertificateStatus);

  constructor(private router: Router) { }

  ngOnInit(): void { }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyAllFilters(filterValue);
  }

  onStatusFilter(): void {
    this.applyAllFilters();
  }

  applyAllFilters(searchValue: string = ''): void {
    this.filteredCertificates = this.certificates.filter(cert => {
      const matchesSearch = !searchValue ||
        cert.certificateNumber.toLowerCase().includes(searchValue) ||
        cert.name.toLowerCase().includes(searchValue) ||
        cert.employer.toLowerCase().includes(searchValue);

      const matchesStatus = !this.statusFilter || cert.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'active';
      case 'Expired': return 'expired';
      case 'Expiring Soon': return 'expiring';
      default: return 'active';
    }
  }
  createCertificate(): void {
    this.router.navigate(['/dashboard/certificates/create']);
  }

  editCertificate(certificate: Certificate): void {
    this.router.navigate(['/dashboard/certificates/edit', certificate.id]);
  }

  previewCertificate(certificate: Certificate): void {
    // Open certificate preview in new window
    console.log('Preview certificate:', certificate);
  }

  exportToPdf(certificate: Certificate): void {
    // Export single certificate to PDF
    console.log('Export to PDF:', certificate);
  }

  exportToExcel(): void {
    // Export filtered certificates to Excel
    console.log('Export to Excel:', this.filteredCertificates);
  }

  hasAttachment(certificate: Certificate, type: AttachmentType): boolean {
    return certificate.attachments?.some(att => att.fileType === type) || false;
  }

  downloadAttachment(certificate: Certificate, type: AttachmentType): void {
    const attachment = certificate.attachments?.find(att => att.fileType === type);
    if (attachment) {
      // Download attachment
      console.log('Download attachment:', attachment);
    }
  }
}