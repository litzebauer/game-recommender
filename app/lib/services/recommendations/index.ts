import { GameRecommendation } from '../../schemas/gameRecommendation';

export type GetRecommendations = (data: { query: string }) => Promise<GameRecommendation[]>;

let recommendationsService: Promise<{ getRecommendations: GetRecommendations }> | null = null;

function getRecommendationsService() {
  if (!recommendationsService) {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      recommendationsService = import('./mock');
    } else {
      recommendationsService = import('./service');
    }
  }
  return recommendationsService;
}

export const getRecommendations: GetRecommendations = async data => {
  const service = await getRecommendationsService();
  return service.getRecommendations(data);
};
