import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Batch, BatchType, CertificateType } from '../../core/models/batch.model';
import { BatchService } from '../../core/services/batch.service';

@Component({
  standalone: false,
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit {
  displayedColumns: string[] = ['batchNumber', 'companyName', 'participants', 'type', 'certificateType', 'startDate', 'instructorName', 'actions'];

  batches: Batch[] = [];
  filteredBatches: Batch[] = [];
  loading = false;

  filterType = '';
  filterCertType = '';

  batchTypes = Object.values(BatchType);
  certificateTypes = Object.values(CertificateType);

  getCertificateClass(certType: string): string {
    return certType.toLowerCase().includes('fire') ? 'fire' : 'water';
  }

  constructor(
    private router: Router,
    private batchService: BatchService
  ) { }

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(): void {
    this.loading = true;
    this.batchService.loadBatches().subscribe({
      next: (response) => {
        this.batches = response.batches;
        this.filteredBatches = [...this.batches];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading batches:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyAllFilters(filterValue);
  }

  onTypeFilter(): void {
    this.applyAllFilters();
  }

  onCertTypeFilter(): void {
    this.applyAllFilters();
  }

  applyAllFilters(searchValue: string = ''): void {
    this.filteredBatches = this.batches.filter(batch => {
      const matchesSearch = !searchValue ||
        batch.batch_number.toLowerCase().includes(searchValue) ||
        batch.company_name.toLowerCase().includes(searchValue) ||
        batch.instructorName.toLowerCase().includes(searchValue);

      const matchesType = !this.filterType || batch.batch_type === this.filterType;
      const matchesCertType = !this.filterCertType || batch.certificate_type === this.filterCertType;

      return matchesSearch && matchesType && matchesCertType;
    });
  }

  createBatch(): void {
    this.router.navigate(['/dashboard/batches/create']);
  }

  editBatch(batch: Batch): void {
    this.router.navigate(['/dashboard/batches/edit', batch.id]);
  }

  viewCertificates(batch: Batch): void {
    this.router.navigate(['/dashboard/certificates'], {
      queryParams: { batchId: batch.id }
    });
  }
}