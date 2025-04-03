import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/admin/profile.service';
import Swal from 'sweetalert2';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { CommonModule } from '@angular/common';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { Subscription } from 'rxjs';
import { IUser } from '../../../core/models/IUser';
import { IInstructor } from '../../../core/models/Instructor';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AdminSidebarComponent, EditModalComponent, ChangePasswordModalComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: IUser;
  instructor!: IInstructor;
  isModalOpen: boolean = false;
  isInstructorModalOpen: boolean = false;
  isChangePasswordModalOpen: boolean = false;
  private _subscription: Subscription = new Subscription();
  profilePhoto: string = '';

  constructor(private _profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  // display the user details
  loadUserData() {
    const loadUserSubscription = this._profileService.getUser().subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.getImage();
      },
      error: (error) => {
        // console.error('Error loading user data:', error);
      },
    });
    this._subscription.add(loadUserSubscription);
  }

  getImage() {
    const getImageSubscription = this._profileService.getImage().subscribe({
      next: (response: any) => {
        this.profilePhoto = response.signedUrl;
        console.log('this.', this.profilePhoto);
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
          this.profilePhoto = response.photoUrl;
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
    const updateUserSubscription = this._profileService.updateUser(updatedData).subscribe({
      next: (response: any) => {
        this.user = { ...this.user, ...updatedData };
        // this.loadUserData();
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
    this._subscription.add(updateUserSubscription);
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
    const passwordSubscription = this._profileService.changePassword(passwordData).subscribe({
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
    this._subscription.add(passwordSubscription);
  }
}
