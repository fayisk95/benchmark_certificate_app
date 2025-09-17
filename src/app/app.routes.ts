import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadChildren: () => import('./user-management/user-management.routes').then(m => m.userRoutes),
        canActivate: [AdminGuard]
      },
      {
        path: 'access-control',
        loadChildren: () => import('./access-control/access-control.routes').then(m => m.accessControlRoutes),
        canActivate: [AdminGuard]
      },
      {
        path: 'batches',
        loadChildren: () => import('./batch-management/batch-management.routes').then(m => m.batchRoutes)
      },
      {
        path: 'certificates',
        loadChildren: () => import('./certificate/certificate.routes').then(m => m.certificateRoutes)
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes').then(m => m.settingsRoutes),
        canActivate: [AdminGuard]
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];