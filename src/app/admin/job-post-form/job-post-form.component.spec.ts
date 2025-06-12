import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostFormComponent } from './job-post-form.component';

describe('JobPostFormComponent', () => {
  let component: JobPostFormComponent;
  let fixture: ComponentFixture<JobPostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
