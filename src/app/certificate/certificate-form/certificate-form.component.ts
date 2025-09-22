import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificateService } from '../../core/services/certificate.service';
import { BatchService } from '../../core/services/batch.service';
import { Certificate, CertificateStatus } from '../../core/models/certificate.model';
import { Batch } from '../../core/models/batch.model';

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
    private route: ActivatedRoute
  ) {
    this.certificateForm = this.fb.group({
      batchId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      nationality: ['', Validators.required],
      eidLicense: ['', Validators.required],
      employer: ['', Validators.required],
      trainingName: ['', Validators.required],
      trainingDate: ['', Validators.required],
      issueDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      certificateNumber: [''] // Optional for manual override
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
            batchId: certificate.batchId,
            name: certificate.name,
            nationality: certificate.nationality,
            eidLicense: certificate.eidLicense,
            employer: certificate.employer,
            trainingName: certificate.trainingName,
            trainingDate: certificate.trainingDate,
            issueDate: certificate.issueDate,
            dueDate: certificate.dueDate,
            certificateNumber: certificate.certificateNumber
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

      const saveOperation = this.isEdit && this.certificateId
        ? this.certificateService.updateCertificate(this.certificateId, formData)
        : this.certificateService.createCertificate(formData);

      saveOperation.subscribe({
        next: () => {
          this.router.navigate(['/dashboard/certificates']);
        },
        error: (error) => {
          console.error('Error saving certificate:', error);
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/certificates']);
  }
}