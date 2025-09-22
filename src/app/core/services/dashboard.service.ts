import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  overview: {
    totalCertificates: number;
    activeCertificates: number;
    expiredCertificates: number;
    expiringSoonCertificates: number;
    totalBatches: number;
    totalUsers: number;
  };
  recentActivity: {
    certificates: Array<{
      certificate_number: string;
      name: string;
      created_at: string;
      company_name: string;
    }>;
    batches: Array<{
      batch_number: string;
      company_name: string;
      number_of_participants: number;
      created_at: string;
      instructor_name: string;
    }>;
  };
  alerts: {
    expiringCertificates: Array<{
      certificate_number: string;
      name: string;
      due_date: string;
      company_name: string;
    }>;
  };
  trends: {
    monthly: Array<{
      month: string;
      certificates_issued: number;
    }>;
  };
  distribution: {
    batchTypes: Array<{
      batch_type: string;
      count: number;
    }>;
    certificateTypes: Array<{
      certificate_type: string;
      count: number;
    }>;
  };
}

export interface UserStats {
  user: {
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  userSpecific: {
    myBatches?: number;
    myCertificates?: number;
    recentBatches?: Array<{
      batch_number: string;
      company_name: string;
      number_of_participants: number;
      created_at: string;
    }>;
  };
}

export interface HealthMetrics {
  database: {
    status: string;
    size: {
      size_mb: number;
    };
    tables: Array<{
      table_name: string;
      table_rows: number;
    }>;
  };
  server: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('/dashboard/stats');
  }

  getUserStats(): Observable<UserStats> {
    return this.apiService.get<UserStats>('/dashboard/user-stats');
  }

  getHealthMetrics(): Observable<HealthMetrics> {
    return this.apiService.get<HealthMetrics>('/dashboard/health');
  }
}