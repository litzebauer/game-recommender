import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';
import { Runnable } from '@langchain/core/runnables';

export interface OpenRouterConfig {
  modelName: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  verbose?: boolean;
}

/**
 * Creates an OpenRouter model instance using the ChatOpenAI class
 * with OpenRouter's base URL
 */
export function createOpenRouterModel(config: OpenRouterConfig): BaseChatModel {
  return new ChatOpenAI({
    model: config.modelName,
    apiKey: config.apiKey,
    temperature: config.temperature ?? 0.2,
    maxTokens: config.maxTokens ?? 4096,
    verbose: config.verbose ?? false,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_TITLE || 'Game Recommender Chatbot',
      },
    },
  });
}

/**
 * Creates a model with structured output using Zod schema
 */
export function withStructuredOutput<T>(
  model: BaseChatModel,
  schema: ZodSchema<T>
): Runnable<any, T> {
  return model.withStructuredOutput(schema) as Runnable<any, T>;
}

/**
 * Convenience function to create a model with structured output in one call
 */
export function createStructuredOpenRouterModel<T>(
  config: OpenRouterConfig,
  schema: ZodSchema<T>
): Runnable<any, T> {
  const model = createOpenRouterModel(config);
  return withStructuredOutput(model, schema);
}
