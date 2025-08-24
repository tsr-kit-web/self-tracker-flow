import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'stf-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'self-tracker-flow';

  private darkModeStartHour = 20; // 8:00 PM
  private darkModeEndHour = 7; // 7:00 AM

  isDarkMode!: boolean;

  ngOnInit() {
    this.isDarkMode = this.shouldActivateDarkMode();

    this.applyTheme(this.isDarkMode);
  }

  private shouldActivateDarkMode(): boolean {
    const currentHour = new Date().getHours();
    return (
      currentHour >= this.darkModeStartHour ||
      currentHour < this.darkModeEndHour
    );
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      console.log(document.documentElement);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
