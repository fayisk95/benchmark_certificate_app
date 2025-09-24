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

export enum CertificateStatus {
  Active = 'Active',
  Expired = 'Expired',
  ExpiringSoon = 'Expiring Soon'
}

export interface CertificateAttachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  url: string;
}

export enum AttachmentType {
  EID = 'EID',
  DrivingLicense = 'Driving License',
  SignedCertificate = 'Signed Certificate'
}

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