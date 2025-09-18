import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { PermissionsService } from '../shared/services/permissions.service';
import { User, UserRole } from '../shared/models/user.model';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  standalone: false,
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  sidenavOpened = true;

  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard', permission: 'dashboard-access' },
    { name: 'Users', icon: 'people', route: '/dashboard/users', permission: 'manage-users' },
    { name: 'Access Control', icon: 'security', route: '/dashboard/access-control', permission: 'manage-users' },
    { name: 'Batches', icon: 'group_work', route: '/dashboard/batches', permission: 'manage-batches' },
    { name: 'Certificates', icon: 'certificate', route: '/dashboard/certificates', permission: 'issue-certificates' },
    { name: 'Settings', icon: 'settings', route: '/dashboard/settings', permission: 'manage-users' }
  ];

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.currentUser = this.authService.getCurrentUser();
  }

  hasPermission(permission?: string): boolean {
    if (!permission || !this.currentUser) return true;
    return this.permissionsService.hasPermission(this.currentUser.role, permission);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}