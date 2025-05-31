import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { GameRecommendationState, DecisionFlags } from '../state';
import { createOpenRouterModel, withStructuredOutput } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { zodSchemaToPromptDescription } from '../utils';

const prompt = ChatPromptTemplate.fromTemplate(`
    You are an expert at analyzing game recommendation requests to determine their complexity and requirements.
    
    Analyze the following user request and determine:
    1. Is this a complex query requiring specialized handling?
    2. Does it need broad search or specific search?
    3. Are there multiple distinct preferences that might require different search strategies?
    4. Does it mention specific games, genres, or very niche requirements?
    
    User Request: {userRequest}
        
    Guidelines:
    - Complex queries: Multiple conflicting preferences, very specific requirements, or requests for games "like X but different in Y way"
    - Specialized search: Mentions specific franchises, indie games, retro games, or very niche genres
    - Standard: Simple genre requests or basic preferences
    - Broad: Vague requests like "something fun" or "good games"
    - Specific: Detailed requirements with clear criteria

    {promptSchema}
    `);

export async function assessQueryComplexity(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const analysis = await analyzeQueryComplexity(state.userRequest);

  const decisionFlags: DecisionFlags = {
    shouldRetrySearch: false,
    shouldExpandSearch: false,
    shouldUseAlternativeStrategy: false,
    isComplexQuery: analysis.isComplexQuery,
    requiresSpecializedSearch: analysis.requiresSpecializedSearch,
  };

  return {
    decisionFlags,
    searchStrategy: analysis.searchStrategy,
    retryCount: 0,
    alternativeSearchQueries: [],
  };
}

type QueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

const QueryAnalysisSchema = z.object({
  isComplexQuery: z.boolean(),
  requiresSpecializedSearch: z.boolean(),
  searchStrategy: z.enum(['standard', 'broad', 'specific']),
  reasoning: z.string(),
});

const analyzeQueryComplexity = async (userRequest: string): Promise<QueryAnalysis> => {
  const modelConfig = loadModelConfig(process.env.ANALYZE_QUERY_MODEL);
  const model = withStructuredOutput(createOpenRouterModel(modelConfig), QueryAnalysisSchema);

  try {
    const templateContents = await prompt.invoke({
      userRequest,
      promptSchema: zodSchemaToPromptDescription(QueryAnalysisSchema),
    });
    const response = await model.invoke(templateContents);

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error analyzing query complexity:', error);
    return {
      isComplexQuery: false,
      requiresSpecializedSearch: false,
      searchStrategy: 'standard',
      reasoning: 'Error in analysis, using standard approach',
    };
  }
};
