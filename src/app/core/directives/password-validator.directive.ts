import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordValidatorDirective,
      multi: true
    }
  ]
})
export class PasswordValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;

    if (!value) {
      return { required: true };
    }

    const minLength = /.{6,}/;
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    const errors: ValidationErrors = {};

    if (!minLength.test(value)) {
      errors['minLength'] = 'Password must be at least 6 characters long.';
    }
    if (!uppercase.test(value)) {
      errors['uppercase'] = 'Password must contain at least one uppercase letter.';
    }
    if (!number.test(value)) {
      errors['number'] = 'Password must contain at least one number.';
    }
    if (!specialChar.test(value)) {
      errors['specialChar'] = 'Password must contain at least one special character.';
    }

    return Object.keys(errors).length ? errors : null;
  }
}
