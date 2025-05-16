import { z } from 'zod';

export const gameRecommendationSchema = z.object({
  games: z
    .array(
      z.object({
        currentPrice: z.number(),
        originalPrice: z.number(),
        discount: z.number(),
        link: z.string(),
        name: z.string(),
        genre: z.string(),
        playtime: z.string(),
        reasoning: z.string(),
        platforms: z.array(z.string()),
      })
    )
    .length(5),
  queryUnderstanding: z.object({
    keyPreferences: z.array(z.string()),
    playtimePreference: z.string(),
    genrePreferences: z.array(z.string()).optional(),
  }),
});

export type GameRecommendation = z.infer<typeof gameRecommendationSchema>;
