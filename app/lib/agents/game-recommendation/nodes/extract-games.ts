import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { GameRecommendationState } from '../state';
import { createStructuredOpenRouterModel } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { generateGameId } from '../utils';

// Create a prompt template for extracting game names
const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert at analyzing gaming content and extracting game names.
    
    Your task is to analyze the provided search results about video games and extract just the names of games that seem worth recommending.
    
    Guidelines:
    - Extract ALL game names mentioned in the search results that seem worth recommending
    - Return only the game names, not descriptions or other details
    - Focus on games that seem most relevant and well-reviewed based on the search results
    - Include as many quality games as you can find in the search results
    - Return just the exact game titles/names
    
    Search Results:
    {rawSearchResults}
    
    Extract game names. Return a JSON object with a "gameNames" array containing just the game names as strings:
    `);

// Schema for game names array wrapped in an object (required for Anthropic structured output)
const gameNamesSchema = z.object({
  gameNames: z.array(z.string()),
});

export async function extractGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const gameNames = await parseGameNamesFromResults(state.rawSearchResults!);
  const existingGamesSet = new Set(state.games?.map(game => game.id));
  // Filter out games that already exist in the state
  const newGameNames = gameNames.filter(name => !existingGamesSet.has(generateGameId(name)));

  return {
    gameNames: newGameNames,
    rawSearchResults: undefined, // Clear to save tokens
  };
}

const parseGameNamesFromResults = async (rawSearchResults: string[]): Promise<string[]> => {
  // Create the model with structured output
  const modelConfig = loadModelConfig();
  const structuredModel = createStructuredOpenRouterModel(modelConfig, gameNamesSchema);

  try {
    const promptContents = await prompt.invoke({ rawSearchResults });
    const response = await structuredModel.invoke(promptContents);

    // Extract the gameNames array from the response object
    const parsed = gameNamesSchema.parse(response);
    return parsed.gameNames;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing game names from results:', error);

    // Fallback to an empty array if LLM parsing fails
    return [];
  }
};
