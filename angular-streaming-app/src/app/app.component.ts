import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenStreamComponent } from './components/token-stream/token-stream.component';
import { LlmStreamComponent } from './components/llm-stream/llm-stream.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TokenStreamComponent, LlmStreamComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Streaming com SSE';
}
