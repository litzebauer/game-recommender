import { DynamicTool } from '@langchain/core/tools';
import { client } from '../../client/rawg/client.gen';
import { gamesList, gamesRead } from '../../client/rawg/sdk.gen';
import type { GameReadable, GameSingleReadable } from '../../client/rawg/types.gen';

// Configure client to add API key as query parameter for all requests
client.interceptors.request.use(request => {
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

// Helper function to convert Roman numerals to Arabic numbers
const romanToArabic = (roman: string): string => {
  const romanNumerals: { [key: string]: number } = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
    XIII: 13,
    XIV: 14,
    XV: 15,
    XVI: 16,
    XVII: 17,
    XVIII: 18,
    XIX: 19,
    XX: 20,
  };

  return romanNumerals[roman] ? romanNumerals[roman].toString() : roman;
};

// Helper function to convert Arabic numbers to Roman numerals
const arabicToRoman = (num: number): string => {
  const arabicToRomanMap: { [key: number]: string } = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
    11: 'XI',
    12: 'XII',
    13: 'XIII',
    14: 'XIV',
    15: 'XV',
    16: 'XVI',
    17: 'XVII',
    18: 'XVIII',
    19: 'XIX',
    20: 'XX',
  };

  return arabicToRomanMap[num] || num.toString();
};

// Normalize game titles for better matching
const normalizeTitle = (title: string): string => {
  if (!title) return '';

  return (
    title
      .toLowerCase()
      // Remove common prefixes and suffixes
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+(game|edition|remaster|remake|deluxe|goty|complete)$/i, '')
      // Replace Roman numerals with Arabic numbers and vice versa
      .replace(/\b(I{1,3}|IV|V|VI{0,3}|IX|X{1,2}|XI{1,3}|XIV|XV|XVI{0,3}|XIX|XX)\b/g, match =>
        romanToArabic(match)
      )
      // Normalize spacing and punctuation
      .replace(/[:\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
};

// Calculate similarity score between two normalized titles
const calculateSimilarity = (title1: string, title2: string): number => {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);

  // Exact match after normalization
  if (norm1 === norm2) return 1.0;

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

  // Simple word overlap scoring
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));

  if (commonWords.length === 0) return 0;

  const overlapScore = (commonWords.length * 2) / (words1.length + words2.length);
  return overlapScore;
};

const findBestMatch = (results: GameReadable[], searchTerm: string): GameReadable | null => {
  if (!results || results.length === 0) return null;

  const normalizedSearch = normalizeTitle(searchTerm);

  // Create search variants with different Roman numeral/Arabic conversions
  const searchVariants = [normalizedSearch];

  // Add variant with Arabic numbers converted to Roman
  const arabicMatches = normalizedSearch.match(/\b(\d{1,2})\b/g);
  if (arabicMatches) {
    let romanVariant = normalizedSearch;
    arabicMatches.forEach(match => {
      const num = parseInt(match);
      if (num <= 20) {
        romanVariant = romanVariant.replace(
          new RegExp(`\\b${num}\\b`, 'g'),
          arabicToRoman(num).toLowerCase()
        );
      }
    });
    if (romanVariant !== normalizedSearch) {
      searchVariants.push(romanVariant);
    }
  }

  // Score each game against all search variants
  const scoredGames = results.map(game => {
    const gameName = game.name || '';
    const maxScore = Math.max(
      ...searchVariants.map(variant => calculateSimilarity(gameName, variant))
    );

    return { game, score: maxScore };
  });

  // Sort by score (highest first) and return the best match
  scoredGames.sort((a, b) => b.score - a.score);

  // Only return a match if the score is reasonably high
  const bestMatch = scoredGames[0];
  if (bestMatch && bestMatch.score >= 0.3) {
    return bestMatch.game;
  }

  // Fallback to original exact matching logic
  const exactMatch = results.find(game => game.name?.toLowerCase() === searchTerm.toLowerCase());
  if (exactMatch) return exactMatch;

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
