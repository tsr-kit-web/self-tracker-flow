import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  HomeToggleService,
  WorkMood,
} from '../../services/home-toggle.service';

@Component({
  selector: 'stf-user-info',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonToggleModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit {
  @Input({ required: true }) user: User | null = null;

  photoURL!: string;

  workMood: WorkMood = WorkMood.Work;
  isWorkMode = true;

  constructor(private homeToggleService: HomeToggleService) {}

  ngOnInit(): void {
    this.photoURL = this.user?.photoURL ?? '';
    this.loadWorkMoodFromStorage();
  }

  loadWorkMoodFromStorage() {
    this.workMood = this.homeToggleService.getSavedMood();
  }

  onWorkMoodChange(mood: WorkMood) {
    this.homeToggleService.setWorkMood(mood);
  }
}
