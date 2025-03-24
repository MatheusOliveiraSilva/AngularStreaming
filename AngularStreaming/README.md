# Relatório Técnico: Implementação de Streaming Angular com API Spring Boot SSE

## Visão Geral

Este projeto demonstra a implementação de um frontend Angular que consome dados em tempo real de uma API Spring Boot utilizando o protocolo Server-Sent Events (SSE). A aplicação permite ao usuário enviar texto para o backend, que processa e retorna esse texto palavra por palavra através de streaming, simulando o comportamento de uma API de Large Language Model (LLM).

## Tecnologias Utilizadas

- **Frontend**: Angular 19
- **Backend**: Spring Boot com suporte a SSE (Server-Sent Events)
- **Comunicação**: Protocolo SSE sobre HTTP
- **Linguagens**: TypeScript, HTML, CSS (frontend) e Java (backend)

## Estrutura do Projeto

```
/AngularStreaming/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── text-stream/
│   │   │       └── text-stream.component.ts  # Componente de interface com usuário
│   │   ├── services/
│   │   │   └── streaming.service.ts          # Serviço de comunicação com a API
│   │   ├── app.component.ts                  # Componente raiz
│   │   └── app.config.ts                     # Configuração do Angular
│   ├── index.html
│   └── main.ts
└── ...
```

## Detalhes da Implementação

### 1. Serviço de Streaming (`streaming.service.ts`)

O coração da aplicação é o serviço que gerencia a comunicação com a API Spring Boot e processa os eventos SSE. Implementamos este serviço usando a API Fetch moderna do JavaScript para realizar requisições HTTP POST e processar a resposta em streaming:

```typescript
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
      
      // Obtém o leitor de stream da resposta
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
```

#### Explicação Técnica do Processamento SSE

1. **Inicialização da conexão**: Usamos `fetch()` com o método POST para enviar dados ao servidor
2. **Leitura do stream**: Utilizamos a API `ReadableStream` através do método `getReader()` 
3. **Decodificação de dados**: Convertemos os bytes recebidos para texto usando `TextDecoder` 
4. **Bufferização**: Implementamos um sistema de buffer para lidar com chunks parciais de dados SSE
5. **Processamento de eventos SSE**: Identificamos linhas no formato `data: [conteúdo]` e extraímos o conteúdo
6. **Propagação de dados**: Utilizamos o padrão Observable (RxJS) para emitir os dados para os componentes

### 2. Componente de Interface (`text-stream.component.ts`)

O componente de interface de usuário é responsável por coletar a entrada do usuário e exibir os resultados do streaming:

```typescript
enviarTexto(event: Event): void {
  event.preventDefault();
  
  if (!this.textoInput || this.processando) {
    return;
  }
  
  this.processando = true;
  this.resultado = '';
  
  // Chamando o serviço de streaming
  this.streamingService.streamText(this.textoInput)
    .subscribe({
      next: (data) => {
        // Adiciona o chunk recebido com um espaço após ele
        this.resultado += data + ' ';
      },
      error: (error) => {
        console.error('Erro ao processar o streaming:', error);
        this.processando = false;
      },
      complete: () => {
        this.processando = false;
      }
    });
}
```

O componente se inscreve no Observable retornado pelo serviço de streaming e atualiza incrementalmente a interface do usuário à medida que novos dados são recebidos.

## Protocolo SSE (Server-Sent Events)

O protocolo SSE é uma tecnologia web que permite que um servidor envie atualizações para um cliente. Diferentemente do WebSocket, o SSE opera apenas em uma direção (servidor para cliente) e utiliza uma conexão HTTP tradicional.

### Formato dos Eventos SSE

Os eventos SSE seguem um formato específico:

```
data: [conteúdo do evento]
```

Cada evento é separado por uma linha em branco (`\n\n`).

### Como o Spring Boot Implementa SSE

O Spring Boot utiliza a classe `SseEmitter` para implementar o protocolo SSE. No backend, cada palavra do texto é enviada como um evento SSE individual:

```java
@PostMapping(value = "/text", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamTextResponse(@RequestBody TextRequest textRequest) {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    
    executorService.execute(() -> {
        try {
            String[] words = textRequest.getText().split("\\s+");
            
            for (String word : words) {
                Thread.sleep(150);  // Pausa para simular a geração
                emitter.send(word + " ", MediaType.TEXT_PLAIN);
            }
            
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });
    
    return emitter;
}
```

## Fluxo de Dados Completo

1. **Usuário → Angular**: O usuário digita um texto na interface e clica em "Enviar"
2. **Angular → Spring Boot**: O componente Angular chama o serviço que envia uma requisição POST para a API Spring Boot
3. **Spring Boot → Processamento**: A API processa o texto e divide em palavras individuais
4. **Spring Boot → Angular**: Cada palavra é enviada como um evento SSE separado
5. **Angular → Processamento SSE**: O serviço Angular recebe, decodifica e processa os eventos SSE
6. **Angular → Usuário**: O componente Angular atualiza a interface com cada palavra recebida

## Desafios e Soluções Técnicas

### Desafio 1: Consumo de SSE com POST

Embora o protocolo SSE seja tipicamente usado com requisições GET, nosso caso exigia o envio de dados complexos via POST. Isso criou um desafio, pois a API `EventSource` nativa só suporta métodos GET.

**Solução**: Implementamos uma abordagem personalizada utilizando a API Fetch com `ReadableStream` para processar manualmente os eventos SSE.

### Desafio 2: Processamento de Chunks Parciais

Os dados SSE podem chegar em chunks incompletos, onde um evento pode ser dividido em múltiplas partes.

**Solução**: Implementamos um sistema de buffer que acumula dados até identificar linhas completas de eventos SSE.

### Desafio 3: Formatação do Texto Recebido

Como cada palavra é recebida separadamente, era necessário garantir a formatação correta no frontend.

**Solução**: Adicionamos um espaço após cada palavra recebida para manter a legibilidade do texto.

## Como Usar

1. **Iniciar o Backend**: Execute a aplicação Spring Boot (porta 8080)
2. **Iniciar o Frontend**: Execute `ng serve` na pasta do projeto Angular (porta 4200)
3. **Acessar a Interface**: Abra http://localhost:4200 em um navegador
4. **Enviar Texto**: Digite um texto na caixa, clique em "Enviar" e observe o streaming em tempo real

## Conclusão

Este projeto demonstra como implementar com sucesso a comunicação em streaming entre um frontend Angular e uma API Spring Boot usando o protocolo SSE. A abordagem adotada permite uma experiência em tempo real similar à dos modernos LLMs, onde as respostas são exibidas gradualmente ao usuário.

A implementação é eficiente, baseada em padrões web modernos e oferece uma boa experiência de usuário com atualizações incrementais da interface.
