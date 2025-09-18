import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Batch, BatchType, CertificateType } from '../../../core/models/batch.model';
import { BatchService } from '../../../core/services/batch.service';

@Component({
  standalone: false, selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit {
  private batchService = inject(BatchService);
  private router = inject(Router);

  batches: Batch[] = [];
  displayedColumns = ['batchNumber', 'companyName', 'batchType', 'certificateType', 'participants', 'dates', 'instructor', 'actions'];

  ngOnInit() {
    this.loadBatches();
  }

  private loadBatches() {
    this.batches = this.batchService.batches();
  }

  createBatch() {
    this.router.navigate(['/batches/create']);
  }

  editBatch(batch: Batch) {
    this.router.navigate(['/batches/edit', batch.id]);
  }

  async deleteBatch(batch: Batch) {
    if (confirm(`Are you sure you want to delete batch "${batch.batchNumber}"?`)) {
      await this.batchService.deleteBatch(batch.id);
      this.loadBatches();
    }
  }

  getBatchTypeColor(type: BatchType): string {
    const colors = {
      'Onsite': '#4caf50',
      'Hybrid': '#ff9800',
      'Online': '#2196f3'
    };
    return colors[type];
  }

  getCertificateTypeColor(type: CertificateType): string {
    const colors = {
      'Fire & Safety': '#f44336',
      'Water Safety': '#00bcd4'
    };
    return colors[type];
  }
}