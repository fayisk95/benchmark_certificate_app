import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificateService } from '../../core/services/certificate.service';
import { BatchService } from '../../core/services/batch.service';
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest } from '../../shared/models/certificate.model';
import { Batch } from '../../shared/models/batch.model';
import { AuthService } from '../../shared/services/auth.service';
import { MiscellaneousGroup } from '../../miscellaneous/models/miscellaneous.model';
import { MiscellaneousService } from '../../miscellaneous/services/miscellaneous.service';
import { StorageService } from '../../shared/services/storage.service';
import { AttachmentType } from '../../shared/models/certificate.model';

@Component({
  standalone: false,
  selector: 'app-certificate-form',
  templateUrl: './certificate-form.component.html',
  styleUrls: ['./certificate-form.component.scss']
})
export class CertificateFormComponent implements OnInit {
  certificateForm: FormGroup;
  isEdit = false;
  certificateId: string | null = null;
  batches: Batch[] = [];
  isLoading = false;
  uploadingFiles = false;
  trainingPrograms: MiscellaneousGroup[] = [];

  // File upload properties
  selectedFiles: { [key: string]: File | null } = {
    photo: null,
    eid: null,
    license: null,
    signed: null
  };

  filePreviewUrls: { [key: string]: string | null } = {
    photo: null,
    eid: null,
    license: null,
    signed: null
  };

