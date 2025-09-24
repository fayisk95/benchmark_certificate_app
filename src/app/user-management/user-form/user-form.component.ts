import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserRole } from '../../shared/models/user.model';
import { UserService } from '../services/user.service';

@Component({
  standalone: false,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: string | null = null;
  userRoles = Object.values(UserRole);
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
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
    if (this.userId) {
      this.userService.getUserByIdFromApi(this.userId).subscribe({
        next: (user) => {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.is_active
          });
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.router.navigate(['/dashboard/users']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formData = this.userForm.value;

      if (!this.isEdit) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          return;
        }
      }

      const saveOperation = this.isEdit && this.userId
        ? this.userService.updateUser(this.userId, formData)
        : this.userService.createUser(formData);

      saveOperation.subscribe({
        next: () => {
          this.router.navigate(['/dashboard/users']);
        },
        error: (error) => {
          console.error('Error saving user:', error);
          this.loading = false;
          // Handle specific error cases
          if (error.message && error.message.includes('Email already exists')) {
            this.userForm.get('email')?.setErrors({ emailExists: true });
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }
}