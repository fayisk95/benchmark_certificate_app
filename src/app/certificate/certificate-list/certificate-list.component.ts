import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Certificate, CertificateStatus, AttachmentType } from '../../core/models/certificate.model';
import { CertificateService } from '../../core/services/certificate.service';

@Component({
  standalone: false,
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  displayedColumns: string[] = ['certificateNumber', 'name', 'employer', 'trainingName', 'issueDate', 'dueDate', 'status', 'attachments', 'actions'];

  public AttachmentType = AttachmentType;

  certificates: Certificate[] = [];
  filteredCertificates: Certificate[] = [];
  loading = false;

  statusFilter = '';
  statuses = Object.values(CertificateStatus);

  constructor(
    private router: Router,
    private certificateService: CertificateService
  ) { }

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.certificateService.loadCertificates().subscribe({
      next: (response) => {
        this.certificates = response.certificates;
        this.filteredCertificates = [...this.certificates];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.loading = false;
      }
    });
  }

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
    // TODO: Implement Excel export functionality
    console.log('Export to Excel:', this.filteredCertificates);
  }

  hasAttachment(certificate: Certificate, type: AttachmentType): boolean {
    return certificate.attachments?.some(att => att.type === type) || false;
  }

  downloadAttachment(certificate: Certificate, type: AttachmentType): void {
    const attachment = certificate.attachments?.find(att => att.type === type);
    if (attachment) {
      // TODO: Implement attachment download
      window.open(attachment.url, '_blank');
    }
  }
}