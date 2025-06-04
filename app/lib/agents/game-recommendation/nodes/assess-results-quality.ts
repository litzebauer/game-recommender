import { GameRecommendationState, QualityAssessment } from '../state';
import { createOpenRouterModel } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const promptTemplate = ChatPromptTemplate.fromTemplate(`
    You are an expert at evaluating the quality of game search results and data completeness.
    
    Evaluate the following data for a game recommendation request:
    
    Original User Request: {userRequest}
    Search Query Used: {searchQuery}
    Number of Games Extracted: {gamesCount}
    Number of Games with Descriptions: {descriptionsCount}
    Number of Games with Price Info: {pricesCount}
    
    Assess the quality and provide a JSON response:
    {{
      "searchResultsQuality": "excellent" | "good" | "poor" | "insufficient",
      "gameDataCompleteness": 0.0-1.0,
      "recommendationConfidence": 0.0-1.0,
      "needsRefinement": boolean,
      "issues": ["list", "of", "specific", "issues"],
      "suggestions": ["list", "of", "improvement", "suggestions"]
    }}
    
    Quality Guidelines:
    - Excellent: 9+ relevant games, complete data, perfect match to request
    - Good: 6-8 relevant games, mostly complete data, good match
    - Poor: 3-5 games, incomplete data, partial match
    - Insufficient: <3 games or very poor relevance
    
    Data Completeness: Ratio of complete game records (with descriptions, prices, etc.)
    Recommendation Confidence: How confident you are that these results will satisfy the user
    `);

export async function assessResultsQuality(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const assessment = await evaluateQuality(state);

  // Update decision flags based on quality assessment
  const updatedDecisionFlags = {
    ...state.decisionFlags,
    shouldRetrySearch: assessment.needsRefinement && (state.retryCount || 0) < 2,
    shouldExpandSearch:
      assessment.searchResultsQuality === 'insufficient' && (state.retryCount || 0) < 1,
    shouldUseAlternativeStrategy:
      assessment.searchResultsQuality === 'poor' && (state.retryCount || 0) >= 1,
  };

  return {
    qualityAssessment: assessment,
    decisionFlags: updatedDecisionFlags,
  };
}

const evaluateQuality = async (state: GameRecommendationState): Promise<QualityAssessment> => {
  const modelConfig = loadModelConfig(process.env.ASSESS_RESULTS_MODEL);
  const model = createOpenRouterModel(modelConfig);

  try {
    const counts = state.games?.reduce(
      (acc, game) => {
        acc.descriptionsCount += game.description ? 1 : 0;
        acc.pricesCount += game.currentPrice ? 1 : 0;
        return acc;
      },
      { descriptionsCount: 0, pricesCount: 0, gamesCount: state.games?.length || 0 }
    );

    const prompt = await promptTemplate.invoke({
      userRequest: state.userRequest,
      searchQuery: state.searchQuery || 'No search query',
      gamesCount: counts.gamesCount || 0,
      descriptionsCount: counts.descriptionsCount || 0,
      pricesCount: counts.pricesCount || 0,
    });

    const response = await model.invoke(prompt);
    const content =
      typeof response.content === 'string'
        ? response.content.trim()
        : response.content.toString().trim();

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        searchResultsQuality: parsed.searchResultsQuality || 'poor',
        gameDataCompleteness: parsed.gameDataCompleteness || 0.5,
        recommendationConfidence: parsed.recommendationConfidence || 0.5,
        needsRefinement: parsed.needsRefinement || false,
        issues: parsed.issues || [],
      };
    }

    // Fallback assessment based on data availability
    return createFallbackAssessment(state);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error evaluating results quality:', error);
    return createFallbackAssessment(state);
  }
};

const createFallbackAssessment = (state: GameRecommendationState): QualityAssessment => {
  const gamesCount = state.games?.length || 0;
  const descriptionsCount = state.gameDescriptions?.length || 0;
  const pricesCount = state.gamePriceInfo?.length || 0;

  let quality: QualityAssessment['searchResultsQuality'] = 'insufficient';
  if (gamesCount >= 8) quality = 'excellent';
  else if (gamesCount >= 5) quality = 'good';
  else if (gamesCount >= 2) quality = 'poor';

  const completeness = gamesCount > 0 ? (descriptionsCount + pricesCount) / (gamesCount * 2) : 0;

  return {
    searchResultsQuality: quality,
    gameDataCompleteness: Math.min(completeness, 1.0),
    recommendationConfidence: gamesCount >= 5 ? 0.8 : gamesCount >= 2 ? 0.6 : 0.3,
    needsRefinement: gamesCount < 5 || completeness < 0.7,
    issues: gamesCount < 5 ? ['Insufficient games found'] : [],
  };
};
