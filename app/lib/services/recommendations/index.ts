import { GameRecommendation } from '../../schemas/gameRecommendation';

export type GetRecommendations = (data: { query: string }) => Promise<GameRecommendation[]>;

let mod: { getRecommendations: GetRecommendations };
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  mod = await import('./mock');
} else {
  mod = await import('./service');
}

export const getRecommendations = mod.getRecommendations;
