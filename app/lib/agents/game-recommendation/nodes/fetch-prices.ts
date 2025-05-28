import { PriceInfoTool } from '../../../tools/priceInfo';
import { GameRecommendationState, GamePriceInfo } from '../state';
import { generateGameId } from '../utils';

const priceInfoTool = new PriceInfoTool();

export async function fetchPrices(state: GameRecommendationState) {
  if (!state.gameNames || state.gameNames.length === 0) {
    return {
      gamePriceInfo: [],
    };
  }

  const CONCURRENT_LIMIT = 3; // Adjust based on API limits
  const gamePriceInfo: GamePriceInfo[] = [];

  // Process games in batches to avoid rate limits
  for (let i = 0; i < state.gameNames.length; i += CONCURRENT_LIMIT) {
    const batch = state.gameNames.slice(i, i + CONCURRENT_LIMIT);

    const batchResults = await Promise.allSettled(
      batch.map(async gameName => {
        try {
          const priceInfo = await priceInfoTool.invoke(gameName);

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
            id: generateGameId(gameName), // Generate consistent ID
            name: gameName,
            currentPrice: priceInfo.currentPrice.amount,
            originalPrice: priceInfo.regularPrice.amount,
            link: priceInfo.url,
            discount: discountPercentage,
          } as GamePriceInfo;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to get price for ${gameName}:`, error);
          return {
            id: generateGameId(gameName), // Generate consistent ID even for failures
            name: gameName,
            currentPrice: null,
            originalPrice: null,
            link: null,
            discount: null,
            imageUrl: null,
          } as GamePriceInfo;
        }
      })
    );

    // Extract successful results
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        gamePriceInfo.push(result.value);
      }
    });

    // Optional: Add delay between batches if needed
    if (i + CONCURRENT_LIMIT < state.gameNames.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    gamePriceInfo,
  };
}
