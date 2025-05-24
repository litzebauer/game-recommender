import { Annotation } from '@langchain/langgraph';
import { GameRecommendation } from '../../schemas/gameRecommendation';

export type GameRecommendationState = typeof AgentState.State;

export const AgentState = Annotation.Root({
  userRequest: Annotation<string>,
  searchQuery: Annotation<string>,
  rawSearchResults: Annotation<string>,
  gameRecommendations: Annotation<GameRecommendation[]>,
});
