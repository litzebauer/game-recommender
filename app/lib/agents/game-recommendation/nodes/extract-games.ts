import { GameRecommendation, gameRecommendationSchema } from '../../../schemas/gameRecommendation';
import { GameRecommendationState } from '../state';
import { ModelManager } from '../../../models/modelFactory';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Schema for multiple game recommendations wrapped in an object (required for Anthropic structured output)
const gameRecommendationsSchema = z.object({
  recommendations: z.array(gameRecommendationSchema),
});

export async function extractGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const gameRecommendations = await parseGamesFromResults(state.rawSearchResults!);

  return {
    gameRecommendations,
    rawSearchResults: undefined, // Clear to save tokens
  };
}

const parseGamesFromResults = async (rawSearchResults: string[]): Promise<GameRecommendation[]> => {
  // Create the model with structured output
  const modelConfig = loadModelConfig();
  const modelManager = new ModelManager();
  const model = modelManager.createModel(modelConfig);
  const structuredModel = modelManager.withStructuredOutput(model, gameRecommendationsSchema);

  // Create a prompt template for extracting game information
  const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert at analyzing gaming content and extracting structured game recommendations.

Your task is to analyze the provided search results about video games and extract detailed game information to create recommendations.

Guidelines:
- Extract ALL games mentioned in the search results that seem worth recommending
- For each game, extract as much information as possible including name, description, platforms, genre, playtime
- Do NOT include pricing information (currentPrice, originalPrice, discount) - this will be handled separately
- Provide clear reasoning for why each game would be a good recommendation based on the search context
- Focus on games that seem most relevant and well-reviewed based on the search results
- Ensure descriptions are informative and capture what makes each game unique
- Include as many quality games as you can find in the search results

Search Results:
{rawSearchResults}

Extract game recommendations with structured information. Return a JSON object with a "recommendations" array containing the game recommendations:
`);

  try {
    // Create a chain that pipes the prompt to the structured model
    const chain = prompt.pipe(structuredModel);
    const response = await chain.invoke({ rawSearchResults });

    // Extract the recommendations array from the response object
    const parsed = gameRecommendationsSchema.parse(response);
    return parsed.recommendations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing games from results:', error);

    // Fallback to a empty array if LLM parsing fails
    return [];
  }
};
