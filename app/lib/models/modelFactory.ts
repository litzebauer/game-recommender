import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ZodSchema } from 'zod';
import { ModelConfig, ModelFactory } from './baseModel';
import { GeminiModelFactory } from './geminiModel';
import { ClaudeModelFactory } from './claudeModel';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from '@langchain/anthropic';
import { Runnable } from '@langchain/core/runnables';

// Enum of supported model providers
export enum ModelProvider {
  GEMINI = 'gemini',
  CLAUDE = 'claude',
  // Add more providers as needed: OPENAI, ANTHROPIC, etc.
}

// Model-specific configuration extracted from environment
export interface ModelEnvironmentConfig {
  provider: ModelProvider;
  modelName: string;
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number;
  verbose?: boolean;
}

export class ModelManager {
  private factories: Map<ModelProvider, ModelFactory>;

  constructor() {
    this.factories = new Map();
    this.factories.set(ModelProvider.GEMINI, new GeminiModelFactory());
    this.factories.set(ModelProvider.CLAUDE, new ClaudeModelFactory());
    // Register additional model factories here as they're implemented
  }

  createModel(config: ModelEnvironmentConfig): BaseChatModel {
    const factory = this.factories.get(config.provider);

    if (!factory) {
      throw new Error(`Model provider ${config.provider} is not supported`);
    }

    const modelConfig: ModelConfig = {
      modelName: config.modelName,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      apiKey: config.apiKey,
      verbose: config.verbose,
    };

    return factory.createModel(modelConfig);
  }

  withStructuredOutput(model: BaseChatModel, schema: ZodSchema): Runnable {
    const provider = this.getProviderFromModel(model);
    const factory = this.factories.get(provider);

    if (!factory) {
      throw new Error(`Could not determine model provider for structured output`);
    }

    // Apply structured output while preserving the original model instance
    return factory.withStructuredOutput(model, schema);
  }

  private getProviderFromModel(model: BaseChatModel): ModelProvider {
    if (model instanceof ChatGoogleGenerativeAI) {
      return ModelProvider.GEMINI;
    }

    if (model instanceof ChatAnthropic) {
      return ModelProvider.CLAUDE;
    }

    // Add more model type checks as needed

    throw new Error(`Could not determine model provider for type ${model.constructor.name}`);
  }
}
