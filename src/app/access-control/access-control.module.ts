import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { AccessControlComponent } from './components/access-control.component';

@NgModule({
  declarations: [
    AccessControlComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: AccessControlComponent }
    ]),
    // Material modules
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTabsModule
  ]
})
export class AccessControlModule { }