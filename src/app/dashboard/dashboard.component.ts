import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../core/services/dashboard.service';

interface KPICard {
  title: string;
  value: number;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  kpiCards: KPICard[] = [];
  loading = false;
  dashboardStats: DashboardStats | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.updateKpiCards(stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
        // Set default values on error
        this.setDefaultKpiCards();
      }
    });
  }

  private updateKpiCards(stats: DashboardStats): void {
    this.kpiCards = [
      {
        title: 'Total Certificates',
        value: stats.overview.totalCertificates,
        icon: 'certificate',
        color: 'primary',
        route: '/dashboard/certificates'
      },
      {
        title: 'Active Certificates',
        value: stats.overview.activeCertificates,
        icon: 'verified',
        color: 'accent',
        route: '/dashboard/certificates'
      },
      {
        title: 'Expired Certificates',
        value: stats.overview.expiredCertificates,
        icon: 'cancel',
        color: 'warn',
        route: '/dashboard/certificates'
      },
      {
        title: 'Expiring Soon',
        value: stats.overview.expiringSoonCertificates,
        icon: 'schedule',
        color: 'warn',
        route: '/dashboard/certificates'
      },
      {
        title: 'Total Batches',
        value: stats.overview.totalBatches,
        icon: 'group_work',
        color: 'primary',
        route: '/dashboard/batches'
      },
      {
        title: 'Total Users',
        value: stats.overview.totalUsers,
        icon: 'people',
        color: 'accent',
        route: '/dashboard/users'
      }
    ];
  }

  private setDefaultKpiCards(): void {
    this.kpiCards = [
      {
        title: 'Total Certificates',
        value: 0,
        icon: 'certificate',
        color: 'primary',
        route: '/dashboard/certificates'
      },
      {
        title: 'Active Certificates',
        value: 0,
        icon: 'verified',
        color: 'accent',
        route: '/dashboard/certificates'
      },
      {
        title: 'Expired Certificates',
        value: 0,
        icon: 'cancel',
        color: 'warn',
        route: '/dashboard/certificates'
      },
      {
        title: 'Expiring Soon',
        value: 0,
        icon: 'schedule',
        color: 'warn',
        route: '/dashboard/certificates'
      },
      {
        title: 'Total Batches',
        value: 0,
        icon: 'group_work',
        color: 'primary',
        route: '/dashboard/batches'
      },
      {
        title: 'Total Users',
        value: 0,
        icon: 'people',
        color: 'accent',
        route: '/dashboard/users'
      }
    ];
  }

  navigateToCard(route?: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  createNewCertificate(): void {
    this.router.navigate(['/dashboard/certificates/create']);
  }

  createNewBatch(): void {
    this.router.navigate(['/dashboard/batches/create']);
  }
}