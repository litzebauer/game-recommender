import { GameRecommendationState } from '../state';

export async function analyzeQuery(state: GameRecommendationState) {
  const searchQuery = await generateSearchQuery(state.userRequest);

  return {
    searchQuery,
  };
}

const generateSearchQuery = async (userRequest: string) => {
  return Promise.resolve('best narrative rpgs');
};