  AttachmentType = AttachmentType;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  allowedDocumentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  sub1$: any;
  sub2$: any;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private batchService: BatchService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private storageSvc: StorageService
  ) {
    storageSvc.loadCertTrainings(); // Ensure trainings are loaded

    this.certificateForm = this.fb.group({
      batch_id: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      nationality: ['', Validators.required],
      eid_license: ['', Validators.required],
      employer: ['', Validators.required],
      training_name: ['', Validators.required],
      training_date: ['', Validators.required],
      issue_date: ['', Validators.required],
      due_date: ['', Validators.required],
      certificate_number: [''] // Optional for manual override
    });

    this.sub2$ = this.certificateForm.get('batch_id')?.valueChanges.subscribe(batchId => {
      const selectedBatch = this.batches.find(b => b.id === batchId);
      if (selectedBatch) {
        this.certificateForm.patchValue({
          training_name: this.storageSvc.getCertTrainingNameById(selectedBatch.training_code) || '',
          employer: selectedBatch.company_name
        });
        console.log('Selected Batch:', selectedBatch);
      }
    });
  }

  ngOnInit(): void {
    this.certificateId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.certificateId;
    this.loadBatches();

    if (this.isEdit) {
      this.loadCertificate();
    }
  }

  loadBatches(): void {
    this.batchService.loadBatches().subscribe({
      next: (response) => {
        this.batches = response.batches;
      },
      error: (error) => {
        console.error('Error loading batches:', error);
      }
    });
  }

  loadCertificate(): void {
    if (this.certificateId) {
      this.certificateService.getCertificateByIdFromApi(this.certificateId).subscribe({
        next: (certificate) => {
          this.certificateForm.patchValue({
            batch_id: certificate.batch_id,
            name: certificate.name,
            nationality: certificate.nationality,
            eid_license: certificate.eid_license,
            employer: certificate.employer,
            training_name: certificate.training_name,
            training_date: certificate.training_date,
            issue_date: certificate.issue_date,
            due_date: certificate.due_date,
            certificate_number: certificate.certificate_number
          });
        },
        error: (error) => {
          console.error('Error loading certificate:', error);
          this.router.navigate(['/dashboard/certificates']);
        }
      });
    }
  }

  onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type based on upload type
      const allowedTypes = fileType === 'photo' ? this.allowedImageTypes : this.allowedDocumentTypes;
      if (!allowedTypes.includes(file.type)) {
        const typeMessage = fileType === 'photo'
          ? 'Please select a valid image file (JPEG, JPG, PNG)'
          : 'Please select a valid file type (JPEG, JPG, PNG, or PDF)';
        alert(typeMessage);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > this.maxFileSize) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFiles[fileType] = file;

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreviewUrls[fileType] = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreviewUrls[fileType] = null;
      }
    }
  }

  removeFile(fileType: string): void {
    this.selectedFiles[fileType] = null;
    this.filePreviewUrls[fileType] = null;

    // Reset the file input
    const input = document.getElementById(`${fileType}-input`) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  getFileName(fileType: string): string {
    return this.selectedFiles[fileType]?.name || '';
  }

  getFileSize(fileType: string): string {
    const file = this.selectedFiles[fileType];
    if (!file) return '';

    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  hasFile(fileType: string): boolean {
    return !!this.selectedFiles[fileType];
  }

  private async uploadAttachments(certificateId: string): Promise<boolean> {
    if (!this.hasAnyFiles()) {
      return true; // No files to upload
    }

    this.uploadingFiles = true;
    const uploadPromises: Promise<any>[] = [];

    // Upload each selected file
    Object.keys(this.selectedFiles).forEach(fileType => {
      const file = this.selectedFiles[fileType];
      if (file) {
        let attachmentType: string;
        switch (fileType) {
          case 'photo':
            attachmentType = AttachmentType.USER_PHOTO;
            break;
          case 'eid':
            attachmentType = AttachmentType.EID;
            break;
          case 'license':
            attachmentType = AttachmentType.DRIVING_LICENSE;
            break;
          case 'signed':
            attachmentType = AttachmentType.SIGNED_CERTIFICATE;
            break;
          default:
            return;
        }

        const uploadPromise = this.certificateService.uploadAttachment(
          certificateId,
          file,
          attachmentType
        ).toPromise();
        uploadPromises.push(uploadPromise);
      }
    });

    try {
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }
      this.uploadingFiles = false;
      return true;
    } catch (error) {
      console.error('Error uploading attachments:', error);
      this.uploadingFiles = false;
      return false;
    }
  }

  private hasAnyFiles(): boolean {
    return Object.values(this.selectedFiles).some(file => file !== null);
  }

  private validateMandatoryUploads(): boolean {
    if (!this.selectedFiles['photo']) {
      alert('Person photo is required. Please upload a photo before submitting.');
      return false;
    }
    return true;
  }

  onSubmit(): void {
    // Validate mandatory uploads
    if (!this.validateMandatoryUploads()) {
      return;
    }

    if (this.certificateForm.valid) {
      this.isLoading = true;

      const formData = this.certificateForm.value;

      if (this.isEdit && this.certificateId) {
        const updateRequest: UpdateCertificateRequest = {
          name: formData.name,
          nationality: formData.nationality,
          eid_license: formData.eid_license,
          employer: formData.employer,
          training_name: formData.training_name,
          training_date: formData.training_date,
          issue_date: formData.issue_date,
          due_date: formData.due_date
        };

        this.certificateService.updateCertificate(this.certificateId, updateRequest).subscribe({
          next: async (certificate) => {
            // Upload new attachments if any
            const uploadSuccess = await this.uploadAttachments(certificate.id.toString());
            if (uploadSuccess) {
              this.router.navigate(['/dashboard/certificates']);
            } else {
              alert('Certificate updated but some files failed to upload. Please try uploading them again.');
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error('Error updating certificate:', error);
            alert('Error updating certificate. Please try again.');
            this.isLoading = false;
          }
        });
      } else {
        const createRequest: CreateCertificateRequest = {
          batch_id: formData.batch_id,
          name: formData.name,
          nationality: formData.nationality,
          eid_license: formData.eid_license,
          employer: formData.employer,
          training_name: formData.training_name,
          training_date: formData.training_date,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          user_id: this.authService.getCurrentUser()?.id
        };

        if (formData.certificate_number) {
          createRequest.certificate_number = formData.certificate_number;
        }

        this.certificateService.createCertificate(createRequest).subscribe({
          next: async (certificate) => {
            // Upload attachments
            const uploadSuccess = await this.uploadAttachments(certificate.id.toString());
            if (uploadSuccess) {
              this.router.navigate(['/dashboard/certificates']);
            } else {
              alert('Certificate created but some files failed to upload. You can upload them later from the certificate list.');
              this.router.navigate(['/dashboard/certificates']);
            }
          },
          error: (error) => {
            console.error('Error creating certificate:', error);
            alert('Error creating certificate. Please try again.');
            this.isLoading = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.certificateForm.controls).forEach(key => {
        this.certificateForm.get(key)?.markAsTouched();
      });
    }
  }
  selectFile(id: string): void {
    const input = document.getElementById(id);
    input?.click();
  }
  cancel(): void {
    this.router.navigate(['/dashboard/certificates']);
  }
}