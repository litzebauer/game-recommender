import { GameRecommendationState } from '../state';
import { GameRecommendation, gameRecommendationSchema } from '../../../schemas/gameRecommendation';
import { Game } from '../../../schemas/gameRecommendation';
import { createStructuredOpenRouterModel } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { zodSchemaToPromptDescription } from '../utils';

const MAX_RECOMMENDATIONS = 6;

// Schema for the final recommendation selection
const finalRecommendationsSchema = z.object({
  recommendations: z.array(gameRecommendationSchema).max(MAX_RECOMMENDATIONS),
});

const schemaPrompt = zodSchemaToPromptDescription(finalRecommendationsSchema);
// Create a prompt template for generating game recommendations with reasoning
const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert game recommendation specialist. Your task is to create compelling game recommendations with detailed reasoning for why each game matches the user's request.
    
    User's Original Request: {userRequest}
    
    Available Games:
    {gameDescriptions}
    
    Instructions:
    - Select the TOP 5 most relevant games from the provided list
    - For each selected game, provide compelling reasoning (2-3 sentences) that explains:
      * Why this game perfectly matches what the user is looking for
      * What unique features or gameplay elements make it special
      * How it addresses the specific preferences mentioned in the user's request
      * Include pricing information if it adds value (discounts, good deals, etc.)
    - Prioritize diversity in genres/types unless the user specifically requested a particular genre
    - Consider factors like: relevance to user request, game quality, availability, pricing value
    - Ensure recommendations offer different gaming experiences when possible
    
    Return exactly ${MAX_RECOMMENDATIONS} game recommendations with detailed reasoning.

    ${schemaPrompt}
    `);

export async function generateRecommendations(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  // If we have no games to work with, return empty
  if (!state.gameDescriptions || state.gameDescriptions.length === 0) {
    return {
      gameRecommendations: [],
    };
  }

  // At this point, gameDescriptions contains Game[] objects (after combine step)
  const games = state.gameDescriptions as Game[];

  // Create game recommendations from the combined game data
  const gameRecommendations = await createRecommendationsFromGames(state.userRequest, games);

  return {
    gameRecommendations,
    gameDescriptions: undefined, // Clear to save memory
  };
}

const createRecommendationsFromGames = async (
  userRequest: string,
  games: Game[]
): Promise<GameRecommendation[]> => {
  if (!games || games.length === 0) {
    return [];
  }

  // Create the model with structured output
  const modelConfig = loadModelConfig();
  const structuredModel = createStructuredOpenRouterModel(modelConfig, finalRecommendationsSchema);

  try {
    const promptContents = await prompt.invoke({
      userRequest,
      gameDescriptions: JSON.stringify(games, null, 2),
    });
    const response = await structuredModel.invoke(promptContents);

    const parsed = finalRecommendationsSchema.parse(response);
    return parsed.recommendations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating game recommendations:', error);

    // Fallback: create basic recommendations from the first MAX_RECOMMENDATIONS games
    return games.slice(0, MAX_RECOMMENDATIONS).map(game => ({
      game,
      reasoning: `${game.name} appears to be a relevant game based on your request. It offers ${game.genre || 'various gameplay elements'} and could be a good match for your preferences.`,
    }));
  }
};
