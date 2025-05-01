import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackerPageComponent } from './tracker-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TrackerPageComponent', () => {
  let component: TrackerPageComponent;
  let fixture: ComponentFixture<TrackerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TrackerPageComponent,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
