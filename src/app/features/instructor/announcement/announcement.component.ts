import { Component } from '@angular/core';
import { InstructorSidebarComponent } from '../../../shared/components/instructor-sidebar/instructor-sidebar.component';
import { Router } from 'express';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AnnouncementService } from '../../../core/services/instructor/announcement.service';
import { IAnnouncement } from '../../../core/models/Instructor';

@Component({
  selector: 'app-announcement',
  imports: [InstructorSidebarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.css',
})
export class AnnouncementComponent {
  isVisibleForm: boolean = false;
  announcementForm!: FormGroup;
  announcements: IAnnouncement[] = [];
  editMode: boolean = false;
  editAnnouncementId: string | null = null;
  instructorId: string | null = null;

  constructor(private _fb: FormBuilder, private _announcementService: AnnouncementService) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadAnnouncements();
    this.instructorId = this.getInstructorId();
  }

  getInstructorId(): string | null {
    const token = localStorage.getItem('instructorToken') || localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  initializeForms(): void {
    this.announcementForm = this._fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  toggelForm(): void {
    this.isVisibleForm = !this.isVisibleForm;
    if (!this.isVisibleForm) {
      this.editMode = false;
      this.editAnnouncementId = null;
      this.announcementForm.reset();
    }
  }

  loadAnnouncements(): void {
    this._announcementService.getAnnouncements().subscribe(
      (response) => {
        this.announcements = response.result.filter((announcement:IAnnouncement) => this.instructorId === announcement.instructorId);
        console.log('annou', this.announcements)

      },
      (error) => {
        console.error('Error fetching announcements:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.announcementForm.valid) {
      const announcementData = {
        ...this.announcementForm.value,
        instructorId: this.instructorId,
      };

      if (this.editMode && this.editAnnouncementId) {
        // Update existing announcement
        this._announcementService.updateAnnouncement(this.editAnnouncementId, announcementData).subscribe(
          () => {
            Swal.fire('Success', 'Announcement updated successfully', 'success');
            this.loadAnnouncements();
            this.toggelForm();
          },
          (error) => {
            console.error('Error updating announcement:', error);
            Swal.fire('Error', 'Failed to update announcement', 'error');
          }
        );
      } else {
        // Create new announcement
        this._announcementService.createAnnouncement(announcementData).subscribe(
          () => {
            Swal.fire('Success', 'Announcement created successfully', 'success');
            this.loadAnnouncements();
            this.toggelForm();
          },
          (error) => {
            console.error('Error creating announcement:', error);
            Swal.fire('Error', 'Failed to create announcement', 'error');
          }
        );
      }
    }
  }

  editAnnouncement(announcement: any): void {
    this.editMode = true;
    this.editAnnouncementId = announcement._id;
    this.announcementForm.patchValue({
      title: announcement.title,
      description: announcement.description,
    });
    this.isVisibleForm = true;
  }

  deleteAnnouncement(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this._announcementService.deleteAnnouncement(id).subscribe(
          () => {
            Swal.fire('Deleted!', 'Announcement has been deleted.', 'success');
            this.loadAnnouncements();
          },
          (error) => {
            console.error('Error deleting announcement:', error);
            Swal.fire('Error', 'Failed to delete announcement', 'error');
          }
        );
      }
    });
  }
}
