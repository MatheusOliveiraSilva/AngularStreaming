import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenStreamComponent } from './token-stream.component';

describe('TokenStreamComponent', () => {
  let component: TokenStreamComponent;
  let fixture: ComponentFixture<TokenStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
