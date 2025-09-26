import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MiscellaneousGroup } from '../models/miscellaneous.model';

interface DialogData {
  isEdit: boolean;
  record?: MiscellaneousGroup;
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
            <mat-label>Misc Code</mat-label>
            <input matInput formControlName="misc_code" placeholder="Enter unique misc code">
            <mat-hint>Unique identifier for this misc</mat-hint>
            <mat-error *ngIf="recordForm.get('misc_code')?.hasError('required')">
              Misc code is required
            </mat-error>
          </mat-form-field>

          <mat-form-field class="half-width" appearance="outline">
            <mat-label>Miscellaneous Name</mat-label>
            <input matInput formControlName="misc_name" placeholder="Enter display name">
            <mat-error *ngIf="recordForm.get('misc_name')?.hasError('required')">
              Miscellaneous name is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Miscellaneous Group</mat-label>
            <input matInput formControlName="misc_group_name" placeholder="Enter optional group">
            <mat-hint>Optional group associated with this misc</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" 
                     placeholder="Enter optional description"></textarea>
          </mat-form-field>
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
      misc_code: ['', [Validators.required, Validators.minLength(1)]],
      misc_name: ['', [Validators.required, Validators.minLength(1)]],
      misc_group_name: [{ value: '', disabled: true }],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.record) {
      this.recordForm.patchValue({
        misc_code: this.data.record.misc_code,
        misc_name: this.data.record.misc_name,
        misc_group_name: this.data.record.misc_group_name || '',
        description: this.data.record.misc_description || ''
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