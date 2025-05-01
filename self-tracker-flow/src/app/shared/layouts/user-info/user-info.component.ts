import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user';

@Component({
  selector: 'stf-user-info',
  standalone: true,
  imports: [],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit {
  @Input({ required: true }) user: User | null = null;

  photoURL!: string;

  ngOnInit(): void {
    this.photoURL = this.user?.photoURL ?? '';
  }
}
