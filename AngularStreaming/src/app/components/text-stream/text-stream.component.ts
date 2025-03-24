import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamingService } from '../../services/streaming.service';

@Component({
  selector: 'app-text-stream',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Streaming de Texto</h2>
      
      <div>
        <form (submit)="enviarTexto($event)">
          <textarea 
            [(ngModel)]="textoInput" 
            name="textoInput" 
            rows="5" 
            cols="50" 
            placeholder="Digite o texto para enviar para a API..."
          ></textarea>
          
          <div>
            <button type="submit" [disabled]="!textoInput || processando">Enviar</button>
          </div>
        </form>
      </div>
      
      <div *ngIf="processando">
        <p>Processando...</p>
      </div>
      
      <div *ngIf="resultado">
        <h3>Resultado:</h3>
        <div>{{ resultado }}</div>
      </div>
    </div>
  `,
  styles: `
    div {
      margin-bottom: 15px;
    }
    
    textarea {
      width: 100%;
      margin-bottom: 10px;
    }
    
    button {
      padding: 8px 16px;
    }
  `
})
export class TextStreamComponent {
  textoInput: string = '';
  resultado: string = '';
  processando: boolean = false;
  
  constructor(private streamingService: StreamingService) {}
  
  enviarTexto(event: Event): void {
    event.preventDefault();
    
    if (!this.textoInput || this.processando) {
      return;
    }
    
    this.processando = true;
    this.resultado = '';
    
    // Chamando o serviço de streaming
    this.streamingService.streamText(this.textoInput)
      .subscribe({
        next: (data) => {
          this.resultado += data + ' ';
        },
        error: (error) => {
          console.error('Erro ao processar o streaming:', error);
          this.processando = false;
        },
        complete: () => {
          this.processando = false;
        }
      });
  }
}
