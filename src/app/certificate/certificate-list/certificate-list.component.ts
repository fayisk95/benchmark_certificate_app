import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Certificate, CertificateStatus, AttachmentType, ExportCertificateRequest } from '../../shared/models/certificate.model';
// import { Certificate, CreateCertificateRequest, UpdateCertificateRequest, CertificateStatus, ExportCertificateRequest } from '../../shared/models/certificate.model';
import { CertificateService } from '../../core/services/certificate.service';
import { BatchService } from '../../core/services/batch.service';
import { Batch } from '../../shared/models/batch.model';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  displayedColumns: string[] = ['certificate_number', 'name', 'employer', 'training_name', 'issue_date', 'due_date', 'status', 'attachments', 'actions'];

  public AttachmentType = AttachmentType;

  certificates: Certificate[] = [];
  filteredCertificates: Certificate[] = [];
  batches: Batch[] = [];
  loading = false;

  statusFilter = '';
  batchFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  statuses = Object.values(CertificateStatus);

  constructor(
    private router: Router,
    private certificateService: CertificateService,
    private batchService: BatchService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadCertificates();
    this.loadBatches();
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

  loadBatches(): void {
    this.batchService.loadBatches().subscribe({
      next: (response) => {
        this.batches = response.batches;
      },
      error: (error) => {
        console.error('Error loading batches:', error);
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

  onBatchFilter(): void {
    this.applyAllFilters();
  }

  onDateFromFilter(): void {
    this.applyAllFilters();
  }

  onDateToFilter(): void {
    this.applyAllFilters();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.batchFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.applyAllFilters();
  }

  applyAllFilters(searchValue: string = ''): void {
    this.filteredCertificates = this.certificates.filter(cert => {
      const matchesSearch = !searchValue ||
        cert.certificate_number.toLowerCase().includes(searchValue) ||
        cert.name.toLowerCase().includes(searchValue) ||
        cert.employer.toLowerCase().includes(searchValue);

      const matchesStatus = !this.statusFilter || cert.status === this.statusFilter;
      const matchesBatch = !this.batchFilter || cert.batch_id?.toString() === this.batchFilter;

      // Date range filter (based on issue date)
      let matchesDateRange = true;
      if (this.dateFromFilter || this.dateToFilter) {
        const certDate = new Date(cert.issue_date);

        if (this.dateFromFilter) {
          const fromDate = new Date(this.dateFromFilter);
          matchesDateRange = matchesDateRange && certDate >= fromDate;
        }

        if (this.dateToFilter) {
          const toDate = new Date(this.dateToFilter);
          // Set to end of day for inclusive comparison
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && certDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesBatch && matchesDateRange;
    });
  }

  getBatchName(batchId: number): string {
    const batch = this.batches.find(b => b.id === batchId);
    return batch ? `${batch.batch_number} - ${batch.company_name}` : 'Unknown Batch';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case CertificateStatus.ACTIVE: return 'active';
      case CertificateStatus.EXPIRED: return 'expired';
      case CertificateStatus.EXPIRING_SOON: return 'expiring';
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

  exportToPdf(certificate: Certificate, format: 'pdf' | 'docx'): void {
    const requestData: ExportCertificateRequest = {
      name: certificate.name.toUpperCase(),
      nationality: certificate.nationality.toUpperCase(),
      license: certificate.eid_license.toUpperCase(),
      employer: certificate.employer.toUpperCase(),
      trainingDate: this.datePipe.transform(certificate.training_date, 'dd-MM-yyyy') || '',
      course: certificate.training_name.toUpperCase(),
      certificateNo: certificate.certificate_number,
      batchNo: certificate.batch_number ?? "",
      issueDate: this.datePipe.transform(certificate.issue_date, 'dd-MM-yyyy') || '',
      dueDate: this.datePipe.transform(certificate.due_date, 'dd-MM-yyyy') || '',
      imagePath: certificate.attachments?.find(att => att.file_type === AttachmentType.USER_PHOTO)?.file_path || '',
      format: format
    };

    this.certificateService.exportCertificates(requestData).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? 'Certificate.pdf' : 'Certificate.docx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  exportToWord(certificate: Certificate): void {
    if (this.filteredCertificates.length === 0) {
      alert('No certificates to export');
      return;
    }
  }

  exportToExcel(): void {
    if (this.filteredCertificates.length === 0) {
      alert('No certificates to export');
      return;
    }

    // Prepare data for Excel export
    const exportData = this.filteredCertificates.map(cert => ({
      'Certificate Number': cert.certificate_number,
      'Name': cert.name,
      'Nationality': cert.nationality,
      'EID/License': cert.eid_license,
      'Employer': cert.employer,
      'Training Name': cert.training_name,
      'Training Date': this.formatDateForExcel(cert.training_date),
      'Issue Date': this.formatDateForExcel(cert.issue_date),
      'Due Date': this.formatDateForExcel(cert.due_date),
      'Status': cert.status,
      'Batch Number': cert.batch_number || '',
      'Company': cert.company_name || '',
      'Referred By': cert.referred_by || '',
      'Created Date': this.formatDateForExcel(cert.created_at)
    }));

    // Create workbook and worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Certificate Number
      { wch: 25 }, // Name
      { wch: 15 }, // Nationality
      { wch: 20 }, // EID/License
      { wch: 30 }, // Employer
      { wch: 30 }, // Training Name
      { wch: 15 }, // Training Date
      { wch: 15 }, // Issue Date
      { wch: 15 }, // Due Date
      { wch: 15 }, // Status
      { wch: 20 }, // Batch Number
      { wch: 30 }, // Company
      { wch: 15 }  // Created Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Certificates');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `certificates_export_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  }

  private formatDateForExcel(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  hasAttachment(certificate: Certificate, type: AttachmentType): boolean {
    return certificate.attachments?.some(att => att.file_type === type) || false;
  }

  downloadAttachment(certificate: Certificate, type: AttachmentType): void {
    const attachment = certificate.attachments?.find(att => att.file_type === type);
    if (attachment) {
      // TODO: Implement attachment download
      const url = `${window.location.origin}/${attachment.file_path}`;
      window.open(url, '_blank');
    }
  }
}