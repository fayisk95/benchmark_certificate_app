export interface Certificate {
  id: string;
  certificateNumber: string;
  batchId: string;
  batchNumber: string;
  name: string;
  nationality: string;
  eidLicense: string;
  employer: string;
  trainingName: string;
  trainingDate: Date;
  issueDate: Date;
  dueDate: Date;
  status: CertificateStatus;
  attachments: CertificateAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export type CertificateStatus = 'Active' | 'Expired' | 'Expiring Soon';

export interface CertificateAttachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  url: string;
}

export type AttachmentType = 'EID' | 'Driving License' | 'Signed Certificate';

export interface CreateCertificateRequest {
  batchId: string;
  name: string;
  nationality: string;
  eidLicense: string;
  employer: string;
  trainingName: string;
  trainingDate: Date;
  issueDate: Date;
  dueDate: Date;
  certificateNumber?: string; // Optional for manual override
}