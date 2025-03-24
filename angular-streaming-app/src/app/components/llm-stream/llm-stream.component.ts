import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StreamingService } from '../../services/streaming.service';

@Component({
  selector: 'app-llm-stream',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './llm-stream.component.html',
  styleUrl: './llm-stream.component.scss'
})
export class LlmStreamComponent implements OnInit, OnDestroy {
  response: string = '';
  loading: boolean = false;
  completed: boolean = false;
  private subscription?: Subscription;

  constructor(private streamingService: StreamingService) {}

  ngOnInit(): void {
    // Inicialmente não carrega nada, aguarda o usuário iniciar
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  startLlmStream(): void {
    // Limpa resposta anterior
    this.response = '';
    this.loading = true;
    this.completed = false;
    
    // Cancela qualquer subscription anterior
    this.unsubscribe();
    
    // Inicia o stream do LLM
    this.subscription = this.streamingService.getLlmStream()
      .subscribe({
        next: (word: string) => {
          this.response += word;
        },
        error: (error) => {
          console.error('Erro no streaming do LLM:', error);
          this.loading = false;
        },
        complete: () => {
          console.log('Streaming do LLM concluído');
          this.loading = false;
          this.completed = true;
        }
      });
  }

  stopLlmStream(): void {
    this.unsubscribe();
    this.loading = false;
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }
}
