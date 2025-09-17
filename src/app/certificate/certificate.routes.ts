import { Routes } from '@angular/router';

export const certificateRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./certificate-list/certificate-list.component').then(m => m.CertificateListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./certificate-form/certificate-form.component').then(m => m.CertificateFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./certificate-form/certificate-form.component').then(m => m.CertificateFormComponent)
  }
];