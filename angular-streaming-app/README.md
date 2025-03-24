# Angular Streaming com SSE

Este projeto é uma aplicação Angular que demonstra como implementar streaming de dados em tempo real usando Server-Sent Events (SSE). A aplicação consome uma API Spring Boot que fornece streaming de tokens e respostas simuladas de LLM.

## Funcionalidades

- **Streaming de Tokens**: Recebe tokens individuais de um texto enviado para a API
- **Streaming de LLM**: Recebe uma resposta simulada de um modelo de linguagem, palavra por palavra

## Tecnologias Utilizadas

- Angular 19+
- TypeScript
- RxJS
- Server-Sent Events (SSE)

## Estrutura do Projeto

```
angular-streaming-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── token-stream/       # Componente para exibir tokens
│   │   │   └── llm-stream/         # Componente para exibir resposta do LLM
│   │   ├── services/
│   │   │   └── streaming.service.ts # Serviço para comunicação com a API
│   │   ├── app.component.*         # Componente principal
│   │   ├── app.config.ts           # Configuração da aplicação
│   │   └── app.routes.ts           # Rotas da aplicação
│   ├── index.html
│   └── main.ts
├── proxy.conf.json                 # Configuração de proxy para evitar CORS
└── package.json
```

## Pré-requisitos

- Node.js (recomendado v16+)
- Angular CLI
- API Spring Boot de streaming rodando na porta 8080

## Como Executar

1. Clone este repositório
2. Instale as dependências:
   ```
   cd angular-streaming-app
   npm install
   ```
3. Certifique-se de que a API Spring Boot esteja rodando na porta 8080
4. Inicie a aplicação Angular:
   ```
   npm start
   ```
5. Acesse a aplicação em: `http://localhost:4200`

## Funcionamento

### Server-Sent Events (SSE)

O projeto utiliza Server-Sent Events para estabelecer uma conexão unidirecional entre servidor e cliente, permitindo que o servidor envie dados para o cliente em tempo real. 

No Angular, isso é implementado através da API nativa `EventSource` que é encapsulada em observables do RxJS para melhor integração com o Angular.

### Fluxo de Dados

1. O cliente inicia uma conexão SSE com o servidor
2. O servidor mantém a conexão aberta e envia dados incrementalmente
3. O cliente recebe os dados e atualiza a interface em tempo real
4. Quando o streaming termina, o servidor fecha a conexão

## API Backend

A API de backend possui dois endpoints principais:

- `/api/stream/tokens`: Recebe um prompt e retorna os tokens um a um
- `/api/stream/llm`: Simula a resposta de um LLM, retornando palavras uma a uma

## Licença

Este projeto está licenciado sob a licença MIT.
