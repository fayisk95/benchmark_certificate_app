export interface Certificate {
  id: string;
  certificateNumber: string;
  batchId: string;
  name: string;
  nationality: string;
  eidLicense: string;
  employer: string;
  trainingName: string;
  trainingDate: Date;
  issueDate: Date;
  dueDate: Date;
  status: CertificateStatus;
  attachments?: CertificateAttachment[];
  createdAt: Date;
}

export enum CertificateStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  EXPIRING_SOON = 'Expiring Soon'
}

export interface CertificateAttachment {
  id: string;
  certificateId: string;
  fileName: string;
  fileType: AttachmentType;
  fileUrl: string;
  uploadedAt: Date;
}

export enum AttachmentType {
  EID = 'EID',
  DRIVING_LICENSE = 'Driving License',
  SIGNED_CERTIFICATE = 'Signed Certificate'
}