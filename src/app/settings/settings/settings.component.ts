import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, AppSettings } from '../../core/services/settings.service';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
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
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (response) => {
        this.populateFormFromSettings(response.settings);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.loading = false;
      }
    });
  }

  private populateFormFromSettings(settings: AppSettings): void {
    this.settingsForm.patchValue({
      certificateNumberFormat: settings['certificate_number_format']?.value || 'FS-{YYYY}-{####}',
      certificateStartNumber: parseInt(settings['certificate_start_number']?.value || '1'),
      batchNumberFormat: settings['batch_number_format']?.value || 'BTH-{YYYY}-{###}',
      batchStartNumber: parseInt(settings['batch_start_number']?.value || '1'),
      expiryWarningDays: parseInt(settings['expiry_warning_days']?.value || '30'),
      defaultDashboardView: 'cards',
      itemsPerPage: 20,
      enableExpiryNotifications: true,
      notificationEmail: settings['notification_email']?.value || 'admin@cms.com'
    });
  }

  generateSampleCertNumber(): string {
    const format = this.settingsForm.get('certificateNumberFormat')?.value || 'FS-{YYYY}-{####}';
    const year = new Date().getFullYear();
    const number = this.settingsForm.get('certificateStartNumber')?.value || 1;
    return format
      .replace('{YYYY}', year.toString())
      .replace('{####}', String(number).padStart(4, '0'));
  }

  generateSampleBatchNumber(): string {
    const format = this.settingsForm.get('batchNumberFormat')?.value || 'BTH-{YYYY}-{###}';
    const year = new Date().getFullYear();
    const number = this.settingsForm.get('batchStartNumber')?.value || 1;
    return format
      .replace('{YYYY}', year.toString())
      .replace('{###}', String(number).padStart(3, '0'));
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.saving = true;
      const formValues = this.settingsForm.value;
      
      // Map form values to API format
      const settingsToSave = {
        certificate_number_format: formValues.certificateNumberFormat,
        certificate_start_number: formValues.certificateStartNumber.toString(),
        batch_number_format: formValues.batchNumberFormat,
        batch_start_number: formValues.batchStartNumber.toString(),
        expiry_warning_days: formValues.expiryWarningDays.toString(),
        notification_email: formValues.notificationEmail
      };

      this.settingsService.updateSettings(settingsToSave).subscribe({
        next: (response) => {
          console.log('Settings saved successfully');
          this.saving = false;
          // Show success message
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.saving = false;
          // Show error message
        }
      });
    }
  }

  resetToDefaults(): void {
    this.settingsService.resetSettings().subscribe({
      next: (response) => {
        this.populateFormFromSettings(response.settings);
        console.log('Settings reset to defaults');
      },
      error: (error) => {
        console.error('Error resetting settings:', error);
      }
    });
  }
}