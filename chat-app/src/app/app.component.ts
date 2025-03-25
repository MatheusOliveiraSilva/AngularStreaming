import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatMessage } from './models/message.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Chat App';
  userMessage = '';
  messages: ChatMessage[] = [];
  loading = false;
  threadId = 'chat-app-' + Date.now(); // ID único para esta sessão de chat

  constructor(private chatService: ChatService) {}

  sendMessage(): void {
    if (!this.userMessage.trim()) return;

    // Adiciona a mensagem do usuário
    const userMessage: ChatMessage = {
      content: this.userMessage,
      role: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    
    // Limpa o campo de entrada e marca como carregando
    const messageToSend = this.userMessage;
    this.userMessage = '';
    this.loading = true;
    
    // Cria uma mensagem vazia do assistente para começar a mostrar a digitação
    const assistantMessageIndex = this.messages.length;
    this.messages.push({
      content: '',
      role: 'assistant',
      timestamp: new Date()
    });
    
    // Envia para o serviço e atualiza a resposta com os chunks recebidos
    this.chatService.sendMessage(messageToSend, this.threadId).subscribe({
      next: (updatedMessage) => {
        // Atualiza a mensagem do assistente com o conteúdo recebido
        this.messages[assistantMessageIndex] = updatedMessage;
      },
      error: (error) => {
        console.error('Erro ao receber mensagem:', error);
        // Atualiza a mensagem do assistente com uma mensagem de erro
        this.messages[assistantMessageIndex].content = 'Ocorreu um erro na comunicação com o servidor.';
        this.loading = false;
      },
      complete: () => {
        console.log('Stream concluído');
        this.loading = false;
      }
    });
  }
}
