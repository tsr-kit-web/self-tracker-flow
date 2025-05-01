import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'stf-text-area-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
  ],
  templateUrl: './text-area-dialog.component.html',
  styleUrl: './text-area-dialog.component.scss',
})
export class TextAreaDialogComponent {
  text = '';

  constructor(
    public dialogRef: MatDialogRef<TextAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { key: string; text: string },
  ) {
    this.text = data.text || '';
  }

  onSave(): void {
    this.dialogRef.close(this.text);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
