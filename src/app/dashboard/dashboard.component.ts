import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  kpiCards: KPICard[] = [
    {
      title: 'Total Certificates',
      value: 1248,
      icon: 'certificate',
      color: 'primary',
      route: '/dashboard/certificates'
    },
    {
      title: 'Active Certificates',
      value: 892,
      icon: 'verified',
      color: 'accent',
      route: '/dashboard/certificates'
    },
    {
      title: 'Expired Certificates',
      value: 156,
      icon: 'cancel',
      color: 'warn',
      route: '/dashboard/certificates'
    },
    {
      title: 'Expiring Soon',
      value: 43,
      icon: 'schedule',
      color: 'warn',
      route: '/dashboard/certificates'
    },
    {
      title: 'Total Batches',
      value: 89,
      icon: 'group_work',
      color: 'primary',
      route: '/dashboard/batches'
    },
    {
      title: 'Total Users',
      value: 24,
      icon: 'people',
      color: 'accent',
      route: '/dashboard/users'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

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