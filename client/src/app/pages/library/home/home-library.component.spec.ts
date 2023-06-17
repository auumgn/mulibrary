import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLibraryComponent } from './home-library.component';

describe('HomeLibraryComponent', () => {
  let component: HomeLibraryComponent;
  let fixture: ComponentFixture<HomeLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeLibraryComponent]
    });
    fixture = TestBed.createComponent(HomeLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
