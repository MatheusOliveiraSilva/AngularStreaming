import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamService } from '../../services/stream.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  userInput: string = '';
  response: string = '';
  isLoading: boolean = false;

  constructor(private streamService: StreamService) {}

  /**
   * Envia o texto para a API e processa a resposta em streaming
   */
  sendMessage(): void {
    if (!this.userInput.trim()) {
      return;
    }

    this.isLoading = true;
    this.response = '';
    
    // Armazenamos os chunks recebidos para processamento
    const receivedChunks: string[] = [];

    this.streamService.postStreamText(this.userInput)
      .subscribe({
        next: (chunk) => {
          // Adiciona o chunk à lista de chunks recebidos
          receivedChunks.push(chunk);
          
          // Atualiza a resposta com todos os chunks recebidos até o momento
          // Isso nos permite reorganizar os chunks se necessário
          this.response = receivedChunks.join('').trim();
        },
        error: (error) => {
          console.error('Erro durante o streaming:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          
          // Ao finalizar, fazemos um processamento final para garantir formatação correta
          this.response = this.response.trim();
          
          // Podemos aplicar formatações adicionais aqui se necessário
          // Por exemplo, corrigir problemas de espaçamento duplo
          this.response = this.response.replace(/\s+/g, ' ');
        }
      });
  }
}
