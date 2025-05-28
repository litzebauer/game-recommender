/**
 * Generates a consistent game ID from a game name
 * @param gameName The game name to convert to an ID
 * @returns A standardized game ID
 */
export const generateGameId = (gameName: string): string => {
  return gameName.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

import { ZodTypeAny, z } from 'zod';

/**
 * Converts a Zod schema into a prompt-friendly string describing the expected output format.
 */
export function zodSchemaToPromptDescription(
  schema: ZodTypeAny,
  options?: { rootName?: string }
): string {
  const lines: string[] = [];
  const rootName = options?.rootName || 'object';

  function parseShape(shape: ZodTypeAny, path: string[] = []) {
    if (shape instanceof z.ZodObject) {
      const entries = Object.entries(shape.shape);
      for (const [key, value] of entries) {
        const newPath = [...path, key];
        parseShape(value as ZodTypeAny, newPath);
      }
    } else if (shape instanceof z.ZodString) {
      lines.push(`- ${path.join('.')}: string`);
    } else if (shape instanceof z.ZodNumber) {
      lines.push(`- ${path.join('.')}: number`);
    } else if (shape instanceof z.ZodBoolean) {
      lines.push(`- ${path.join('.')}: boolean`);
    } else if (shape instanceof z.ZodEnum) {
      const values = shape._def.values.map((v: any) => `"${v}"`).join(' | ');
      lines.push(`- ${path.join('.')}: one of ${values}`);
    } else if (shape instanceof z.ZodArray) {
      lines.push(`- ${path.join('.')}: array of ${shape._def.type._def.typeName}`);
    } else if (shape instanceof z.ZodOptional || shape instanceof z.ZodNullable) {
      parseShape(shape._def.innerType, path);
    } else {
      lines.push(`- ${path.join('.')}: ${shape._def.typeName || 'unknown'}`);
    }
  }

  parseShape(schema);

  return (
    `Return a JSON ${rootName} with the following structure:\n` +
    lines.join('\n') +
    '\nIMPORTANT: You MUST respond with valid JSON only. Do not include any explanation or text outside the JSON structure.'
  );
}
