import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';
import { ModelConfig, ModelFactory } from './baseModel';

export class GeminiModelFactory implements ModelFactory {
  createModel(config: ModelConfig): BaseChatModel {
    return new ChatGoogleGenerativeAI({
      model: config.modelName,
      maxOutputTokens: config.maxOutputTokens || 4096,
      temperature: config.temperature || 0.2,
      apiKey: config.apiKey,
      verbose: config.verbose || false,
    });
  }

  withStructuredOutput(model: BaseChatModel, schema: ZodSchema): BaseChatModel {
    if (model instanceof ChatGoogleGenerativeAI) {
      model.withStructuredOutput(schema);
      return model;
    }
    throw new Error('Model is not a ChatGoogleGenerativeAI instance');
  }
}
