import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { User } from '../../../../shared/models/user';
import { Subject, takeUntil, tap, timer } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TextAreaDialogComponent } from '../../../../shared/components/text-area-dialog/text-area-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'stf-monthly',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTabsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './monthly.component.html',
  styleUrl: './monthly.component.scss',
})
export class MonthlyComponent implements OnInit, OnDestroy {
  @Input({ required: true }) user: User | null = null;

  totalPercentage = 0;
  form!: FormGroup;

  clipboardText!: string;

  showStars = false;
  starPositions: any = [];
  isAchievedStars = false;
  private destroy$ = new Subject<void>();

  readonly SUCCESS_RATE = 70;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  checkboxTexts: Record<string, string> = {};

  monthProgressPercentage = 0;

  ngOnInit(): void {
    this.form = this.fb.group({
      items: this.fb.array(this.getDefaultTemplate()),
    });

    this.loadFromLocalStorage();
    this.loadBadgeVisibility();

    this.loadTextsFromLocalStorage();

    this.calculateMonthProgress();

    if (this.calculateInitialGlobalPercentage() >= this.SUCCESS_RATE) {
      this.isAchievedStars = true;
    }
  }

  calculateMonthProgress(): void {
    const now = new Date();

    const currentDay = now.getDate();
    const totalDaysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    this.monthProgressPercentage = Math.round(
      (currentDay / totalDaysInMonth) * 100,
    );
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getSubItems(index: number): FormArray {
    return this.items.at(index).get('subItems') as FormArray;
  }

  calculateParentPercentage(itemIndex: number): number {
    const subItems = this.getSubItems(itemIndex).controls;
    const totalSubItems = subItems.length;
    const activeSubItems = subItems.filter(
      (subItem) => subItem.get('included')?.value,
    ).length;

    return totalSubItems > 0
      ? Math.round((activeSubItems / totalSubItems) * 100)
      : 0;
  }

  calculateGlobalPercentage(): number {
    let totalPercentage = 0;
    const totalItems = this.items.controls.length;

    this.items.controls.forEach((_, index) => {
      totalPercentage += this.calculateParentPercentage(index);
    });

    const total = totalItems > 0 ? Math.round(totalPercentage / totalItems) : 0;

    if (total >= this.SUCCESS_RATE && !this.isAchievedStars) {
      this.showStars = true;
      this.generateStarPositions();
      this.animateStars();
    }

    return total;
  }

  calculateInitialGlobalPercentage() {
    let totalPercentage = 0;
    const totalItems = this.items.controls.length;

    this.items.controls.forEach((_, index) => {
      totalPercentage += this.calculateParentPercentage(index);
    });

    return totalItems > 0 ? Math.round(totalPercentage / totalItems) : 0;
  }

  updateParentPercentage(itemIndex: number, j: number): void {
    const key = `${itemIndex}-${j}`;

    if (this.badgeVisibility[key]) {
      this.badgeVisibility[key] = false;
      this.saveBadgeVisibility();
    }

    this.calculateParentPercentage(itemIndex);
    this.saveToLocalStorage();

    this.openDialog(itemIndex, j);
  }

  private generateStarPositions(): void {
    const positions = [];
    for (let i = 0; i < 30; i++) {
      const top = Math.random() * 100 + '%';
      const left = Math.random() * 100 + '%';
      const size = Math.random() * 2 + 1 + 'rem';
      const rotationSpeed = Math.random() * 3 + 1;
      const rotation = Math.random() * 360 + 'deg';
      positions.push({ top, left, size, rotation, rotationSpeed });
    }
    this.starPositions = positions;
  }

  private animateStars(): void {
    timer(5000)
      .pipe(
        tap(() => {
          this.showStars = false;
          this.isAchievedStars = true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private getDefaultTemplate(): any[] {
    return [
      this.fb.group({
        name: 'Health',
        subItems: this.fb.array(
          ['Review & Summarize Notes + Action Items'].map((name) => this.createSubItem(name)),
        ),
      }),
      this.fb.group({
        name: 'Cognitive',
        subItems: this.fb.array(
          ['Culture Insights (<=2)', 'English Vocabulary Rec'].map((name) =>
            this.createSubItem(name),
          ),
        ),
      }),
      this.fb.group({
        name: 'Social',
        subItems: this.fb.array(
          [
            'Charity action',
            'Content Prof',
            'Contribute to the appearance (<=2)',
            'Live interaction (<=2)',
          ].map((name) => this.createSubItem(name)),
        ),
      }),
      this.fb.group({
        name: 'Material',
        subItems: this.fb.array(
          ['Research local (RB)'].map((name) => this.createSubItem(name)),
        ),
      }),
    ];
  }

  private createSubItem(name: string): FormGroup {
    return this.fb.group({
      name: name,
      included: false,
    });
  }

  private saveToLocalStorage(): void {
    const formValue = this.form.value;
    localStorage.setItem('trackerMonthlyFormState', JSON.stringify(formValue));
  }

  private loadFromLocalStorage(): void {
    const savedState = localStorage.getItem('trackerMonthlyFormState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      this.form.setValue(parsedState);
    }
  }

  clearForm(): void {
    const items = this.form.get('items') as FormArray;

    items.controls.forEach((item) => {
      const subItems = item.get('subItems') as FormArray;
      subItems.controls.forEach((subItem) => {
        subItem.get('included')?.setValue(false);
      });
    });

    localStorage.removeItem('trackerMonthlyFormState');
    localStorage.removeItem('badgeMonthlyVisibility');
    this.badgeVisibility = {};

    localStorage.removeItem('checkboxMonthlyTexts');
    this.checkboxTexts = {};

    this.clipboardText = '';
    this.isAchievedStars = false;
    this.showReport = false;
  }

  copyToClipboard(): void {
    const healthPercentage = this.calculateParentPercentage(0);
    const cognitivePercentage = this.calculateParentPercentage(1);
    const socialPercentage = this.calculateParentPercentage(2);
    const materialPercentage = this.calculateParentPercentage(3);
    const globalPercentage = this.calculateGlobalPercentage();

    this.clipboardText = `EDF: ${globalPercentage}% - H: ${healthPercentage}%, C: ${cognitivePercentage}%; S: ${socialPercentage}%; M: ${materialPercentage}%`;

    navigator.clipboard.writeText(this.clipboardText).then(
      () => {
        console.log('Copied to clipboard:', this.clipboardText);
      },
      (err) => {
        console.error('Failed to copy to clipboard:', err);
      },
    );
  }

  getProgressBarColor(percentage: number): any {
    if (percentage < 20) {
      return 'warn';
    } else if (percentage < 50) {
      return 'accent';
    }
  }

  badgeVisibility: any = {};

  toggleBadge(i: number, j: number): void {
    const key = `${i}-${j}`;
    this.badgeVisibility[key] = !this.badgeVisibility[key];
    this.saveBadgeVisibility();

    this.openDialog(i, j);
  }

  isBadgeVisible(i: number, j: number): boolean {
    const key = `${i}-${j}`;
    return !!this.badgeVisibility[key];
  }

  private saveBadgeVisibility(): void {
    localStorage.setItem(
      'badgeMonthlyVisibility',
      JSON.stringify(this.badgeVisibility),
    );
  }

  private loadBadgeVisibility(): void {
    const stored = localStorage.getItem('badgeMonthlyVisibility');
    if (stored) {
      this.badgeVisibility = JSON.parse(stored);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialog(i: number, j: number): void {
    const key = `${i}-${j}`;
    const currentText = this.checkboxTexts[key] || '';

    const dialogRef = this.dialog.open(TextAreaDialogComponent, {
      width: '400px',
      data: { key, text: currentText },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.checkboxTexts[key] = result;
        this.saveTextsToLocalStorage();
      }
    });
  }

  private saveTextsToLocalStorage(): void {
    localStorage.setItem(
      'checkboxMonthlyTexts',
      JSON.stringify(this.checkboxTexts),
    );
  }

  private loadTextsFromLocalStorage(): void {
    const saved = localStorage.getItem('checkboxMonthlyTexts');
    if (saved) {
      this.checkboxTexts = JSON.parse(saved);
    }
  }

  showReport = false;
  reportItems: any = [];

  toggleReport(): void {
    this.showReport = !this.showReport;

    if (this.showReport) {
      this.generateReport();
    }
  }

  generateReport(): void {
    this.reportItems = [];

    this.items.controls.forEach((itemGroup, i) => {
      const parentName = itemGroup.get('name')?.value;
      const subItems = this.getSubItems(i).controls;

      const subItemList: { label: any; note: string }[] = [];

      subItems.forEach((subItemGroup, j) => {
        const included = subItemGroup.get('included')?.value;
        const label = subItemGroup.get('name')?.value;
        const note = this.checkboxTexts[`${i}-${j}`] || '';

        if (included) {
          subItemList.push({
            label,
            note,
          });
        }
      });

      if (subItemList.length > 0) {
        this.reportItems.push({
          parentName,
          subItems: subItemList,
        });
      }
    });
  }

  copyReportToClipboard(): void {
    const healthPercentage = this.calculateParentPercentage(0);
    const cognitivePercentage = this.calculateParentPercentage(1);
    const socialPercentage = this.calculateParentPercentage(2);
    const materialPercentage = this.calculateParentPercentage(3);
    const globalPercentage = this.calculateGlobalPercentage();

    this.clipboardText = `Monthly: ${globalPercentage}% - H: ${healthPercentage}%, C: ${cognitivePercentage}%; S: ${socialPercentage}%; M: ${materialPercentage}%`;

    const reportBody = this.reportItems
      .map((parent: { subItems: any[]; parentName: any }) => {
        const subItemsText = parent.subItems
          .map((sub) => {
            let line = `- ${sub.label}`;
            if (sub.note) {
              line += `\n  Note: ${sub.note}`;
            }
            return line;
          })
          .join('\n\n');

        return `${parent.parentName}\n${subItemsText}`;
      })
      .join('\n\n');

    const fullReportText = `${this.clipboardText}\n\n${reportBody}`;

    navigator.clipboard
      .writeText(fullReportText)
      .then(() => console.log('Report copied to clipboard!'))
      .catch((err) => console.error('Failed to copy report:', err));
  }
}
