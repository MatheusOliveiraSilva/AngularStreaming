import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StreamingService } from '../../services/streaming.service';

@Component({
  selector: 'app-token-stream',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './token-stream.component.html',
  styleUrl: './token-stream.component.scss'
})
export class TokenStreamComponent implements OnInit, OnDestroy {
  prompt: string = 'Olá, este é um exemplo de streaming de tokens!';
  tokens: string[] = [];
  loading: boolean = false;
  private subscription?: Subscription;

  constructor(private streamingService: StreamingService) {}

  ngOnInit(): void {
    // Inicialmente não carrega nada, aguarda o usuário iniciar
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  startTokenStream(): void {
    // Limpa tokens anteriores
    this.tokens = [];
    this.loading = true;
    
    // Cancela qualquer subscription anterior
    this.unsubscribe();
    
    // Inicia o stream de tokens
    this.subscription = this.streamingService.getTokenStream(this.prompt)
      .subscribe({
        next: (token: string) => {
          this.tokens.push(token);
        },
        error: (error) => {
          console.error('Erro no streaming de tokens:', error);
          this.loading = false;
        },
        complete: () => {
          console.log('Streaming de tokens concluído');
          this.loading = false;
        }
      });
  }

  stopTokenStream(): void {
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
