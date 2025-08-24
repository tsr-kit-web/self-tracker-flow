import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum WorkMood {
  Work = 'work',
  Home = 'home',
}

@Injectable({
  providedIn: 'root',
})
export class HomeToggleService {
  private workMoodSubject: BehaviorSubject<WorkMood>;
  public workMood$: Observable<WorkMood>;

  constructor() {
    const savedMood = this.getSavedMood();
    this.workMoodSubject = new BehaviorSubject<WorkMood>(savedMood);
    this.workMood$ = this.workMoodSubject.asObservable();
  }

  get currentMood(): WorkMood {
    return this.workMoodSubject.value;
  }

  setWorkMood(mood: WorkMood): void {
    this.workMoodSubject.next(mood);
    this.saveMoodToStorage(mood);
  }

  getSavedMood(): WorkMood {
    const savedMood = localStorage.getItem('workMood');
    return savedMood === WorkMood.Work || savedMood === WorkMood.Home
      ? savedMood
      : WorkMood.Work;
  }

  private saveMoodToStorage(mood: WorkMood): void {
    localStorage.setItem('workMood', mood);
  }
}
