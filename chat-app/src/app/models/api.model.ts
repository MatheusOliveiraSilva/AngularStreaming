// Modelo para a requisição enviada ao Spring Boot
export interface QueryRequest {
  input: string;
  memory_config: MemoryConfig;
}

export interface MemoryConfig {
  configurable: ConfigurableMemory;
}

export interface ConfigurableMemory {
  thread_id: string;
}

// Modelo para as respostas do streaming
export interface ChunkResponse {
  content: string;
  meta?: {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    langgraph_checkpoint_ns: string;
    checkpoint_ns: string;
    ls_provider: string;
    ls_model_name: string;
    ls_model_type: string;
    ls_temperature: number;
    ls_max_tokens: number;
  };
} 