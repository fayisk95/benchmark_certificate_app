import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MiscellaneousRecord } from '../models/miscellaneous.model';

interface DialogData {
  isEdit: boolean;
  record?: MiscellaneousRecord;
  groupId: number;
}

@Component({
  standalone: false,
  selector: 'app-record-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Record' : 'Create New Record' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="recordForm" class="record-form">
        <div class="form-row">
          <mat-form-field class="half-width" appearance="outline">
            <mat-label>Record Code</mat-label>
            <input matInput formControlName="record_code" placeholder="Enter unique record code">
            <mat-hint>Unique identifier for this record</mat-hint>
            <mat-error *ngIf="recordForm.get('record_code')?.hasError('required')">
              Record code is required
            </mat-error>
          </mat-form-field>

          <mat-form-field class="half-width" appearance="outline">
            <mat-label>Record Name</mat-label>
            <input matInput formControlName="record_name" placeholder="Enter display name">
            <mat-error *ngIf="recordForm.get('record_name')?.hasError('required')">
              Record name is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Record Value</mat-label>
            <input matInput formControlName="record_value" placeholder="Enter optional value">
            <mat-hint>Optional value associated with this record</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" 
                     placeholder="Enter optional description"></textarea>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="half-width" appearance="outline">
            <mat-label>Sort Order</mat-label>
            <input matInput type="number" formControlName="sort_order" 
                   placeholder="Enter sort order" min="0">
            <mat-hint>Optional ordering for display</mat-hint>
          </mat-form-field>

          <div class="half-width status-toggle">
            <mat-slide-toggle formControlName="is_active" color="accent">
              Record is active
            </mat-slide-toggle>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="recordForm.invalid">
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .record-form {
      min-width: 500px;
      padding: 16px 0;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
      
      .full-width {
        flex: 1;
      }
      
      .half-width {
        flex: 1;
      }
      
      .status-toggle {
        display: flex;
        align-items: center;
        padding-top: 16px;
      }
    }
    
    .mat-mdc-form-field {
      margin-bottom: 4px;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    .mat-mdc-slide-toggle {
      .mdc-form-field {
        font-family: 'Inter', sans-serif !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        color: var(--text-color) !important;
      }
    }
    
    @media (max-width: 600px) {
      .record-form {
        min-width: auto;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
        
        .status-toggle {
          padding-top: 8px;
        }
      }
    }
  `]
})
export class RecordFormDialogComponent implements OnInit {
  recordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecordFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.recordForm = this.fb.group({
      record_code: ['', [Validators.required, Validators.minLength(1)]],
      record_name: ['', [Validators.required, Validators.minLength(1)]],
      record_value: [''],
      description: [''],
      sort_order: [0, [Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.record) {
      this.recordForm.patchValue({
        record_code: this.data.record.record_code,
        record_name: this.data.record.record_name,
        record_value: this.data.record.record_value || '',
        description: this.data.record.description || '',
        sort_order: this.data.record.sort_order || 0,
        is_active: this.data.record.is_active
      });
    }
  }

  onSave(): void {
    if (this.recordForm.valid) {
      this.dialogRef.close(this.recordForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}