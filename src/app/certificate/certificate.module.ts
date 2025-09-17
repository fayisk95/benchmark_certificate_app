import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

import { CertificateListComponent } from './components/certificate-list/certificate-list.component';
import { CertificateFormComponent } from './components/certificate-form/certificate-form.component';
import { CertificatePreviewComponent } from './components/certificate-preview/certificate-preview.component';

@NgModule({
  declarations: [
    CertificateListComponent,
    CertificateFormComponent,
    CertificatePreviewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: CertificateListComponent },
      { path: 'create', component: CertificateFormComponent },
      { path: 'edit/:id', component: CertificateFormComponent },
      { path: 'preview/:id', component: CertificatePreviewComponent }
    ]),
    // Material modules
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule
  ]
})
export class CertificateModule { }