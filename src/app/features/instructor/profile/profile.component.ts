import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/instructor/profile.service';
import Swal from 'sweetalert2';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { Subscription } from 'rxjs';
import { IInstructor } from '../../../core/models/Instructor';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [EditModalComponent, CommonModule, InstructorSidebarComponent, ChangePasswordComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  instructor!: IInstructor;
  isModalOpen: boolean = false;
  isInstructorModalOpen: boolean = false;
  isChangePasswordModalOpen: boolean = false;
  private _subscription: Subscription = new Subscription();
  profilePhoto: string = '';

  constructor(private _profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadInstructorData();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // display the user details
  loadInstructorData() {
    const loadInstructorDataSubscription = this._profileService.getInstructor().subscribe({
      next: (response: any) => {
        this.instructor = response.instructor;
        this.getImage();
      },
      error: (error) => {
        // console.error('Error loading user data:', error);
      },
    });
    this._subscription.add(loadInstructorDataSubscription);
  }

  getImage() {
    const getImageSubscription = this._profileService.getImage().subscribe({
      next: (response: any) => {
        this.profilePhoto = response.signedUrl;
      },
      error: (error) => {
        console.error('Error loading user image:', error);
      },
    });
    this._subscription.add(getImageSubscription);
  }

  // image file select
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const fileSubscription = this._profileService.uploadProfilePhoto(formData).subscribe({
        next: (response) => {
          this.instructor.profilePhoto = response.photoUrl;
          this._profileService.updateProfilePhoto(response.photoUrl);
          Swal.fire({
            icon: 'success',
            title: response.message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        },
        error: (error) => {
          console.error('Error uploading photo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error uploading photo',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        },
      });
      this._subscription.add(fileSubscription);
    }
  }

  // get image url
  getImageUrl(photoUrl: string): string {
    return this._profileService.getFullImageUrl(photoUrl);
  }

  // open modal
  openEditModal() {
    this.isModalOpen = true;
  }

  // close modal
  closeModal() {
    this.isModalOpen = false;
  }

  // open instructor request modal
  openInstructorReqModal() {
    this.isInstructorModalOpen = true;
  }

  // close instructor request modal
  closeInstructorReqModal() {
    this.isInstructorModalOpen = false;
  }

  // update user details
  saveChanges(updatedData: any) {
    this._profileService.updateUser(updatedData).subscribe({
      next: (response: any) => {
        this.instructor = { ...this.instructor, ...updatedData };
        // this.loadInstructorData();
        this.closeModal();
        if (response) {
          Swal.fire({
            icon: 'success',
            title: response.message || 'Profile updated successfully',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'Error updating profile',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        }
      },
      error: (error: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error updating profile',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
        console.error('Error updating user', error);
      },
    });
  }

  // change password modal
  changePassword() {
    this.isChangePasswordModalOpen = true;
  }

  // close change password modal
  closeChangePassword() {
    this.isChangePasswordModalOpen = false;
  }

  // save new password
  savePassword(passwordData: any) {
    this._profileService.changePassword(passwordData).subscribe({
      next: (response: any) => {
        this.closeChangePassword();
        if (response) {
          Swal.fire({
            icon: 'success',
            title: response.message || 'Password changed successfully',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: response.message || 'Error change password',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        }
      },
    });
  }
}
