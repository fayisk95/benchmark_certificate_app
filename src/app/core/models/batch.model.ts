export interface Batch {
  id: string;
  batchNumber: string;
  companyName: string;
  referredBy: string;
  numberOfParticipants: number;
  batchType: BatchType;
  certificateType: CertificateType;
  startDate: Date;
  endDate: Date;
  instructorId: string;
  instructorName: string;
  description: string;
  reservedCertificateNumbers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type BatchType = 'Onsite' | 'Hybrid' | 'Online';
export type CertificateType = 'Fire & Safety' | 'Water Safety';

export interface CreateBatchRequest {
  companyName: string;
  referredBy: string;
  numberOfParticipants: number;
  batchType: BatchType;
  certificateType: CertificateType;
  startDate: Date;
  endDate: Date;
  instructorId: string;
  description: string;
  batchNumber?: string; // Optional for manual override
}