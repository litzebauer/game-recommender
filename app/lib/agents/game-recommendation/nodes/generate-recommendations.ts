import { GameRecommendationState } from '../state';
import { GameRecommendation, gameRecommendationSchema } from '../../../schemas/gameRecommendation';
import { ModelManager } from '../../../models/modelFactory';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Schema for the final recommendation selection
const finalRecommendationsSchema = z.object({
  recommendations: z.array(gameRecommendationSchema).max(5),
});

export async function generateRecommendations(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  // If we have no games to work with, return empty
  if (!state.gameRecommendations || state.gameRecommendations.length === 0) {
    return {
      gameRecommendations: [],
    };
  }

  // If we already have 5 or fewer games, enhance their reasoning
  if (state.gameRecommendations.length <= 5) {
    const enhancedRecommendations = await enhanceRecommendationReasoning(
      state.userRequest,
      state.gameRecommendations
    );
    return {
      gameRecommendations: enhancedRecommendations,
    };
  }

  // If we have more than 5 games, select the best 5 with enhanced reasoning
  const selectedRecommendations = await selectTopRecommendations(
    state.userRequest,
    state.gameRecommendations
  );

  return {
    gameRecommendations: selectedRecommendations,
  };
}

const enhanceRecommendationReasoning = async (
  userRequest: string,
  gameRecommendations: GameRecommendation[]
): Promise<GameRecommendation[]> => {
  // Create the model with structured output
  const modelConfig = loadModelConfig();
  const modelManager = new ModelManager();
  const model = modelManager.createModel(modelConfig);
  const structuredModel = modelManager.withStructuredOutput(model, finalRecommendationsSchema);

  // Create a prompt template for enhancing reasoning
  const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert game recommendation specialist. Your task is to enhance the reasoning for each game recommendation to clearly explain why each game matches the user's request.

User's Original Request: {userRequest}

Current Game Recommendations:
{gameRecommendations}

Instructions:
- Enhance the reasoning for each game to explain why it's a perfect match for the user's request
- Make the reasoning personal and specific to what the user asked for
- Highlight unique features, gameplay elements, or aspects that directly address the user's preferences
- Include information about pricing/discounts if available and relevant
- Keep the reasoning concise and to the point (3 sentences maximum)
- Maintain all existing game information (name, description, platforms, pricing, etc.)
- Return the top 5 recommendations with the best reasoning

Return the enhanced recommendations with improved reasoning:
`);

  try {
    const chain = prompt.pipe(structuredModel);
    const response = await chain.invoke({
      userRequest,
      gameRecommendations: JSON.stringify(gameRecommendations, null, 2),
    });

    const parsed = finalRecommendationsSchema.parse(response);
    return parsed.recommendations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error enhancing recommendation reasoning:', error);
    // Fallback to original recommendations if enhancement fails
    return gameRecommendations;
  }
};

const selectTopRecommendations = async (
  userRequest: string,
  gameRecommendations: GameRecommendation[]
): Promise<GameRecommendation[]> => {
  // Create the model with structured output
  const modelConfig = loadModelConfig();
  const modelManager = new ModelManager();
  const model = modelManager.createModel(modelConfig);
  const structuredModel = modelManager.withStructuredOutput(model, finalRecommendationsSchema);

  // Create a prompt template for selecting and enhancing recommendations
  const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert game recommendation specialist. Your task is to select the TOP 5 most relevant games from the provided list and enhance their reasoning.

User's Original Request: {userRequest}

Available Game Recommendations:
{gameRecommendations}

Instructions:
- Select the 5 BEST games that most closely match the user's request
- Prioritize diversity in genres/types unless the user specifically requested a particular genre
- Consider factors like: relevance to user request, game quality, availability, pricing value
- For each selected game, provide compelling reasoning (2-3 sentences minimum) that explains:
  * Why this game perfectly matches what the user is looking for
  * What unique features or gameplay elements make it special
  * How it addresses the specific preferences mentioned in the user's request
  * Include pricing information if it adds value (discounts, good deals, etc.)
- Maintain all existing game information (name, description, platforms, pricing, etc.)
- Ensure recommendations are diverse and offer different gaming experiences

Return exactly 5 game recommendations with enhanced reasoning:
`);

  try {
    const chain = prompt.pipe(structuredModel);
    const response = await chain.invoke({
      userRequest,
      gameRecommendations: JSON.stringify(gameRecommendations, null, 2),
    });

    const parsed = finalRecommendationsSchema.parse(response);
    return parsed.recommendations;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error selecting top recommendations:', error);
    // Fallback to first 5 recommendations if selection fails
    return gameRecommendations.slice(0, 5);
  }
};
