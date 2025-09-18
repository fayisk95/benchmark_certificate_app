import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'users',
        loadChildren: () => import('../user-management/user-management.module').then(m => m.UserManagementModule)
      },
      {
        path: 'access-control',
        loadChildren: () => import('../access-control/access-control.module').then(m => m.AccessControlModule)
      },
      {
        path: 'batches',
        loadChildren: () => import('../batch-management/batch-management.module').then(m => m.BatchManagementModule)
      },
      {
        path: 'certificates',
        loadChildren: () => import('../certificate/certificate.module').then(m => m.CertificateModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  }
];