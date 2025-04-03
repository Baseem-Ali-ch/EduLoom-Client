import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseDetComponent } from './course-det.component';

describe('CourseDetComponent', () => {
  let component: CourseDetComponent;
  let fixture: ComponentFixture<CourseDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseDetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
