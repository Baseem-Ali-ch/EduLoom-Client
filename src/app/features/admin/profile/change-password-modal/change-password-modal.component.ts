import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-change-password-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './change-password-modal.component.html',
    styleUrl: './change-password-modal.component.css'
})
export class ChangePasswordModalComponent implements OnInit {
  constructor(private _fb: FormBuilder) {}

  @Input() isPasswordOpen = false;
  @Input() userData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  passwordForm!: FormGroup;
  showPassword: boolean = false;

  ngOnInit(): void {
    this.form()
  }

  // change password form
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
}
