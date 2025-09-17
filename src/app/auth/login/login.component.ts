import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="logo">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: #0A1F44;">security</mat-icon>
          <h2>Certificate Management</h2>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline" color="accent">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" color="accent">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button mat-raised-button color="primary" type="submit" class="login-button" [disabled]="loginForm.invalid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20" style="margin-right: 8px;"></mat-spinner>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>

          <div class="forgot-password">
            <a href="#" (click)="$event.preventDefault()">Forgot Password?</a>
          </div>

          <div class="demo-credentials" style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 8px;"><strong>Demo Credentials:</strong></p>
            <p style="margin: 0; font-size: 12px; color: #888;">Email: admin@demo.com</p>
            <p style="margin: 0; font-size: 12px; color: #888;">Password: admin123</p>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-message {
      color: #f44336;
      font-size: 14px;
      text-align: center;
      margin: 16px 0;
      padding: 12px;
      background: #ffebee;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@demo.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      try {
        const success = await this.authService.login(email, password);
        
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password. Please try again.';
        }
      } catch (error) {
        this.errorMessage = 'An error occurred during login. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
}