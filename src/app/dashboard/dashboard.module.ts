import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { DashboardComponent } from './dashboard.component';
import { dashboardRoutes } from './dashboard.routes';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ]
})
export class DashboardModule { }