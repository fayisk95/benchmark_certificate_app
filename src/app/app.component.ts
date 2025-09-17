import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    <div class="app-container">
      <div *ngIf="!isLoginPage">
        <mat-toolbar color="primary" class="app-toolbar">
          <button mat-icon-button (click)="toggleSidenav()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="app-title">Certificate Management System</span>
          <span class="spacer"></span>
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ currentUser?.name || 'User' }}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </mat-toolbar>

        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="over" class="app-sidenav">
            <mat-nav-list>
              <a mat-list-item routerLink="/dashboard" (click)="sidenav.close()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/batches" (click)="sidenav.close()">
                <mat-icon matListItemIcon>group</mat-icon>
                <span matListItemTitle>Batch Management</span>
              </a>
              <a mat-list-item routerLink="/certificates" (click)="sidenav.close()">
                <mat-icon matListItemIcon>card_membership</mat-icon>
                <span matListItemTitle>Certificates</span>
              </a>
              <a mat-list-item routerLink="/users" (click)="sidenav.close()" *ngIf="isAdmin">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>User Management</span>
              </a>
              <a mat-list-item routerLink="/access-control" (click)="sidenav.close()" *ngIf="isAdmin">
                <mat-icon matListItemIcon>security</mat-icon>
                <span matListItemTitle>Access Control</span>
              </a>
              <a mat-list-item routerLink="/settings" (click)="sidenav.close()" *ngIf="isAdmin">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Settings</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>

          <mat-sidenav-content>
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
      
      <router-outlet *ngIf="isLoginPage"></router-outlet>
    </div>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .app-title {
      font-size: 18px;
      font-weight: 300;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .sidenav-container {
      height: calc(100vh - 64px);
    }
    
    .app-sidenav {
      width: 250px;
    }
    
    .mat-mdc-list-item {
      margin-bottom: 4px;
    }
  `]
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  isLoginPage = false;
  currentUser = this.authService.currentUser;
  
  get isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = event.url === '/login';
    });
  }

  toggleSidenav() {
    // This will be handled by the sidenav reference
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}