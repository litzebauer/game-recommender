import { GameDescriptionTool } from '../../../tools/describe';
import { GameRecommendationState, GameDescription } from '../state';
import { generateGameId } from '../utils';

const gameDescriptionTool = new GameDescriptionTool();

export async function describeGames(
  state: GameRecommendationState
): Promise<Partial<GameRecommendationState>> {
  if (!state.gameNames || state.gameNames.length === 0) {
    return {
      gameDescriptions: [],
    };
  }

  const CONCURRENT_LIMIT = 3; // Limit concurrent requests to avoid rate limiting
  const gameDescriptions: GameDescription[] = [];

  // Process games in batches to avoid overwhelming the API
  for (let i = 0; i < state.gameNames.length; i += CONCURRENT_LIMIT) {
    const batch = state.gameNames.slice(i, i + CONCURRENT_LIMIT);

    const batchResults = await Promise.allSettled(
      batch.map(async gameName => {
        try {
          const description = await gameDescriptionTool.invoke(gameName);

          return {
            id: generateGameId(gameName),
            name: description.name,
            description: description.description,
            genre: description.genre || null,
            playtime: description.playtime || null,
            tags: description.tags || null,
            imageUrl: description.imageUrl || null,
          } as GameDescription;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to get description for ${gameName}:`, error);

          // Fallback to basic game info if description fetch fails
          return {
            id: generateGameId(gameName), // Use shared utility for consistent ID generation
            name: gameName,
            description: `${gameName} is a video game.`,
            genre: null,
            playtime: null,
            tags: null,
            imageUrl: null,
          } as GameDescription;
        }
      })
    );

    // Process batch results and add successful ones to the array
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        gameDescriptions.push(result.value);
      }
    });
  }

  return {
    gameDescriptions,
    gameNames: undefined, // Clear to save tokens
  };
}
