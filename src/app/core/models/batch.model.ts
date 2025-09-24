export interface Batch {
  id: string;
  batch_number: string;
  company_name: string;
  referred_by: string;
  number_of_participants: number;
  batch_type: BatchType;
  certificate_type: CertificateType;
  start_date: Date;
  end_date: Date;
  instructor_id: string;
  instructorName: string;
  description: string;
  reservedCertificateNumbers: string[];
  created_at: Date;
  updated_at: Date;
}

export enum BatchType {
  Onsite = 'Onsite',
  Hybrid = 'Hybrid',
  Online = 'Online'
}

export enum CertificateType {
  FireSafety = 'Fire & Safety',
  WaterSafety = 'Water Safety'
}

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