import { OpenRouterConfig } from '../models/openrouter';
import dotenv from 'dotenv';

// Load environment variables from .env.config
dotenv.config({ path: '.env.config' });

// Default model configurations
const DEFAULT_MODEL_NAME = 'anthropic/claude-3.7-sonnet';
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_VERBOSE = true;

/**
 * Loads OpenRouter model configuration from environment variables
 */
export function loadModelConfig(): OpenRouterConfig {
  return {
    modelName: process.env.OPENROUTER_MODEL || DEFAULT_MODEL_NAME,
    apiKey: process.env.OPENROUTER_API_KEY!,
    temperature: parseFloat(process.env.MODEL_TEMPERATURE || '') || DEFAULT_TEMPERATURE,
    maxTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '') || DEFAULT_MAX_TOKENS,
    verbose: process.env.MODEL_VERBOSE === 'true' || DEFAULT_VERBOSE,
  };
}
