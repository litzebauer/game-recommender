import { z } from 'zod';

export const gameSchema = z.object({
  id: z.string(),
  currentPrice: z.number().optional().nullable(),
  originalPrice: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  link: z.string().optional().nullable(),
  name: z.string(),
  description: z.string(),
  genre: z.string().optional().nullable(),
  playtime: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type Game = z.infer<typeof gameSchema>;

export const gameRecommendationSchema = z.object({
  game: gameSchema,
  reasoning: z.string(),
});

export type GameRecommendation = z.infer<typeof gameRecommendationSchema>;
