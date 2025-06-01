import { GameRecommendationState } from '../state';
import { createOpenRouterModel, withStructuredOutput } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { zodSchemaToPromptDescription } from '../utils';
import { z } from 'zod';

const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert at refining search strategies for game recommendations when initial results are insufficient.
    
    Original User Request: {userRequest}
    Previous Search Query: {previousSearchQuery}
    Search Strategy: {searchStrategy}
    Issues Found: {issues}
    Retry Count: {retryCount}
    
    Based on the issues and strategy, generate improved search approaches:
    
    1. If strategy is "broad" - create more specific, targeted queries
    2. If strategy is "specific" - create broader, more inclusive queries  
    3. If strategy is "standard" - adapt based on the specific issues
    
    Guidelines for refinement:
    - If insufficient results: broaden the search with more general terms
    - If irrelevant results: add more specific constraints and keywords
    - If missing specific genres: include genre-specific terms
    - If missing platforms: add platform-specific searches
    - Use synonyms and alternative phrasings
    - Consider different search angles (reviews, lists, comparisons)
    
    {promptSchema}
    `);

export async function refineSearch(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const refinement = await generateRefinedSearch(state);

  const newRetryCount = (state.retryCount || 0) + 1;

  return {
    searchQuery: refinement.primarySearchQuery,
    alternativeSearchQueries: refinement.alternativeQueries,
    searchStrategy: refinement.newStrategy,
    retryCount: newRetryCount,
    // Clear previous results to start fresh
    rawSearchResults: undefined,
    gameNames: undefined,
    gameDescriptions: undefined,
    gamePriceInfo: undefined,
    games: state.games?.filter(game => game.description !== '' && game.currentPrice !== null),
  };
}

const SearchRefinementSchema = z.object({
  primarySearchQuery: z.string(),
  alternativeQueries: z.array(z.string()),
  newStrategy: z.enum(['standard', 'broad', 'specific']),
  reasoning: z.string(),
});

type SearchRefinement = z.infer<typeof SearchRefinementSchema>;

const generateRefinedSearch = async (state: GameRecommendationState): Promise<SearchRefinement> => {
  const modelConfig = loadModelConfig(process.env.REFINE_SEARCH_MODEL);
  const model = withStructuredOutput(createOpenRouterModel(modelConfig), SearchRefinementSchema);

  try {
    const templateContents = await prompt.invoke({
      userRequest: state.userRequest,
      previousSearchQuery: state.searchQuery || 'No previous query',
      searchStrategy: state.searchStrategy || 'standard',
      issues: state.qualityAssessment?.issues?.join(', ') || 'No specific issues',
      retryCount: state.retryCount || 0,
      promptSchema: zodSchemaToPromptDescription(SearchRefinementSchema),
    });

    const response = await model.invoke(templateContents);

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error refining search:', error);
    return createFallbackRefinement(state);
  }
};

const createFallbackRefinement = (state: GameRecommendationState): SearchRefinement => {
  const retryCount = state.retryCount || 0;
  const originalQuery = state.searchQuery || state.userRequest;

  if (retryCount === 0) {
    // First retry: make it broader
    return {
      primarySearchQuery: `best games ${originalQuery} recommendations reviews`,
      alternativeQueries: [`top ${originalQuery} games`, `${originalQuery} game suggestions`],
      newStrategy: 'broad',
      reasoning: 'Broadening search for more results',
    };
  } else {
    // Second retry: try different approach
    return {
      primarySearchQuery: `${originalQuery} similar games like`,
      alternativeQueries: [`${originalQuery} genre games`, `games for ${originalQuery} fans`],
      newStrategy: 'specific',
      reasoning: 'Trying alternative search approach',
    };
  }
};
