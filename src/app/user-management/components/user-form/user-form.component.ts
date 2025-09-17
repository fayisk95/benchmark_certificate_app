import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isLoading = false;

  roles: UserRole[] = ['Admin', 'Supervisor', 'Instructor', 'Staff'];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Staff', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.loadUser();
      // Remove password requirement for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('confirmPassword')?.clearValidators();
    }
  }

  private loadUser() {
    if (this.userId) {
      const user = this.userService.getUserById(this.userId);
      if (user) {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
      }
    }
  }

  async onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.userForm.value;
        
        if (!this.isEditMode && formValue.password !== formValue.confirmPassword) {
          alert('Passwords do not match!');
          this.isLoading = false;
          return;
        }

        if (this.isEditMode && this.userId) {
          await this.userService.updateUser(this.userId, {
            name: formValue.name,
            email: formValue.email,
            role: formValue.role,
            isActive: formValue.isActive
          });
        } else {
          await this.userService.createUser({
            name: formValue.name,
            email: formValue.email,
            role: formValue.role,
            password: formValue.password
          });
        }

        this.router.navigate(['/users']);
      } catch (error) {
        alert('An error occurred while saving the user.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  get title(): string {
    return this.isEditMode ? 'Edit User' : 'Create New User';
  }
}