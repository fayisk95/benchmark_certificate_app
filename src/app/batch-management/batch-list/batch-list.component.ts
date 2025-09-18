import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Batch, BatchType, CertificateType } from '../../shared/models/batch.model';

@Component({
  standalone: false,
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit {
  displayedColumns: string[] = ['batchNumber', 'companyName', 'participants', 'type', 'certificateType', 'startDate', 'instructor', 'actions'];

  batches: Batch[] = [
    {
      id: '1',
      batchNumber: 'BTH-2024-001',
      companyName: 'ABC Construction Ltd',
      referredBy: 'John Smith',
      numberOfParticipants: 25,
      batchType: BatchType.ONSITE,
      certificateType: CertificateType.FIRE_SAFETY,
      batchStartDate: new Date('2024-01-15'),
      batchEndDate: new Date('2024-01-17'),
      instructor: 'Jane Instructor',
      description: 'Fire safety training for construction workers',
      reservedCertNumbers: Array.from({ length: 25 }, (_, i) => `FS-2024-${String(i + 1).padStart(4, '0')}`),
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      batchNumber: 'BTH-2024-002',
      companyName: 'Marine Services Co',
      referredBy: 'Sarah Johnson',
      numberOfParticipants: 15,
      batchType: BatchType.HYBRID,
      certificateType: CertificateType.WATER_SAFETY,
      batchStartDate: new Date('2024-02-01'),
      batchEndDate: new Date('2024-02-03'),
      instructor: 'Mike Instructor',
      description: 'Water safety training for marine workers',
      reservedCertNumbers: Array.from({ length: 15 }, (_, i) => `WS-2024-${String(i + 1).padStart(4, '0')}`),
      createdAt: new Date('2024-01-20')
    }
  ];

  filteredBatches = [...this.batches];
  filterType = '';
  filterCertType = '';

  batchTypes = Object.values(BatchType);
  certificateTypes = Object.values(CertificateType);

  getCertificateClass(certType: string): string {
    return certType.toLowerCase().includes('fire') ? 'fire' : 'water';
  }

  constructor(private router: Router) { }

  ngOnInit(): void { }

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
        batch.batchNumber.toLowerCase().includes(searchValue) ||
        batch.companyName.toLowerCase().includes(searchValue) ||
        batch.instructor.toLowerCase().includes(searchValue);

      const matchesType = !this.filterType || batch.batchType === this.filterType;
      const matchesCertType = !this.filterCertType || batch.certificateType === this.filterCertType;

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