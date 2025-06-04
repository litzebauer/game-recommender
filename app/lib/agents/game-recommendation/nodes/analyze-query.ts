import { GameRecommendationState } from '../state';
import { createOpenRouterModel } from '../../../models/openrouter';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Create a prompt template for generating search queries based on strategy
const promptTemplate = ChatPromptTemplate.fromTemplate(`
    You are an expert at analyzing game recommendation requests and generating optimal search queries.

    Your task is to analyze the user's request and convert it into a single, unified search query that will help find relevant video games.

    User Request: {userRequest}
    Search Strategy: {searchStrategy}
    Is Complex Query: {isComplexQuery}
    Requires Specialized Search: {requiresSpecializedSearch}

    Guidelines based on strategy:

    STANDARD: Simple, direct search focusing on main keywords
    - Extract key gaming preferences (genres, themes, platforms, mechanics)
    - Include terms like "best", "top", "games", "reviews"
    - Keep concise but comprehensive

    BROAD: Cast a wide net to find more results
    - Use general gaming terms and popular keywords
    - Include multiple synonyms and related terms
    - Focus on discovery and exploration

    SPECIFIC: Highly targeted search for precise requirements
    - Include very specific genre, platform, or feature terms
    - Use exact phrases and technical gaming terminology
    - Focus on niche or specialized gaming communities

    IMPORTANT: Generate exactly one search query using space-separated keywords only. Do not use OR operators, quotation marks, or create multiple separate queries.

    Generate a single search query (just the query, no explanation):  
    `);

export async function analyzeQuery(state: GameRecommendationState) {
  const searchQuery = await generateSearchQuery(
    state.userRequest,
    state.searchStrategy || 'standard',
    state.decisionFlags?.isComplexQuery || false,
    state.decisionFlags?.requiresSpecializedSearch || false
  );

  return {
    searchQuery,
  };
}

const generateSearchQuery = async (
  userRequest: string,
  strategy: string,
  isComplexQuery: boolean,
  requiresSpecializedSearch: boolean
): Promise<string> => {
  // Create the model
  const modelConfig = loadModelConfig(process.env.ANALYZE_QUERY_MODEL);
  const model = createOpenRouterModel(modelConfig);

  const prompt = await promptTemplate.invoke({
    userRequest,
    searchStrategy: strategy,
    isComplexQuery,
    requiresSpecializedSearch,
  });
  const response = await model.invoke(prompt);

  // Extract the content from the response
  const searchQuery =
    typeof response.content === 'string'
      ? response.content.trim()
      : response.content.toString().trim();

  return searchQuery;
};
