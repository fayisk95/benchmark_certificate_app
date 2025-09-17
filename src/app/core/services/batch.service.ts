import { Injectable, signal } from '@angular/core';
import { Batch, CreateBatchRequest } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private _batches = signal<Batch[]>([]);
  batches = this._batches.asReadonly();
  
  private nextBatchNumber = 1001;

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData() {
    const demoBatches: Batch[] = [
      {
        id: '1',
        batchNumber: 'B-1001',
        companyName: 'ABC Corporation',
        referredBy: 'John Smith',
        numberOfParticipants: 25,
        batchType: 'Onsite',
        certificateType: 'Fire & Safety',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-19'),
        instructorId: '1',
        instructorName: 'Jane Doe',
        description: 'Fire safety training for office staff',
        reservedCertificateNumbers: this.generateCertificateNumbers(25, 'FS-2024-001'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '2',
        batchNumber: 'B-1002',
        companyName: 'XYZ Industries',
        referredBy: 'Sarah Johnson',
        numberOfParticipants: 15,
        batchType: 'Hybrid',
        certificateType: 'Water Safety',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-03'),
        instructorId: '2',
        instructorName: 'Mike Wilson',
        description: 'Water safety training for maritime workers',
        reservedCertificateNumbers: this.generateCertificateNumbers(15, 'WS-2024-001'),
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
      }
    ];
    
    this._batches.set(demoBatches);
  }

  createBatch(request: CreateBatchRequest): Promise<Batch> {
    return new Promise((resolve) => {
      const batch: Batch = {
        id: Date.now().toString(),
        batchNumber: request.batchNumber || this.generateBatchNumber(),
        companyName: request.companyName,
        referredBy: request.referredBy,
        numberOfParticipants: request.numberOfParticipants,
        batchType: request.batchType,
        certificateType: request.certificateType,
        startDate: request.startDate,
        endDate: request.endDate,
        instructorId: request.instructorId,
        instructorName: 'Instructor Name', // In real app, get from user service
        description: request.description,
        reservedCertificateNumbers: this.generateCertificateNumbers(
          request.numberOfParticipants,
          this.getCertificatePrefix(request.certificateType)
        ),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this._batches.update(batches => [...batches, batch]);
      resolve(batch);
    });
  }

  private generateBatchNumber(): string {
    return `B-${this.nextBatchNumber++}`;
  }

  private getCertificatePrefix(type: string): string {
    return type === 'Fire & Safety' ? 'FS-2024-' : 'WS-2024-';
  }

  private generateCertificateNumbers(count: number, prefix: string): string[] {
    const numbers = [];
    const startNumber = Math.floor(Math.random() * 1000) + 1;
    
    for (let i = 0; i < count; i++) {
      numbers.push(`${prefix}${String(startNumber + i).padStart(3, '0')}`);
    }
    
    return numbers;
  }

  getBatchById(id: string): Batch | undefined {
    return this.batches().find(batch => batch.id === id);
  }

  updateBatch(id: string, updates: Partial<Batch>): Promise<void> {
    return new Promise((resolve) => {
      this._batches.update(batches => 
        batches.map(batch => 
          batch.id === id 
            ? { ...batch, ...updates, updatedAt: new Date() }
            : batch
        )
      );
      resolve();
    });
  }

  deleteBatch(id: string): Promise<void> {
    return new Promise((resolve) => {
      this._batches.update(batches => batches.filter(batch => batch.id !== id));
      resolve();
    });
  }
}