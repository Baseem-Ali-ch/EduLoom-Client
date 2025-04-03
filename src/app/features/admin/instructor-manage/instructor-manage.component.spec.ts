import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorManageComponent } from './instructor-manage.component';

describe('InstructorManageComponent', () => {
  let component: InstructorManageComponent;
  let fixture: ComponentFixture<InstructorManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
