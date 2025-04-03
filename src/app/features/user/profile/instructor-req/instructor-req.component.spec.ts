import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorReqComponent } from './instructor-req.component';

describe('InstructorReqComponent', () => {
  let component: InstructorReqComponent;
  let fixture: ComponentFixture<InstructorReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
