import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ChatMessage } from '../models/message.model';
import { ChunkResponse, QueryRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API_URL = 'http://localhost:8080/api/chat/query';
  
  constructor() { }

  /**
   * Envia uma mensagem para a API e retorna um Observable que emite 
   * as mensagens conforme vão chegando do stream SSE
   */
  sendMessage(message: string, threadId: string = 'chat-app-' + Date.now()): Observable<ChatMessage> {
    // Subject que irá emitir as atualizações de mensagens
    const messageSubject = new Subject<ChatMessage>();
    
    // Criar a requisição
    const queryRequest: QueryRequest = {
      input: message,
      memory_config: {
        configurable: {
          thread_id: threadId
        }
      }
    };
    
    // Inicializar a mensagem do assistente com conteúdo vazio
    const assistantMessage: ChatMessage = {
      content: '',
      role: 'assistant',
      timestamp: new Date()
    };
    
    // Estabelecer conexão SSE
    const eventSource = new EventSource(`${this.API_URL}?input=${encodeURIComponent(message)}&thread_id=${encodeURIComponent(threadId)}`, { withCredentials: false });
    
    // Configura o POST com body no EventSource (que por padrão só suporta GET)
    this.setupPostEventSource(eventSource, this.API_URL, queryRequest);
    
    // Quando a conexão for estabelecida
    eventSource.addEventListener('connected', (event: MessageEvent) => {
      console.log('Conexão SSE estabelecida:', event.data);
    });
    
    // Quando receber um chunk
    eventSource.addEventListener('chunk', (event: MessageEvent) => {
      try {
        const chunkData: ChunkResponse = JSON.parse(event.data);
        console.log('Chunk recebido:', chunkData);
        
        // Acumular o conteúdo do chunk na resposta
        if (chunkData.content !== undefined) {
          assistantMessage.content += chunkData.content;
          
          // Emitir a mensagem atualizada para o componente
          messageSubject.next({...assistantMessage});
        }
      } catch (error) {
        console.error('Erro ao processar chunk:', error);
      }
    });
    
    // Quando o streaming for concluído
    eventSource.addEventListener('complete', () => {
      console.log('Streaming concluído');
      eventSource.close();
      messageSubject.complete();
    });
    
    // Em caso de erro
    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error);
      eventSource.close();
      
      // Se não tiver recebido nenhum conteúdo, exibe mensagem de erro
      if (!assistantMessage.content) {
        assistantMessage.content = 'Ocorreu um erro na comunicação com o servidor.';
        messageSubject.next(assistantMessage);
      }
      
      messageSubject.complete();
    };
    
    return messageSubject.asObservable();
  }
  
  /**
   * Configura um EventSource para realizar requisições POST em vez de GET,
   * já que por padrão o EventSource só suporta GET mas precisamos enviar um body
   */
  private setupPostEventSource(eventSource: EventSource, url: string, body: any): void {
    // Substituir o EventSource nativo por uma implementação que usa fetch com POST
    // Esta é uma solução alternativa, já que EventSource oficial só suporta GET
    
    // Primeiro fecha a conexão atual
    eventSource.close();
    
    // Agora fazemos uma requisição POST com fetch API
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(body)
    }).then(response => {
      if (!response.ok) {
        throw new Error('Falha na requisição: ' + response.status);
      }
      
      // Um hack para converter a resposta fetch em eventos EventSource
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Resposta não possui corpo');
      }
      
      // Processar o stream manualmente
      const processStream = async () => {
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Processar qualquer dado restante no buffer
              if (buffer.trim()) {
                this.processEventData(buffer, eventSource);
              }
              
              // Simular evento de conclusão
              const completeEvent = new MessageEvent('complete', {
                data: 'Streaming concluído'
              });
              
              // @ts-ignore - Acessando dispatchEvent privado
              eventSource.dispatchEvent(completeEvent);
              break;
            }
            
            // Decodificar e acumular o buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Processar linhas completas
            const lines = buffer.split('\n\n');
            
            // Manter a última linha potencialmente incompleta no buffer
            buffer = lines.pop() || '';
            
            // Processar cada linha completa
            for (const line of lines) {
              if (line.trim()) {
                this.processEventData(line, eventSource);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao processar stream:', error);
          
          // Simular evento de erro
          const errorEvent = new Event('error');
          eventSource.dispatchEvent(errorEvent);
        }
      };
      
      processStream();
    }).catch(error => {
      console.error('Erro na requisição fetch:', error);
      
      // Simular evento de erro
      const errorEvent = new Event('error');
      eventSource.dispatchEvent(errorEvent);
    });
  }
  
  /**
   * Processa os dados de eventos SSE e dispara eventos correspondentes no EventSource
   */
  private processEventData(data: string, eventSource: EventSource): void {
    const eventLines = data.split('\n');
    let eventName = 'message';
    let eventData = '';
    
    for (const line of eventLines) {
      if (line.startsWith('event:')) {
        eventName = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        eventData = line.substring(5).trim();
      }
    }
    
    if (eventData) {
      const messageEvent = new MessageEvent(eventName, {
        data: eventData
      });
      
      // @ts-ignore - Acessando dispatchEvent privado
      eventSource.dispatchEvent(messageEvent);
    }
  }
} 