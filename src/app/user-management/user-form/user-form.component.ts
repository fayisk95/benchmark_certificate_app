import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserRole, CreateUserRequest, UpdateUserRequest } from '../../shared/models/user.model';
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
      user_code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.STAFF, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;

    if (this.isEdit) {
      this.loadUser();
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  loadUser(): void {
    if (this.userId) {
      this.userService.getUserByIdFromApi(this.userId).subscribe({
        next: (user) => {
          console.log('Loaded user:', user);
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            user_code: user.user_code,
            is_active: user.is_active
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
          this.userForm.get('confirmPassword')?.setErrors({ mismatch: true });
          this.loading = false;
          return;
        }

        const createRequest: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active
        };

        this.userService.createUser(createRequest).subscribe({
          next: () => {
            this.router.navigate(['/dashboard/users']);
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.loading = false;
            if (error.message && error.message.includes('Email already exists')) {
              this.userForm.get('email')?.setErrors({ emailExists: true });
            }
          }
        });
      } else if (this.userId) {
        const updateRequest: UpdateUserRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        };

        this.userService.updateUser(this.userId, updateRequest).subscribe({
          next: () => {
            this.router.navigate(['/dashboard/users']);
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.loading = false;
            if (error.message && error.message.includes('Email already exists')) {
              this.userForm.get('email')?.setErrors({ emailExists: true });
            }
          }
        });
      }
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