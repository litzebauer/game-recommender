import { DynamicTool } from '@langchain/core/tools';
import { client } from '../../client/rawg/client.gen';
import { gamesList, gamesRead } from '../../client/rawg/sdk.gen';
import type { GameReadable, GameSingleReadable } from '../../client/rawg/types.gen';

// Configure client to add API key as query parameter for all requests
client.interceptors.request.use((request, options) => {
  const url = new URL(request.url);
  url.searchParams.set('key', process.env.RAWG_API_KEY!);
  return new Request(url.toString(), request);
});

export type GameDescriptionOutput = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  genre?: string;
  playtime?: string;
  imageUrl?: string;
};

// Extended interface to handle potentially undocumented fields in RAWG API
interface ExtendedGameData extends GameSingleReadable {
  genres?: Array<{ id?: number; name?: string; slug?: string }>;
  tags?: Array<{ id?: number; name?: string; slug?: string }>;
  developers?: Array<{ id?: number; name?: string; slug?: string }>;
  publishers?: Array<{ id?: number; name?: string; slug?: string }>;
}

const findBestMatch = (results: GameReadable[], searchTerm: string): GameReadable | null => {
  if (!results || results.length === 0) return null;

  // Prioritize exact matches first
  const exactMatch = results.find(game => game.name?.toLowerCase() === searchTerm.toLowerCase());
  if (exactMatch) return exactMatch;

  // Then find games that start with the search term
  const startsWithMatch = results.find(game =>
    game.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
  if (startsWithMatch) return startsWithMatch;

  // Otherwise return the first result (most relevant according to RAWG)
  return results[0];
};

const extractTags = (gameData: ExtendedGameData): string[] =>
  gameData.tags?.map(tag => tag.name ?? '').filter(Boolean) ?? [];

const extractGenre = (gameData: ExtendedGameData): string | undefined => {
  // Prioritize actual genre field if available
  if (gameData.genres && Array.isArray(gameData.genres) && gameData.genres.length > 0) {
    return gameData.genres[0].name;
  }

  // Fall back to first platform as genre
  if (gameData.platforms && gameData.platforms.length > 0) {
    return gameData.platforms[0].platform?.name;
  }

  return undefined;
};

export class GameDescriptionTool extends DynamicTool<GameDescriptionOutput> {
  constructor() {
    super({
      name: 'game_description',
      description:
        'Gets detailed information about a game including description and tags. Input should be the game name.',
      func: async (query: string): Promise<GameDescriptionOutput> => {
        try {
          // Search for games matching the query
          const searchResults = await gamesList({
            query: {
              search: query,
              search_precise: true,
              page_size: 5,
            },
            throwOnError: true,
          });

          const games = searchResults.data?.results;
          if (!games || games.length === 0) {
            throw new Error('No games found matching the search term.');
          }

          // Find the best matching game
          const bestMatch = findBestMatch(games, query);
          if (!bestMatch || !bestMatch.id) {
            throw new Error('No suitable game match found.');
          }

          // Get detailed information for the selected game
          const gameDetails = await gamesRead({
            path: { id: bestMatch.id.toString() },
            throwOnError: true,
          });

          const gameData = gameDetails.data as ExtendedGameData;
          if (!gameData) {
            throw new Error('Failed to retrieve game details.');
          }

          // Extract tags and genre from the game data
          const tags = extractTags(gameData);
          const genre = extractGenre(gameData);

          // Convert playtime from hours to readable format
          const playtimeHours = gameData.playtime || bestMatch.playtime;
          const playtime = playtimeHours ? `${playtimeHours} hours` : undefined;

          // Clean up the description by removing HTML tags if present
          const description = gameData.description
            ? gameData.description.replace(/<[^>]*>/g, '').trim()
            : 'No description available.';

          return {
            id: gameData.id?.toString() || bestMatch.id.toString(),
            name: gameData.name || bestMatch.name || query,
            description,
            tags,
            genre,
            playtime,
            imageUrl: gameData.background_image || bestMatch.background_image,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Error performing game description lookup: ', error);
          return Promise.reject(error);
        }
      },
    });
  }
}
