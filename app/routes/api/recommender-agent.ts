import { createServerFn } from '@tanstack/react-start';
import { Game, RecommendationResponse } from '../../lib/types';

export const recommendGame = createServerFn({
  method: 'POST',
})
  .validator((d: { genres: string[]; platforms: string[] }) => d)
  .handler(async ({ data }): Promise<RecommendationResponse> => {
    // TODO: Implement game database integration
    // For now, return a simple mapping
    const gameDatabase: Record<string, Game[]> = {
      PS5: [
        {
          title: 'Elden Ring',
          platform: 'PS5',
          genres: ['Action RPG', 'Dark Fantasy'],
          source: 'PS5',
        },
        {
          title: 'God of War: Ragnarök',
          platform: 'PS5',
          genres: ['Action', 'Adventure'],
          source: 'PS5',
        },
      ],
      'Xbox Game Pass': [
        {
          title: 'Starfield',
          platform: 'Xbox',
          genres: ['RPG', 'Sci-Fi'],
          source: 'GamePass',
        },
        {
          title: 'Forza Horizon 5',
          platform: 'Xbox',
          genres: ['Racing', 'Simulation'],
          source: 'GamePass',
        },
      ],
    };

    // Find games that match the genres and platforms
    const matchingGames: Game[] = [];
    for (const platform of data.platforms) {
      const platformGames = gameDatabase[platform] || [];
      for (const game of platformGames) {
        if (game.genres?.some(genre => data.genres.includes(genre))) {
          matchingGames.push(game);
        }
      }
    }

    // Select a random game from the matches
    const selectedGame = matchingGames[Math.floor(Math.random() * matchingGames.length)] || {
      title: 'No matching games found',
      platform: data.platforms[0],
      genres: data.genres,
      source: 'Manual',
    };

    return {
      recommendation: selectedGame,
      explanation: `Based on your preferences, we recommend ${selectedGame.title}. It matches your desired genres and is available on your selected platforms.`,
    };
  });
