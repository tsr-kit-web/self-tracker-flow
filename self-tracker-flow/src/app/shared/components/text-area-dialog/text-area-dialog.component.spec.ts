import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAreaDialogComponent } from './text-area-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TextAreaDialogComponent', () => {
  let component: TextAreaDialogComponent;
  let fixture: ComponentFixture<TextAreaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextAreaDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextAreaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
