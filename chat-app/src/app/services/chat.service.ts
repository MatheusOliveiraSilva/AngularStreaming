import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor() { }

  // Método para enviar mensagem para a API
  // Por enquanto, ele apenas retorna uma mensagem de placeholder
  sendMessage(message: string): Observable<ChatMessage> {
    // Simula uma chamada de API com resposta placeholder
    // Em um caso real, isso seria uma chamada HTTP
    const response: ChatMessage = {
      content: 'resposta placeholder',
      role: 'assistant',
      timestamp: new Date()
    };
    
    // Simula um delay de rede
    return of(response).pipe(delay(700));
  }
} 