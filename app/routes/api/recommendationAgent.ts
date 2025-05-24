import { createServerFn } from '@tanstack/react-start';
import { run } from '../../lib/agents/game-recommendation';
import type { GameRecommendation } from '../../lib/schemas/gameRecommendation';

export const getRecommendations = createServerFn({
  method: 'POST',
})
  .validator((d: { query: string }) => d)
  .handler(async ({ data }): Promise<GameRecommendation[]> => {
    try {
      return await run(data.query);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating game recommendations:', error);
      throw new Error('Failed to generate game recommendations');
    }
  });
