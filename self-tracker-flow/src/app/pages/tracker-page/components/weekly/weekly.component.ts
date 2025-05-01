import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { User } from '../../../../shared/models/user';
import { Subject, takeUntil, tap, timer } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'stf-weekly',
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
  ],
  templateUrl: './weekly.component.html',
  styleUrl: './weekly.component.scss',
})
export class WeeklyComponent implements OnInit, OnDestroy {
  @Input({ required: true }) user: User | null = null;

  totalPercentage = 0;
  form!: FormGroup;

  clipboardText!: string;

  showStars = false;
  starPositions: any = [];
  isAchievedStars = false;
  private destroy$ = new Subject<void>();

  readonly SUCCESS_RATE = 70;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      items: this.fb.array(this.getDefaultTemplate()),
    });

    this.loadFromLocalStorage();
    this.loadBadgeVisibility();

    this.calculateWeekProgress();

    if (this.calculateInitialGlobalPercentage() >= this.SUCCESS_RATE) {
      this.isAchievedStars = true;
    }
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
          ['Cardio', 'Workout', 'Notes'].map((name) =>
            this.createSubItem(name),
          ),
        ),
      }),
      this.fb.group({
        name: 'Cognitive',
        subItems: this.fb.array(
          ['Prof Insights (<=2)', 'Eng Vac. Review highlighted', 'Repeat: Listen + Draw/Code'].map((name) => this.createSubItem(name)),
        ),
      }),
      this.fb.group({
        name: 'Social',
        subItems: this.fb.array(
          ['Content', 'Household (M)'].map((name) => this.createSubItem(name)),
        ),
      }),
      this.fb.group({
        name: 'Material',
        subItems: this.fb.array(
          ['Tools, theory, etc..'].map((name) =>
            this.createSubItem(name),
          ),
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
    localStorage.setItem('trackerWeekFormState', JSON.stringify(formValue));
  }

  private loadFromLocalStorage(): void {
    const savedState = localStorage.getItem('trackerWeekFormState');
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

    localStorage.removeItem('trackerWeekFormState');

    localStorage.removeItem('badgeWeekVisibility');
    this.badgeVisibility = {};

    this.clipboardText = '';
    this.isAchievedStars = false;
  }

  copyToClipboard(): void {
    const healthPercentage = this.calculateParentPercentage(0);
    const cognitivePercentage = this.calculateParentPercentage(1);
    const socialPercentage = this.calculateParentPercentage(2);
    const materialPercentage = this.calculateParentPercentage(3);
    const globalPercentage = this.calculateGlobalPercentage();

    this.clipboardText = `Weekly: ${globalPercentage}% - H: ${healthPercentage}%, C: ${cognitivePercentage}%; S: ${socialPercentage}%; M: ${materialPercentage}%`;

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
  }

  isBadgeVisible(i: number, j: number): boolean {
    const key = `${i}-${j}`;
    return !!this.badgeVisibility[key];
  }

  private saveBadgeVisibility(): void {
    localStorage.setItem(
      'badgeWeekVisibility',
      JSON.stringify(this.badgeVisibility),
    );
  }

  private loadBadgeVisibility(): void {
    const stored = localStorage.getItem('badgeWeekVisibility');
    if (stored) {
      this.badgeVisibility = JSON.parse(stored);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  weekProgressPercentage = 0;

  calculateWeekProgress(): void {
    const today = new Date();

    const dayOfWeek = today.getDay();

    const adjustedDay = (dayOfWeek + 6) % 7;

    this.weekProgressPercentage = Math.round((adjustedDay / 6) * 100);
  }
}
