import { Routes } from '@angular/router';

export const batchRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./batch-list/batch-list.component').then(m => m.BatchListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./batch-form/batch-form.component').then(m => m.BatchFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./batch-form/batch-form.component').then(m => m.BatchFormComponent)
  }
];