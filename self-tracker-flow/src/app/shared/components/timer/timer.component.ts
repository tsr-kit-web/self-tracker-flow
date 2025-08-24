import { NgClass, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  lastPauseTime?: string;
  totalPauses: number;
}

@Component({
  selector: 'stf-timer',
  standalone: true,
  imports: [
    MatIconModule,
    MatFormField,
    MatLabel,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatInputModule,
    NgClass,
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() defaultHours = 0;
  @Input() defaultMinutes = 0;
  @Input() timerName = 'Timer';
  @Input() storageKey = 'timerState';
  @Input() isDisabled = false;
  @Input() isActive = false;

  @Output() timerComplete = new EventEmitter<{
    name: string;
    completionTime: string;
  }>();
  @Output() timerStart = new EventEmitter<string>();
  @Output() timerPause = new EventEmitter<string>();

  timerForm: FormGroup;
  hours = 0;
  minutes = 0;
  seconds = 0;
  isRunning = false;
  showCompletionMessage = false;
  completionTime = '';
  totalPauses = 0;
  lastPauseTime = '';

  private timerInterval: any;

  constructor(private fb: FormBuilder) {
    this.timerForm = this.fb.group({
      hours: [0, [Validators.min(0), Validators.max(23)]],
      minutes: [0, [Validators.min(0), Validators.max(59)]],
    });
  }

  ngOnInit() {
    this.loadFromLocalStorage();
    this.initializeForm();
  }

  ngOnDestroy() {
    this.saveToLocalStorage();
    this.clearTimer();

    if (this.isRunning) {
      this.timerPause.emit(this.storageKey);
    }
  }

  private initializeForm() {
    this.timerForm.patchValue({
      hours: this.hours,
      minutes: this.minutes,
    });
  }

  startTimer() {
    if (!this.isRunning && this.hasTime() && !this.isDisabled) {
      this.isRunning = true;
      this.showCompletionMessage = false;
      this.timerInterval = setInterval(() => {
        this.tick();
      }, 1000);
      this.saveToLocalStorage();

      this.timerStart.emit(this.storageKey);
    }
  }

  pauseTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      this.lastPauseTime = this.getCurrentTime();
      this.totalPauses++;
      this.clearTimer();
      this.saveToLocalStorage();

      this.timerPause.emit(this.storageKey);
    }
  }

  forcePause() {
    if (this.isRunning) {
      this.isRunning = false;
      this.lastPauseTime = this.getCurrentTime();
      this.totalPauses++;
      this.clearTimer();
      this.saveToLocalStorage();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.hours = this.defaultHours;
    this.minutes = this.defaultMinutes;
    this.seconds = 0;
    this.totalPauses = 0;
    this.lastPauseTime = '';
    this.showCompletionMessage = false;
    this.initializeForm();
    this.saveToLocalStorage();
  }

  setTimer() {
    if (this.timerForm.valid && !this.isDisabled) {
      const formValue = this.timerForm.value;
      this.resetTimer();
      this.hours = formValue.hours || 0;
      this.minutes = formValue.minutes || 0;
      this.seconds = 0;
      this.saveToLocalStorage();
    }
  }

  private tick() {
    if (this.seconds > 0) {
      this.seconds--;
    } else if (this.minutes > 0) {
      this.minutes--;
      this.seconds = 59;
    } else if (this.hours > 0) {
      this.hours--;
      this.minutes = 59;
      this.seconds = 59;
    } else {
      this.onTimerComplete();
    }
    this.saveToLocalStorage();
  }

  private onTimerComplete() {
    this.completionTime = this.getCurrentTime();
    this.showCompletionMessage = true;
    this.pauseTimer();

    this.timerComplete.emit({
      name: this.timerName,
      completionTime: this.completionTime,
    });
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  hasTime(): boolean {
    return this.hours > 0 || this.minutes > 0 || this.seconds > 0;
  }

  private saveToLocalStorage() {
    const timerState: TimerState = {
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      isRunning: this.isRunning,
      lastPauseTime: this.lastPauseTime,
      totalPauses: this.totalPauses,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(timerState));
  }

  private loadFromLocalStorage() {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const timerState: TimerState = JSON.parse(savedState);
        this.hours = timerState.hours ?? this.defaultHours;
        this.minutes = timerState.minutes ?? this.defaultMinutes;
        this.seconds = timerState.seconds ?? 0;
        this.isRunning = false;
        this.lastPauseTime = timerState.lastPauseTime ?? '';
        this.totalPauses = timerState.totalPauses ?? 0;
      } else {
        this.hours = this.defaultHours;
        this.minutes = this.defaultMinutes;
        this.seconds = 0;
      }
    } catch (error) {
      console.error('Error loading timer state from localStorage:', error);
      this.hours = this.defaultHours;
      this.minutes = this.defaultMinutes;
      this.seconds = 0;
    }
  }

  clearStorage() {
    localStorage.removeItem(this.storageKey);
    this.resetTimer();
  }

  get formattedTime(): string {
    return `${this.padZero(this.hours)}:${this.padZero(this.minutes)}:${this.padZero(this.seconds)}`;
  }

  private padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  get progressPercentage(): number {
    const totalSeconds = this.hours * 3600 + this.minutes * 60 + this.seconds;
    const initialSeconds = this.defaultHours * 3600 + this.defaultMinutes * 60;
    return initialSeconds > 0 ? (totalSeconds / initialSeconds) * 100 : 0;
  }

  get statusText(): string {
    if (this.isActive) return 'Active';
    if (this.isDisabled) return 'Another timer is running';
    return 'Ready';
  }
}
