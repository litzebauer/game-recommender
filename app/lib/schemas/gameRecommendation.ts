import { z } from 'zod';

export const gameSchema = z.object({
  currentPrice: z.number().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  link: z.string().optional(),
  name: z.string(),
  description: z.string(),
  genre: z.string().optional(),
  playtime: z.string().optional(),
  platforms: z.array(z.string()),
});

export type Game = z.infer<typeof gameSchema>;

export const gameRecommendationSchema = z.object({
  game: gameSchema,
  reasoning: z.string(),
});

export type GameRecommendation = z.infer<typeof gameRecommendationSchema>;
