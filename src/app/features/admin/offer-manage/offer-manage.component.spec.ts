import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferManageComponent } from './offer-manage.component';

describe('OfferManageComponent', () => {
  let component: OfferManageComponent;
  let fixture: ComponentFixture<OfferManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
