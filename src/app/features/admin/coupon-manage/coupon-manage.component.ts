import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminSidebarComponent } from '../../../shared/components/admin-sidebar/admin-sidebar.component';
import { Subscription } from 'rxjs';
import { ICoupon } from '../../../core/models/IAdmin';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CouponService } from '../../../core/services/admin/coupon.service';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-coupon-manage',
  imports: [AdminSidebarComponent, CommonModule, FormsModule, ReactiveFormsModule, TableComponent],
  templateUrl: './coupon-manage.component.html',
  styleUrls: ['./coupon-manage.component.css'], // Fixed typo from 'styleUrl' to 'styleUrls'
})
export class CouponManageComponent implements OnInit, OnDestroy {
  allCoupon: ICoupon[] = [];
  filteredCoupon: ICoupon[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  isVisibleForm: boolean = false;
  couponForm!: FormGroup;
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  private _subscription: Subscription = new Subscription();

  showEditModal = false;
  editCouponForm!: FormGroup;
  selectedCoupon: ICoupon | null = null;

  tableColumns = [
    { key: 'couponCode', label: 'Coupon Code' },
    { key: 'discount', label: 'Discount' },
    { key: 'minPurAmt', label: 'Min Amt' },
    { key: 'description', label: 'Description' },
    { key: 'expDate', label: 'Expiry Date' },
    { key: 'maxPurAmt', label: 'Max Amt' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'Actions', isAction: true },
  ];

  constructor(private _couponService: CouponService, private _fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.initializeForms();
    this.getAllCoupon();
  }

  initializeForms(): void {
    this.couponForm = this._fb.group(
      {
        couponCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>?]+$'), Validators.minLength(4), Validators.maxLength(12), this.noWhitespaceValidator()]],
        discount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
        minPurAmt: ['', [Validators.required, Validators.min(0)]],
        description: ['', [Validators.required, Validators.minLength(5)]],
        expDate: ['', [Validators.required]],
        maxPurAmt: ['', [Validators.required, Validators.min(0)]],
        status: ['', [Validators.required]],
      },
      { validators: this.amountValidator }
    );

    this.editCouponForm = this._fb.group(
      {
        couponCode: ['', [Validators.required, Validators.pattern('^[A-Z0-9!@#$%^&*()_+\\-=\\[\\]{};:\'",.<>?]+$'), Validators.minLength(4), Validators.maxLength(12), this.noWhitespaceValidator()]],
        discount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
        minPurAmt: ['', [Validators.required, Validators.min(0)]],
        description: ['', [Validators.required, Validators.minLength(5)]],
        expDate: ['', [Validators.required]],
        maxPurAmt: ['', [Validators.required, Validators.min(0)]],
      },
      { validators: this.amountValidator }
    );
  }

  toggelForm() {
    this.isVisibleForm = !this.isVisibleForm;
  }

  // Custom validator to prevent whitespace
  noWhitespaceValidator() {
    return (control: any) => {
      const isWhitespace = (control.value || '').trim().length !== control.value.length;
      return isWhitespace ? { whitespace: true } : null;
    };
  }

  // Validator to ensure maxPurAmt is greater than minPurAmt
  amountValidator(group: FormGroup) {
    const minPurAmt = group.get('minPurAmt')?.value;
    const maxPurAmt = group.get('maxPurAmt')?.value;
    return minPurAmt && maxPurAmt && minPurAmt >= maxPurAmt ? { amountInvalid: true } : null;
  }

  // Check for duplicate coupon code
  checkDuplicateCouponCode(couponCode: string, currentCouponId?: string): boolean {
    return this.allCoupon.some((coupon) => coupon.couponCode === couponCode && (!currentCouponId || coupon._id !== currentCouponId));
  }

  onSubmit() {
    if (this.couponForm.valid) {
      const formValue = { ...this.couponForm.value };

      if (this.checkDuplicateCouponCode(formValue.couponCode)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate coupon code',
          text: 'This coupon code already exists',
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

      const formSubmit = this._couponService.addCoupon(formValue).subscribe({
        next: (response) => {
          const newCoupon: ICoupon = response.result;
          this.allCoupon.unshift(newCoupon);
          this.filteredCoupon.unshift(newCoupon);
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
          this.couponForm.reset();
          this.isVisibleForm = false;
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: error.error?.message || 'Failed to add coupon',
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
      this.couponForm.markAllAsTouched();
    }
  }

  getAllCoupon() {
    const couponSubscription = this._couponService.getCoupons().subscribe({
      next: (response) => {
        this.allCoupon = response.result;
        this.filterCoupon();
      },
      error: (error) => console.error('Error fetching coupons:', error),
    });
    this._subscription.add(couponSubscription);
  }

  updateStatus(couponId: string, status: boolean) {
    const updateStatusSubscription = this._couponService.updateCouponStatus(couponId, status).subscribe({
      next: (response) => {
        const coupon = this.allCoupon.find((c) => c._id === couponId);
        if (coupon) {
          coupon.isActive = status;
          this.filterCoupon();
        }
        console.log(response);
      },
      error: (error) => console.error('Error updating coupon status:', error),
    });
    this._subscription.add(updateStatusSubscription);
  }

  filterCoupon() {
    this.filteredCoupon = this.allCoupon.filter((coupon) => {
      const matchesSearch = !this.searchTerm || coupon.couponCode.toLowerCase().includes(this.searchTerm.toLowerCase()) || coupon.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'all' || (this.selectedStatus === 'active' && coupon.isActive) || (this.selectedStatus === 'inactive' && !coupon.isActive);

      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredCoupon.length / this.limit);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onActionClicked(event: { item: ICoupon; action: string }) {
    const { item, action } = event;
    switch (action) {
      case 'suspend':
      case 'activate':
        this.updateStatus(item._id!, action === 'activate');
        break;
      case 'edit':
        console.log('Edit coupon:', item);
        this.editCoupon(item);
        break;
    }
  }

  editCoupon(coupon: ICoupon): void {
    this.selectedCoupon = coupon;
    if (!this.editCouponForm) {
      console.error('editCouponForm is not initialized. Initializing now...');
      this.initializeForms();
    }
    this.editCouponForm.patchValue({
      couponCode: coupon.couponCode,
      discount: coupon.discount,
      minPurAmt: coupon.minPurAmt,
      description: coupon.description,
      expDate: coupon.expDate.split('T')[0],
      maxPurAmt: coupon.maxPurAmt,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCoupon = null;
    this.editCouponForm.reset();
  }

  submitEditCoupon(): void {
    if (this.editCouponForm.valid && this.selectedCoupon) {
      const updatedCoupon: ICoupon = {
        ...this.selectedCoupon,
        ...this.editCouponForm.value,
      };

      if (this.checkDuplicateCouponCode(updatedCoupon.couponCode, updatedCoupon._id)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate coupon code',
          text: 'This coupon code already exists',
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

      this._couponService.updateCoupon(updatedCoupon).subscribe({
        next: (response) => {
          const index = this.filteredCoupon.findIndex((c) => c._id === updatedCoupon._id);
          if (index !== -1) {
            this.filteredCoupon[index] = updatedCoupon;
            this.allCoupon[this.allCoupon.findIndex((c) => c._id === updatedCoupon._id)] = updatedCoupon;
          }

          Swal.fire({
            icon: 'success',
            title: 'Coupon Updated Successfully',
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
          console.error('Error updating coupon:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to Update Coupon',
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
      this.editCouponForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
