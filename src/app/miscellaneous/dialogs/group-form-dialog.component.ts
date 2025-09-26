import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MiscellaneousGroup } from '../models/miscellaneous.model';

interface DialogData {
  isEdit: boolean;
  group?: MiscellaneousGroup;
}

@Component({
  standalone: false,
  selector: 'app-group-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Group' : 'Create New Group' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="groupForm" class="group-form">
        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Group Code</mat-label>
            <input matInput formControlName="group_code" placeholder="Enter group code">
            <mat-hint>Category code for grouping</mat-hint>
            <mat-error *ngIf="groupForm.get('group_code')?.hasError('required')">
              Group code is required
            </mat-error>
          </mat-form-field>
 </div>
        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Group Name</mat-label>
            <input matInput formControlName="group_name" placeholder="Enter display name">
            <mat-error *ngIf="groupForm.get('group_name')?.hasError('required')">
              Group name is required
            </mat-error>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Misc Code </mat-label>
            <input matInput formControlName="code" placeholder="Enter unique code">
            <mat-hint>Unique identifier for this Data</mat-hint>
            <mat-error *ngIf="groupForm.get('code')?.hasError('required')">
              Code is required
            </mat-error>
          </mat-form-field> </div>
        <div class="form-row">
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Misc Name </mat-label>
            <input matInput formControlName="name" placeholder="Enter unique name">
            <mat-hint>Unique identifier for this Data</mat-hint>
            <mat-error *ngIf="groupForm.get('code')?.hasError('required')">
              Code is required
            </mat-error>
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
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="groupForm.invalid">
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .group-form {
      min-width: 500px;
      padding: 16px 0;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      
      .full-width {
        flex: 1;
      }
      
      .half-width {
        flex: 1;
      }
    }
    
    .mat-mdc-form-field {
      margin-bottom: 4px;
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    @media (max-width: 600px) {
      .group-form {
        min-width: auto;
      }
      
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class GroupFormDialogComponent implements OnInit {
  groupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GroupFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.groupForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(1)]],
      group_code: ['', [Validators.required, Validators.minLength(1)]],
      group_name: ['', [Validators.required, Validators.minLength(1)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.group) {
      this.groupForm.patchValue({
        code: this.data.group.misc_code,
        name: this.data.group.misc_name,
        group_code: this.data.group.misc_group_code,
        group_name: this.data.group.misc_group_name,
        description: this.data.group.misc_description || ''
      });
    }
  }

  onSave(): void {
    if (this.groupForm.valid) {
      this.dialogRef.close(this.groupForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}