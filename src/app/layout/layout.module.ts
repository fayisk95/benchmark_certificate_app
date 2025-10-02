import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { LayoutComponent } from './layout.component';
import { layoutRoutes } from './layout.routes';
import { LoadingComponent } from '../shared/components/loading/loading.component';
import { NotificationComponent } from '../shared/components/notification/notification.component';

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(layoutRoutes),
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    LoadingComponent,
    NotificationComponent
  ]
})
export class LayoutModule { }