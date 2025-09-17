import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSliderModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      // Certificate numbering
      certificateNumberFormat: ['FS-{YYYY}-{####}', Validators.required],
      certificateStartNumber: [1, [Validators.required, Validators.min(1)]],

      // Batch numbering
      batchNumberFormat: ['BTH-{YYYY}-{###}', Validators.required],
      batchStartNumber: [1, [Validators.required, Validators.min(1)]],

      // Expiry settings
      expiryWarningDays: [30, [Validators.required, Validators.min(1), Validators.max(365)]],

      // Dashboard preferences
      defaultDashboardView: ['cards', Validators.required],
      itemsPerPage: [20, [Validators.required, Validators.min(10), Validators.max(100)]],

      // Email notifications
      enableExpiryNotifications: [true],
      notificationEmail: ['admin@cms.com', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // In real app, load from service/API
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.settingsForm.patchValue(settings);
    }
  }
  generateSampleCertNumber() { } generateSampleBatchNumber() { }
  onSubmit(): void {
    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value;
      localStorage.setItem('appSettings', JSON.stringify(settings));
      // In real app, save to API
      console.log('Settings saved:', settings);
    }
  }

  resetToDefaults(): void {
    this.settingsForm.reset({
      certificateNumberFormat: 'FS-{YYYY}-{####}',
      certificateStartNumber: 1,
      batchNumberFormat: 'BTH-{YYYY}-{###}',
      batchStartNumber: 1,
      expiryWarningDays: 30,
      defaultDashboardView: 'cards',
      itemsPerPage: 20,
      enableExpiryNotifications: true,
      notificationEmail: 'admin@cms.com'
    });
  }
}