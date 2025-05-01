import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../shared/models/user';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { UserInfoComponent } from '../../shared/layouts/user-info/user-info.component';
import { DailyComponent } from './components/daily/daily.component';
import { WeeklyComponent } from './components/weekly/weekly.component';
import { MonthlyComponent } from './components/monthly/monthly.component';
import { YearlyComponent } from './components/yearly/yearly.component';
import { ProductiveComponent } from './components/productive/productive.component';
@Component({
  selector: 'stf-tracker-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    UserInfoComponent,
    DailyComponent,
    WeeklyComponent,
    MonthlyComponent,
    YearlyComponent,
    ProductiveComponent
  ],
  templateUrl: './tracker-page.component.html',
  styleUrl: './tracker-page.component.scss',
})
export class TrackerPageComponent implements OnInit {
  @Input({ required: true }) user: User | null = null;

  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.user = this.route.parent?.snapshot.data['user'];
    const savedIndex = localStorage.getItem('selectedTabIndex');
    this.selectedTabIndex = savedIndex ? +savedIndex : 0;
  }

  onTabChange(index: number): void {
    localStorage.setItem('selectedTabIndex', index.toString());
  }
}
