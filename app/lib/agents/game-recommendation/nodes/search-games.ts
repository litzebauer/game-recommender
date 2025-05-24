import { GameRecommendationState } from '../state';
import { GameSearchTool } from '../../../../tools/gameSearch';

const gameSearchTool = new GameSearchTool();

export async function searchGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const rawSearchResults = await gameSearchTool.invoke({
    query: state.searchQuery!,
  });

  return {
    rawSearchResults,
  };
}
