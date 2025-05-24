import { GameRecommendationState } from '../state';
import { TavilySearch, TavilySearchResponse } from '@langchain/tavily';

const tool = new TavilySearch({
  maxResults: 5,
});

export async function searchGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const results: TavilySearchResponse = await tool.invoke({
    query: state.searchQuery!,
  });

  return {
    rawSearchResults: results.results
      .filter(result => result.score >= 0.4)
      .map(result => result.content),
  };
}
