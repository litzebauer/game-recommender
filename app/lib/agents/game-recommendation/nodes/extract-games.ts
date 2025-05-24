import { GameRecommendation } from '../../../schemas/gameRecommendation';
import { GameRecommendationState } from '../state';

export async function extractGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  const gameRecommendations = await parseGamesFromResults(state.rawSearchResults!);

  return {
    gameRecommendations,
    rawSearchResults: undefined, // Clear to save tokens
  };
}

const parseGamesFromResults = async (rawSearchResults: string): Promise<GameRecommendation[]> => {
  return Promise.resolve([
    {
      game: {
        name: 'The Witcher 3: Wild Hunt',
        description: 'A game about a witcher',
        platforms: ['PC', 'PS4', 'Xbox One'],
      },
      reasoning: 'This is a game recommendation',
    },
  ]);
};
