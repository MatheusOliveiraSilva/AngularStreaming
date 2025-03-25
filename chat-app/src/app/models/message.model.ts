export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
} 