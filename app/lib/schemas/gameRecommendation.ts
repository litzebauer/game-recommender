import { z } from 'zod';

export const gameSchema = z.object({
  id: z.string(),
  currentPrice: z.number().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  link: z.string().optional(),
  name: z.string(),
  description: z.string(),
  genre: z.string().optional(),
  playtime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export type Game = z.infer<typeof gameSchema>;

export const gameRecommendationSchema = z.object({
  game: gameSchema,
  reasoning: z.string(),
});

export type GameRecommendation = z.infer<typeof gameRecommendationSchema>;
