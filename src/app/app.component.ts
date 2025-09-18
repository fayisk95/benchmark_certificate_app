import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet ></router-outlet>
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