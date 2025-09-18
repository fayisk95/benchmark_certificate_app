import { Routes } from '@angular/router';

export const batchRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/batch-list/batch-list.component').then(m => m.BatchListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/batch-form/batch-form.component').then(m => m.BatchFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/batch-form/batch-form.component').then(m => m.BatchFormComponent)
  }
];