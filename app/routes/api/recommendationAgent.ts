import { createServerFn } from '@tanstack/react-start';
import { GameRecommendationAgent } from '../../lib/agents/gameRecommendationAgent';
import type { GameRecommendation } from '../../lib/schemas/gameRecommendation';

const agent = new GameRecommendationAgent();

export const getRecommendations = createServerFn({
  method: 'POST',
})
  .validator((d: { query: string }) => d)
  .handler(async ({ data }): Promise<GameRecommendation> => {
    try {
      return await agent.getRecommendations(data.query);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating game recommendations:', error);
      throw new Error('Failed to generate game recommendations');
    }
  });
