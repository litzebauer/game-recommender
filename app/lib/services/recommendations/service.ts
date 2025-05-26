import { GetRecommendations } from '.';
import { run } from '../../agents/game-recommendation';

export const getRecommendations: GetRecommendations = async ({ query }) => {
  return await run(query);
};
