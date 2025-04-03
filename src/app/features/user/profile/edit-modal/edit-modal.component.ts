import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css',
})
export class EditModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() userData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  updateProfileForm!: FormGroup;
  initialFormValues: any = {};

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form();
  }

  ngOnChanges() {
    if (this.userData) {
      this.updateProfileForm.patchValue({
        userName: this.userData.userName,
        phone: this.userData.phone,
      });
      this.initialFormValues = { ...this.updateProfileForm.value };
    }
  }

  // update user details form
  form(): void {
    this.updateProfileForm = this._fb.group({
      userName: ['', [Validators.minLength(5)]],
      phone: ['', [Validators.minLength(10), Validators.maxLength(10)]],
    });
  }

  // submit the form
  onSubmit(): void {
    if (this.updateProfileForm.valid) {
      if (JSON.stringify(this.updateProfileForm.value) !== JSON.stringify(this.initialFormValues)) {
        // ensure form values are changed
        this.save.emit(this.updateProfileForm.value); // emit the updated values
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No Changes made!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
      }
    }
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.updateProfileForm.value) !== JSON.stringify(this.initialFormValues);
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
