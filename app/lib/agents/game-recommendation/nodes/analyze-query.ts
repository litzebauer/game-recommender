import { GameRecommendationState } from '../state';
import { ModelManager } from '../../../models/modelFactory';
import { loadModelConfig } from '../../../config/modelConfig';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';

export async function analyzeQuery(state: GameRecommendationState) {
  const searchQuery = await generateSearchQuery(state.userRequest);

  return {
    searchQuery,
  };
}

const generateSearchQuery = async (userRequest: string): Promise<string> => {
  // Create the model
  const modelConfig = loadModelConfig();
  const modelManager = new ModelManager();
  const model = modelManager.createModel(modelConfig);

  // Create a prompt template for generating search queries
  const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert at analyzing game recommendation requests and generating optimal search queries.

Your task is to analyze the user's request and convert it into an effective search query that will help find relevant video games.

Guidelines:
- Extract key gaming preferences (genres, themes, platforms, mechanics)
- Include relevant keywords that would appear in gaming articles and reviews
- Focus on searchable terms that would help find game recommendations
- Keep the query concise but comprehensive
- Include terms like "best", "top", "games", "reviews" where appropriate

User Request: {userRequest}

Generate a search query (just the query, no explanation):
`);

  // Generate the search query
  const chain = prompt.pipe(model);
  const response = (await chain.invoke({ userRequest })) as BaseMessage;

  // Extract the content from the response
  const searchQuery =
    typeof response.content === 'string'
      ? response.content.trim()
      : response.content.toString().trim();

  return searchQuery;
};
