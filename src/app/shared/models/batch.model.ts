export interface Batch {
  id: string;
  batchNumber: string;
  companyName: string;
  referredBy: string;
  numberOfParticipants: number;
  batchType: BatchType;
  certificateType: CertificateType;
  batchStartDate: Date;
  batchEndDate: Date;
  instructor: string;
  description: string;
  reservedCertNumbers: string[];
  createdAt: Date;
}

export enum BatchType {
  ONSITE = 'Onsite',
  HYBRID = 'Hybrid',
  ONLINE = 'Online'
}

export enum CertificateType {
  FIRE_SAFETY = 'Fire & Safety',
  WATER_SAFETY = 'Water Safety'
}