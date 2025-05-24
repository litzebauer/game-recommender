import { GameRecommendationState } from '../state';

export async function generateRecommendations(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  return {
    gameRecommendations: state.gameRecommendations.map(gameRecommendation => ({
      game: gameRecommendation.game,
      reasoning: gameRecommendation.reasoning,
    })),
  };
}
