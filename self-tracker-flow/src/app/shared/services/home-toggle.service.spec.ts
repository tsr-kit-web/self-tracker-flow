import { TestBed } from '@angular/core/testing';

import { HomeToggleService } from './home-toggle.service';

describe('HomeToggleService', () => {
  let service: HomeToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeToggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
