import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';

export interface ModelConfig {
  modelName: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
  verbose?: boolean;
}

export interface ModelFactory {
  createModel(config: ModelConfig): BaseChatModel;
  withStructuredOutput(model: BaseChatModel, schema: ZodSchema): BaseChatModel;
}
