import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private readonly API_URL = 'http://localhost:8080/api/stream';

  constructor() { }

  /**
   * Envia texto para a API via POST e recebe a resposta em streaming
   * @param text Texto a ser enviado para processamento
   * @returns Observable que emite os fragmentos de texto recebidos
   */
  streamText(text: string): Observable<string> {
    return new Observable<string>(observer => {
      // Realizando requisição POST com fetch para obter stream
      fetch(`${this.API_URL}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ text })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        
        // Criando um leitor para o ReadableStream da resposta
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Não foi possível criar o leitor de stream');
        }
        
        const decoder = new TextDecoder();
        let buffer = ''; // Buffer para acumular dados entre chunks
        
        // Função recursiva para processar chunks
        const processChunk = async () => {
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              // Se houver algo restante no buffer, processa
              if (buffer.trim()) {
                processSSEData(buffer);
              }
              observer.complete();
              return;
            }
            
            // Decodifica o chunk para texto
            const chunk = decoder.decode(value, { stream: true });
            
            // Adiciona o novo chunk ao buffer
            buffer += chunk;
            
            // Divide o buffer em linhas e processa cada linha SSE completa
            const lines = buffer.split('\n');
            
            // Mantém a última linha no buffer se estiver incompleta
            buffer = lines.pop() || '';
            
            // Processa cada linha completa
            for (const line of lines) {
              processSSEData(line);
            }
            
            // Continua o processamento
            processChunk();
          } catch (error) {
            console.error('Erro ao processar o chunk:', error);
            observer.error(error);
          }
        };
        
        // Função para processar as linhas de dados SSE
        const processSSEData = (line: string) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            const data = trimmedLine.substring(5).trim(); // Remove 'data:' e espaços
            if (data) {
              observer.next(data);
            }
          }
        };
        
        // Inicia o processamento
        processChunk();
      })
      .catch(error => {
        console.error('Erro na requisição:', error);
        observer.error(error);
      });
      
      // Retorna função para limpeza
      return () => {
        // Nada específico para limpar aqui
      };
    });
  }

  /**
   * Envia texto para a API usando POST e recebe a resposta em streaming usando SSE
   * @param text Texto a ser enviado para processamento
   * @returns Observable que emite os eventos SSE
   */
  postStreamText(text: string): Observable<string> {
    return new Observable<string>(observer => {
      // Iniciar o EventSource para receber os eventos SSE
      const eventSource = new EventSource(`${this.API_URL}/text`, {
        withCredentials: false,
      });
      
      // Configurar resposta a eventos
      eventSource.onmessage = (event) => {
        if (event.data) {
          observer.next(event.data);
        }
      };
      
      // Manipulando erros
      eventSource.onerror = (error) => {
        console.error('Erro no EventSource:', error);
        observer.error(error);
        eventSource.close();
      };
      
      // Enviando a requisição POST para iniciar o streaming
      fetch(`${this.API_URL}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }).catch(error => {
        console.error('Erro na requisição POST:', error);
        observer.error(error);
        eventSource.close();
      });
      
      // Limpeza quando o Observable for fechado
      return () => {
        eventSource.close();
      };
    });
  }
}
