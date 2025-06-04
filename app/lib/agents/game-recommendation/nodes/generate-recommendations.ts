import { GameRecommendationState } from '../state';
import {
  GameRecommendation,
  gameRecommendationSchema,
  gameSchema,
} from '../../../schemas/gameRecommendation';
import { Game } from '../../../schemas/gameRecommendation';
import { createStructuredOpenRouterModel } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { zodSchemaToPromptDescription } from '../utils';

const MAX_RECOMMENDATIONS = 6;

// Schema for the final recommendation selection
const finalRecommendationsSchema = z.object({
  recommendations: z
    .array(
      z.object({
        gameId: gameSchema.shape.id.describe('EXACT_GAME_ID_FROM_INPUT'),
        reasoning: gameRecommendationSchema.shape.reasoning.describe(
          "Why this game matches the user's request."
        ),
      })
    )
    .max(MAX_RECOMMENDATIONS),
});

const schemaPrompt = zodSchemaToPromptDescription(finalRecommendationsSchema);
// Create a prompt template for generating game recommendations with reasoning
const promptTemplate = ChatPromptTemplate.fromTemplate(`
    You are an expert game recommendation specialist. Your task is to create compelling game recommendations with detailed reasoning for why each game matches the user's request.
    
    User's Original Request: {userRequest}
    
    Available Games (see full list below):
    Each game object has a unique \`"id"\` field. You must only use the exact value from the \`"id"\` field when creating recommendations.
    {gameDescriptions}
    
    Instructions:
    - Select the TOP ${MAX_RECOMMENDATIONS} most relevant games from the provided list
    - Do not invent or modify game IDS.
    - Use the \`"id"\` field of each game as the \`gameId\` in your output.
    - For each selected game, provide concise and compelling reasoning (2-3 sentences) that explains:
      * Why this game perfectly matches what the user is looking for
      * What unique features or gameplay elements make it special
      * How it addresses the specific preferences mentioned in the user's request
      * Include pricing information if it adds value (discounts, good deals, etc.)
    - Prioritize diversity in genres/types unless the user specifically requested a particular genre
    - Consider factors like: relevance to user request, game quality, availability, pricing value
    - Ensure recommendations offer different gaming experiences when possible
    
    ${schemaPrompt}
    `);

export async function generateRecommendations(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  // If we have no games to work with, return empty
  if (!state.games || state.games.length === 0) {
    return {
      gameRecommendations: [],
    };
  }

  // Create game recommendations from the combined game data
  const gameRecommendations = await createRecommendationsFromGames(state.userRequest, state.games);

  return {
    gameRecommendations,
    games: undefined, // Clear to save memory
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
  const modelConfig = loadModelConfig(process.env.GENERATE_RECOMMENDATIONS_MODEL);
  const structuredModel = createStructuredOpenRouterModel(modelConfig, finalRecommendationsSchema);

  try {
    const prompt = await promptTemplate.invoke({
      userRequest,
      gameDescriptions: JSON.stringify(games, null, 2),
    });
    const response = await structuredModel.invoke(prompt);

    const parsed = finalRecommendationsSchema.parse(response);
    return mapRecommendationsToGames(parsed.recommendations, games);
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

const mapRecommendationsToGames = (
  recommendations: Array<{ gameId: string; reasoning: string }>,
  games: Game[]
): GameRecommendation[] => {
  return recommendations.map(recommendation => {
    const game = games.find(game => game.id === recommendation.gameId);
    if (!game) {
      throw new Error(`Game with id ${recommendation.gameId} not found`);
    }
    return {
      game,
      reasoning: recommendation.reasoning,
    };
  });
};
