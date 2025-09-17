import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserRole } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: string | null = null;
  userRoles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.STAFF, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;
    
    if (this.isEdit) {
      this.loadUser();
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
    }
  }

  loadUser(): void {
    // In real app, load user from service
    // For demo, populate with sample data
    if (this.userId === '2') {
      this.userForm.patchValue({
        name: 'John Supervisor',
        email: 'supervisor@cms.com',
        role: UserRole.SUPERVISOR,
        isActive: true
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      if (!this.isEdit) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          return;
        }
      }

      // In real app, call API to save user
      console.log('Saving user:', formData);
      
      this.router.navigate(['/dashboard/users']);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }
}