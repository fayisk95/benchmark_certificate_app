export interface Batch {
  id: number;
  batch_number: string;
  company_name: string;
  referred_by: string;
  number_of_participants: number;
  batch_type: BatchType;
  certificate_type: CertificateType;
  start_date: string;
  end_date: string;
  instructor_id: number;
  instructor_name?: string;
  instructor_email?: string;
  description: string;
  reserved_cert_numbers: string[];
  training_code: string;
  created_at: string;
  updated_at: string;
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

export interface CreateBatchRequest {
  batch_number?: string;
  company_name: string;
  referred_by: string;
  number_of_participants: number;
  batch_type: BatchType;
  certificate_type: CertificateType;
  start_date: string;
  end_date: string;
  instructor_id: number;
  training_code: string;
  description?: string;
}

export interface UpdateBatchRequest {
  company_name?: string;
  referred_by?: string;
  number_of_participants?: number;
  batch_type?: BatchType;
  certificate_type?: CertificateType;
  start_date?: string;
  end_date?: string;
  instructor_id?: number;
  training_code: string;
  description?: string;
}