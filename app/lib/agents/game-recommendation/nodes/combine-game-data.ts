import { GameRecommendationState, GamePriceInfo, GameDescription } from '../state';
import { Game } from '../../../schemas/gameRecommendation';

export async function combineGameData(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  if (!state.gameDescriptions || state.gameDescriptions.length === 0) {
    return {
      gameDescriptions: [],
      gamePriceInfo: undefined, // Clear to save memory
      gameNames: undefined, // Clear to save memory
    };
  }

  // Create a map of price info for quick lookup by ID
  const priceMap = new Map<string, GamePriceInfo>();
  if (state.gamePriceInfo) {
    state.gamePriceInfo.forEach(priceInfo => {
      priceMap.set(priceInfo.id, priceInfo);
    });
  }

  // Combine game descriptions with price information to create full Game objects
  const combinedGames: Game[] = (state.gameDescriptions as GameDescription[]).map(gameDesc => {
    const priceInfo = priceMap.get(gameDesc.id);

    return {
      ...gameDesc, // Spread all description properties
      currentPrice: priceInfo?.currentPrice ?? null,
      originalPrice: priceInfo?.originalPrice ?? null,
      discount: priceInfo?.discount ?? null,
      link: priceInfo?.link ?? null,
    } as Game;
  });

  return {
    gameDescriptions: combinedGames,
    gamePriceInfo: undefined, // Clear to save memory
    gameNames: undefined, // Clear to save memory
  };
}
