import { Routes } from '@angular/router';

export const accessControlRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./permissions/permissions.component').then(m => m.PermissionsComponent)
  }
];