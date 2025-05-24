import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';
import { ModelConfig, ModelFactory } from './baseModel';
import { Runnable } from '@langchain/core/runnables';

export class ClaudeModelFactory implements ModelFactory {
  createModel(config: ModelConfig): BaseChatModel {
    return new ChatAnthropic({
      model: config.modelName || 'claude-3-5-haiku-20241022',
      maxTokens: config.maxOutputTokens || 4096,
      temperature: config.temperature || 0.2,
      apiKey: config.apiKey,
      verbose: config.verbose || false,
    });
  }

  withStructuredOutput(model: BaseChatModel, schema: ZodSchema): Runnable {
    if (model instanceof ChatAnthropic) {
      return model.withStructuredOutput(schema);
    }
    throw new Error('Model is not a ChatAnthropic instance');
  }
}
