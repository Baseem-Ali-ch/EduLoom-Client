import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Country, ICountry, IState, State } from 'country-state-city';

@Component({
  selector: 'app-instructor-req',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './instructor-req.component.html',
  styleUrl: './instructor-req.component.css',
})
export class InstructorReqComponent implements OnInit {
  @Input() isInstructorOpen = false;
  @Input() instructorData: any = {};
  @Output() instructorClose = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  instructorDetailsForm!: FormGroup;
  email: string = '';
  formValues: any = {};
  countries: ICountry[] = [];
  states: IState[] = [];
  experienceOptions: number[] = [];
  specializationOptions: string[] = [];

  constructor(private _fb: FormBuilder) {
    // this.countries = Country.getCountries()
  }

  ngOnInit(): void {
    this.form();
    this.formValues = this.instructorDetailsForm.value;
    this.countries = Country.getAllCountries();
    this.experienceOptions = Array.from({ length: 21 }, (_, i) => i);
    this.specializations();
  }

  specializations(): void {
    this.specializationOptions = ['Computer Science', 'Data Science', 'Artificial Intelligence', 'Cyber Security', 'Software Engineering', 'Web Development', 'Cloud Computing', 'Machine Learning', 'Mobile App Development'];
  }

  // become an instructor form
  form(): void {
    this.instructorDetailsForm = this._fb.group({
      userName: ['', [Validators.required, Validators.minLength(5)]],
      // email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      qualification: ['', [Validators.required]],
      workExperience: ['', [Validators.required]],
      lastWorkingPlace: ['', [Validators.required]],
      specialization: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.instructorDetailsForm.valid) {
      console.log('form', this.instructorDetailsForm.value);
      
      this.save.emit(this.instructorDetailsForm.value);
    }
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.instructorDetailsForm.value) !== JSON.stringify(this.formValues);
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
          this.instructorClose.emit();
        }
      });
    } else {
      this.instructorClose.emit();
    }
  }

  // Component
  onCountryChange(countryCode: string) {
    if (countryCode) {
      this.states = State.getStatesOfCountry(countryCode);
      this.instructorDetailsForm.patchValue({ state: '' });
    } else {
      this.states = [];
    }
  }
}
