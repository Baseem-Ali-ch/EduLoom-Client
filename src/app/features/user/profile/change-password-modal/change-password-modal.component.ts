import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.css',
})
export class ChangePasswordModalComponent implements OnInit {
  constructor(private _fb: FormBuilder) {}

  @Input() isPasswordOpen = false;
  @Input() userData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  passwordForm!: FormGroup;
  showPassword: boolean = false;
  passwordFormValues: any = {};

  ngOnInit(): void {
    this.form();
    this.passwordFormValues = this.passwordForm.value;
  }

  // password change form
  form(): void {
    this.passwordForm = this._fb.group(
      {
        currentPassword: ['', [Validators.minLength(6), Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)]],
        newPassword: ['', [Validators.minLength(6), Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.matchPassword }
    );
  }

  // password match function
  matchPassword(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { misMatch: true };
  }

  // show and hide password handling
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // submit
  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.save.emit(this.passwordForm.value);
    }
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.passwordForm.value) !== JSON.stringify(this.passwordFormValues);
  }

  onClose(): void {
    if (this.hasUnsavedChanges()) {
      Swal.fire({
        icon: 'warning',
        text: 'You have unsaved changes. Are you sure you want to close?',
        toast: true,
        position: 'top-end',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        background: 'rgb(8, 10, 24)',
        color: 'white',
      }).then((result) => {
        if (result.isConfirmed) {
          this.close.emit();
        }
      });
    } else {
      this.close.emit();
    }
  }
}
