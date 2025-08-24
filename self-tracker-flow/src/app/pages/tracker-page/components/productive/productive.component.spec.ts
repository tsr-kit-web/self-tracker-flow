import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductiveComponent } from './productive.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductiveComponent', () => {
  let component: ProductiveComponent;
  let fixture: ComponentFixture<ProductiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductiveComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
