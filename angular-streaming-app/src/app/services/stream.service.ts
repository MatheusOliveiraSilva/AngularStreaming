import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private apiUrl = 'http://localhost:8080/api/stream/text';

  constructor(private http: HttpClient) { }

  /**
   * Envia o texto para a API e retorna um Observable que emite os chunks de texto
   * conforme eles chegam do servidor via SSE
   */
  streamText(text: string): Observable<string> {
    return new Observable<string>(observer => {
      const eventSource = new EventSource(
        this.apiUrl, 
        { 
          withCredentials: false 
        }
      );
      
      // Configura o evento para receber os dados
      eventSource.onmessage = (event) => {
        if (event.data) {
          observer.next(event.data);
        }
      };

      // Configura os eventos de erro e fechamento
      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      // Função de limpeza quando o Observable é cancelado
      return () => {
        eventSource.close();
      };
    });
  }

  /**
   * Envia o texto para a API via POST e retorna um Observable que emite os chunks de texto
   * conforme eles chegam do servidor via SSE
   */
  postStreamText(text: string): Observable<string> {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    return new Observable<string>(observer => {
      // Realiza a requisição POST
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.apiUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      // Configura para receber os dados como text/event-stream
      xhr.responseType = 'text';
      
      // Função para processar os dados conforme eles chegam
      let buffer = '';
      xhr.onprogress = () => {
        // Obtém a parte nova da resposta
        const newData = xhr.responseText.substring(buffer.length);
        buffer = xhr.responseText;
        
        // Processa os eventos SSE manualmente
        const lines = newData.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            // Removemos o trim() para preservar espaços e adicionamos um espaço após cada chunk
            // para garantir que as palavras não se juntem
            const data = line.substring(5);
            // Verifica se o chunk não é vazio antes de emitir
            if (data) {
              observer.next(data + ' ');
            }
          }
        }
      };
      
      // Configura o evento de conclusão
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          observer.complete();
        } else {
          observer.error(new Error(`HTTP Error: ${xhr.status}`));
        }
      };
      
      // Configura o evento de erro
      xhr.onerror = () => {
        observer.error(new Error('Network Error'));
      };
      
      // Envia a requisição
      xhr.send(JSON.stringify({ text }));
      
      // Função de limpeza
      return () => {
        xhr.abort();
      };
    });
  }
}
