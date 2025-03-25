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
    
    // Envia para o serviço e adiciona a resposta
    this.chatService.sendMessage(messageToSend).subscribe(response => {
      this.messages.push(response);
      this.loading = false;
    });
  }
}
