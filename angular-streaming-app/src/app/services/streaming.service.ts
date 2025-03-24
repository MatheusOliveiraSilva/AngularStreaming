import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private apiUrl = '/api/stream'; // URL relativa para usar com proxy

  constructor() { }

  /**
   * Recebe streaming de tokens da API
   * @param prompt Texto para tokenizar (opcional)
   * @returns Observable que emite cada token conforme é recebido
   */
  getTokenStream(prompt?: string): Observable<string> {
    return new Observable<string>(observer => {
      const url = prompt 
        ? `${this.apiUrl}/tokens?prompt=${encodeURIComponent(prompt)}`
        : `${this.apiUrl}/tokens`;
      
      const eventSource = new EventSource(url);
      
      eventSource.onmessage = (event) => {
        observer.next(event.data);
      };
      
      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };
      
      // Quando o subscription for cancelado, fechamos a conexão
      return () => {
        eventSource.close();
      };
    });
  }

  /**
   * Recebe streaming de resposta simulando um LLM
   * @returns Observable que emite cada palavra da resposta simulada de LLM
   */
  getLlmStream(): Observable<string> {
    return new Observable<string>(observer => {
      const url = `${this.apiUrl}/llm`;
      
      const eventSource = new EventSource(url);
      
      eventSource.onmessage = (event) => {
        observer.next(event.data);
      };
      
      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };
      
      return () => {
        eventSource.close();
      };
    });
  }
}
