import { ModelEnvironmentConfig, ModelProvider } from '../models/modelFactory';
import dotenv from 'dotenv';

// Load environment variables from .env.config
dotenv.config({ path: '.env.config' });

// Default model configurations
const DEFAULT_MODEL_PROVIDER = ModelProvider.GEMINI;
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;
const DEFAULT_VERBOSE = true;

/**
 * Loads model configuration from environment variables
 */
export function loadModelConfig(): ModelEnvironmentConfig {
  // Get provider from env or use default
  const providerString = process.env.MODEL_PROVIDER?.toLowerCase() || DEFAULT_MODEL_PROVIDER;
  const provider =
    (Object.values(ModelProvider).find(p => p === providerString) as ModelProvider) ||
    DEFAULT_MODEL_PROVIDER;

  // Provider-specific configuration
  switch (provider) {
    case ModelProvider.GEMINI:
      return {
        provider,
        modelName: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
        apiKey: process.env.GEMINI_API_KEY!,
        temperature: parseFloat(process.env.MODEL_TEMPERATURE || '') || DEFAULT_TEMPERATURE,
        maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '') || DEFAULT_MAX_OUTPUT_TOKENS,
        verbose: process.env.MODEL_VERBOSE === 'true' || DEFAULT_VERBOSE,
      };
    // Add additional providers as needed
    default:
      return {
        provider: ModelProvider.GEMINI,
        modelName: DEFAULT_GEMINI_MODEL,
        apiKey: process.env.GEMINI_API_KEY!,
        temperature: DEFAULT_TEMPERATURE,
        maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
        verbose: DEFAULT_VERBOSE,
      };
  }
}
