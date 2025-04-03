import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Subscription } from 'rxjs';
import { IOffer } from '../../../core/models/IAdmin';
import { OfferService } from '../../../core/services/admin/offer.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-offer-manage',
  imports: [AdminSidebarComponent, CommonModule, FormsModule, ReactiveFormsModule, TableComponent],
  templateUrl: './offer-manage.component.html',
  styleUrls: ['./offer-manage.component.css'], // Fixed typo from 'styleUrl' to 'styleUrls'
})
export class OfferManageComponent implements OnInit, OnDestroy {
  allOffers: IOffer[] = [];
  filteredOffers: IOffer[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  isVisibleForm: boolean = false;
  offerForm!: FormGroup;
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  private _subscription: Subscription = new Subscription();

  showEditModal = false;
  editOfferForm!: FormGroup;
  selectedOffer: IOffer | null = null;

  // Column configuration for the generic table
  tableColumns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'discount', label: 'Discount' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'Actions', isAction: true },
  ];

  constructor(private _offerService: OfferService, private _fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.initializeForms();
    this.getAllOffer();
  }

  initializeForms(): void {
    this.offerForm = this._fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-Z0-9 ]+$'), // Letters, numbers, and spaces
          this.noWhitespaceOnlyValidator(),
        ],
      ],
      category: ['', [Validators.required]],
      discount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      status: ['', [Validators.required]],
    });

    this.editOfferForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9 ]+$'), this.noWhitespaceOnlyValidator()]],
      category: ['', [Validators.required]],
      discount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  // Custom validator to prevent only whitespace
  noWhitespaceOnlyValidator() {
    return (control: any) => {
      const value = control.value || '';
      const isWhitespaceOnly = value.trim().length === 0 && value.length > 0;
      return isWhitespaceOnly ? { whitespaceOnly: true } : null;
    };
  }

  // Check for duplicate offer title
  checkDuplicateOfferTitle(title: string, currentOfferId?: string): boolean {
    return this.allOffers.some((offer) => offer.title.toLowerCase() === title.toLowerCase() && (!currentOfferId || offer._id !== currentOfferId));
  }

  toggelForm() {
    this.isVisibleForm = !this.isVisibleForm;
  }

  onSubmit() {
    if (this.offerForm.valid) {
      const formValue = { ...this.offerForm.value };
      if (this.checkDuplicateOfferTitle(formValue.title)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate offer title',
          text: 'This offer title already exists',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
        return;
      }

      formValue.isActive = formValue.status === 'active';
      delete formValue.status;

      const formSubmit = this._offerService.addOffer(formValue).subscribe({
        next: (response) => {
          const newOffer: IOffer = response.result;
          this.allOffers.unshift(newOffer);
          this.filteredOffers.unshift(newOffer);
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
          this.offerForm.reset();
          this.isVisibleForm = false;
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: error.error?.message || 'Failed to add offer',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });
        },
        complete: () => this._subscription.add(formSubmit),
      });
    } else {
      this.offerForm.markAllAsTouched();
    }
  }

  submitEditOffer(): void {
    if (this.editOfferForm.valid && this.selectedOffer) {
      const updatedOffer: IOffer = {
        ...this.selectedOffer,
        ...this.editOfferForm.value,
      };

      if (this.checkDuplicateOfferTitle(updatedOffer.title, updatedOffer._id)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate offer title',
          text: 'This offer title already exists',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'rgb(8, 10, 24)',
          color: 'white',
        });
        return;
      }

      this._offerService.updateOffer(updatedOffer).subscribe({
        next: (response) => {
          const index = this.filteredOffers.findIndex((o) => o._id === updatedOffer._id);
          if (index !== -1) {
            this.filteredOffers[index] = updatedOffer;
            this.allOffers[this.allOffers.findIndex((o) => o._id === updatedOffer._id)] = updatedOffer;
          }

          Swal.fire({
            icon: 'success',
            title: 'Offer Updated Successfully',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'rgb(8, 10, 24)',
            color: 'white',
          });

          this.closeEditModal();
        },
        error: (error) => {
          console.error('Error updating offer:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to Update Offer',
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
    } else {
      this.editOfferForm.markAllAsTouched();
    }
  }

  getAllOffer() {
    const offerSubscription = this._offerService.getOffers().subscribe({
      next: (response) => {
        this.allOffers = response.result;
        this.filterOffer(); // Apply filters after fetching
      },
      error: (error) => console.error('Error fetching offers:', error),
    });
    this._subscription.add(offerSubscription);
  }

  updateStatus(offerId: string, status: boolean) {
    const updateStatusSubscription = this._offerService.updateOfferStatus(offerId, status).subscribe({
      next: (response) => {
        const offer = this.allOffers.find((o) => o._id === offerId);
        if (offer) {
          offer.isActive = status;
          this.filterOffer();
        }
        console.log(response);
      },
      error: (error) => console.error('Error updating offer status:', error),
    });
    this._subscription.add(updateStatusSubscription);
  }

  filterOffer() {
    this.filteredOffers = this.allOffers.filter((offer) => {
      const matchesSearch = !this.searchTerm || offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || offer.category.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'all' || (this.selectedStatus === 'active' && offer.isActive) || (this.selectedStatus === 'inactive' && !offer.isActive);

      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredOffers.length / this.limit);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // If your API supports pagination, fetch new data here
    // For now, we'll rely on client-side pagination
  }

  onActionClicked(event: { item: IOffer; action: string }) {
    const { item, action } = event;
    switch (action) {
      case 'suspend':
      case 'activate':
        this.updateStatus(item._id!, action === 'activate');
        break;
      case 'edit':
        console.log('Edit offer:', item);
        this.editOffer(item);
        break;
    }
  }

  editOffer(offer: IOffer): void {
    this.selectedOffer = offer;
    if (!this.editOfferForm) {
      console.error('editOfferForm is not initialized. Initializing now...');
      this.initializeForms();
    }
    this.editOfferForm.patchValue({
      title: offer.title,
      discount: offer.discount,
      category: offer.category,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedOffer = null;
    this.editOfferForm.reset();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
