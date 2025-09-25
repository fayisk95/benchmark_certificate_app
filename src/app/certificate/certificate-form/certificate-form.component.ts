import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificateService } from '../../core/services/certificate.service';
import { BatchService } from '../../core/services/batch.service';
import { Certificate, CreateCertificateRequest, UpdateCertificateRequest } from '../../shared/models/certificate.model';
import { Batch } from '../../shared/models/batch.model';
import { AuthService } from '../../shared/services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private batchService: BatchService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
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

  onSubmit(): void {
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
          due_date: formData.due_date,
          // Ensure user_id is not updated
        };

        this.certificateService.updateCertificate(this.certificateId, updateRequest).subscribe({
          next: () => {
            this.router.navigate(['/dashboard/certificates']);
          },
          error: (error) => {
            console.error('Error updating certificate:', error);
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
          next: () => {
            this.router.navigate(['/dashboard/certificates']);
          },
          error: (error) => {
            console.error('Error creating certificate:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/certificates']);
  }
}