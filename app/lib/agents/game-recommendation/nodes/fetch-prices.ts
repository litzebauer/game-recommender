import { PriceInfoTool } from '../../../../tools/priceInfo';
import { GameRecommendation } from '../../../schemas/gameRecommendation';
import { GameRecommendationState } from '../state';

const priceInfoTool = new PriceInfoTool();

export async function fetchPrices(state: GameRecommendationState) {
  const CONCURRENT_LIMIT = 3; // Adjust based on API limits

  const gameRecommendationsWithPrices: GameRecommendation[] = [];

  // Process games in batches to avoid rate limits
  for (let i = 0; i < state.gameRecommendations.length; i += CONCURRENT_LIMIT) {
    const batch = state.gameRecommendations.slice(i, i + CONCURRENT_LIMIT);

    const batchResults = await Promise.allSettled(
      batch.map(async gameRecommendation => {
        try {
          const priceInfo = await priceInfoTool.invoke(gameRecommendation.game.name);

          // Calculate discount as percentage: ((original - current) / original) * 100
          const discountPercentage =
            priceInfo.regularPrice.amount > 0
              ? Math.round(
                  ((priceInfo.regularPrice.amount - priceInfo.currentPrice.amount) /
                    priceInfo.regularPrice.amount) *
                    100
                )
              : 0;

          return {
            ...gameRecommendation,
            game: {
              ...gameRecommendation.game,
              currentPrice: priceInfo.currentPrice.amount,
              originalPrice: priceInfo.regularPrice.amount,
              link: priceInfo.url,
              discount: discountPercentage,
            },
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to get price for ${gameRecommendation.game.name}:`, error);
          return { ...gameRecommendation, price: null, currency: null, link: null }; // Keep game but mark price as unavailable
        }
      })
    );

    // Extract successful results
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        gameRecommendationsWithPrices.push(result.value as GameRecommendation);
      }
    });

    // Optional: Add delay between batches if needed
    if (i + CONCURRENT_LIMIT < state.gameRecommendations.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    gameRecommendations: gameRecommendationsWithPrices,
  };
}
