import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-edit-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './edit-modal.component.html',
    styleUrl: './edit-modal.component.css'
})
export class EditModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() instructorData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  updateProfileForm!: FormGroup;

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form()
  }

  // update profile form
  form(): void {
    this.updateProfileForm = this._fb.group({
      userName: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      place: ['', [Validators.required]],
      state: ['', [Validators.required]],
      qualification: ['', [Validators.required]],
      workExperience: ['', [Validators.required]],
      specialization: ['', [Validators.required]],
    });
  }

  ngOnChanges() {
    if (this.instructorData) {
      this.updateProfileForm.patchValue({
        userName: this.instructorData.userName,
        phone: this.instructorData.phone,
        state: this.instructorData.state,
        qualification: this.instructorData.qualification,
        place: this.instructorData.place,
        workExperience: this.instructorData.workExperience,
        specialization: this.instructorData.specialization,
      });
    }
  }

  // submit the updated form details
  onSubmit(): void {
    if (this.updateProfileForm.valid) {
      console.log('update profle', this.updateProfileForm);
      this.save.emit(this.updateProfileForm.value);
    } else {
      console.log('invalid form');
    }
  }
}
