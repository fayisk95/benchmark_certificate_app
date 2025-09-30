export interface Certificate {
  id: number;
  certificate_number: string;
  batch_id: number;
  batch_number?: string;
  company_name?: string;
  name: string;
  nationality: string;
  eid_license: string;
  employer: string;
  training_name: string;
  training_date: string;
  issue_date: string;
  due_date: string;
  referred_by?: string;
  status: CertificateStatus;
  attachments?: CertificateAttachment[];
  created_at: string;
  updated_at: string;
}

export enum CertificateStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  EXPIRING_SOON = 'Expiring Soon'
}

export interface CertificateAttachment {
  id: number;
  certificate_id: number;
  file_name: string;
  file_type: AttachmentType;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export enum AttachmentType {
  EID = 'EID',
  DRIVING_LICENSE = 'Driving License',
  SIGNED_CERTIFICATE = 'Signed Certificate',
  USER_PHOTO = "USER_PHOTO"
}

export interface CreateCertificateRequest {
  certificate_number?: string;
  batch_id: number;
  name: string;
  nationality: string;
  eid_license: string;
  employer: string;
  training_name: string;
  training_date: string;
  issue_date: string;
  due_date: string;
  user_id?: number;
}

export interface UpdateCertificateRequest {
  name?: string;
  nationality?: string;
  eid_license?: string;
  employer?: string;
  training_name?: string;
  training_date?: string;
  issue_date?: string;
  due_date?: string;
  status?: CertificateStatus;
}

export interface ExportCertificateRequest {
  name: string
  nationality: string
  license: string
  employer: string
  course: string
  trainingDate: string
  certificateNo: string
  batchNo: string
  issueDate: string
  dueDate: string
  imagePath: string
  format: string
}