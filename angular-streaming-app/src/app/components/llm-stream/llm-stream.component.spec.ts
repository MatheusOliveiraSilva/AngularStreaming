import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlmStreamComponent } from './llm-stream.component';

describe('LlmStreamComponent', () => {
  let component: LlmStreamComponent;
  let fixture: ComponentFixture<LlmStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LlmStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
