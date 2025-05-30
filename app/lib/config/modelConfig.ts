import { OpenRouterConfig } from '../models/openrouter';
import dotenv from 'dotenv';

// Load environment variables from .env.config and .env files
// .env takes precedence over .env.config
dotenv.config({ path: '.env.config' });
dotenv.config({ path: '.env' });

// Default model configurations
const DEFAULT_MODEL_NAME = 'anthropic/claude-3.7-sonnet';
const DEFAULT_TEMPERATURE = 0;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_VERBOSE = false;

/**
 * Loads OpenRouter model configuration from environment variables
 */
export function loadModelConfig(modelName?: string): OpenRouterConfig {
  return {
    modelName: modelName || process.env.DEFAULT_MODEL_NAME || DEFAULT_MODEL_NAME,
    apiKey: process.env.OPENROUTER_API_KEY!,
    temperature: parseFloat(process.env.MODEL_TEMPERATURE || '') || DEFAULT_TEMPERATURE,
    maxTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '') || DEFAULT_MAX_TOKENS,
    verbose: process.env.MODEL_VERBOSE === 'true' || DEFAULT_VERBOSE,
  };
}
