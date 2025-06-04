import { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generates a consistent game ID from a game name
 * @param gameName The game name to convert to an ID
 * @returns A standardized game ID
 */
export const generateGameId = (gameName: string): string => {
  return gameName.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

/**
 * Converts a Zod schema into a prompt-friendly string describing the expected output format.
 */
export function zodSchemaToPromptDescription(schema: ZodTypeAny): string {
  const jsonSchema = zodToJsonSchema(schema);

  // Escape curly braces for LangChain f-string templates
  const escapedJsonSchema = JSON.stringify(jsonSchema, null, 2)
    .replace(/\{/g, '{{')
    .replace(/\}/g, '}}');

  return (
    `Return JSON with the following structure:\n` +
    escapedJsonSchema +
    '\nIMPORTANT: You MUST respond with valid JSON only. Do not include any explanation or text outside the JSON structure.'
  );
}

export function isValidGameData(game: any): boolean {
  return (
    game &&
    typeof game.id === 'string' &&
    typeof game.name === 'string' &&
    game.id.length > 0 &&
    game.name.length > 0
  );
}

export function calculateDataCompleteness(games: any[]): number {
  if (!games || games.length === 0) return 0;

  let totalScore = 0;
  for (const game of games) {
    let gameScore = 0;
    const fields = ['id', 'name', 'description', 'genre', 'currentPrice', 'imageUrl'];

    for (const field of fields) {
      if (game[field] && game[field] !== '') {
        gameScore += 1;
      }
    }

    totalScore += gameScore / fields.length;
  }

  return totalScore / games.length;
}
