import { Component } from '@angular/core';
import { TextStreamComponent } from './components/text-stream/text-stream.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TextStreamComponent],
  template: `
    <div style="padding: 20px;">
      <h1>API de Streaming</h1>
      <app-text-stream></app-text-stream>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'AngularStreaming';
}
