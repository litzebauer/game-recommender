import { Annotation } from '@langchain/langgraph';
import { GameRecommendation } from '../../schemas/gameRecommendation';
import { Game } from '../../schemas/gameRecommendation';

export type GameRecommendationState = typeof AgentState.State;

export interface GameDescription
  extends Pick<Game, 'id' | 'name' | 'description' | 'genre' | 'playtime' | 'tags' | 'imageUrl'> {}

export interface GamePriceInfo
  extends Pick<Game, 'id' | 'currentPrice' | 'originalPrice' | 'discount' | 'link'> {
  name: string;
}

// Quality assessment interface
export interface QualityAssessment {
  searchResultsQuality: 'excellent' | 'good' | 'poor' | 'insufficient';
  gameDataCompleteness: number; // 0-1 score
  recommendationConfidence: number; // 0-1 score
  needsRefinement: boolean;
  issues: string[];
}

// Decision flags for agentic behavior
export interface DecisionFlags {
  shouldRetrySearch: boolean;
  shouldExpandSearch: boolean;
  shouldUseAlternativeStrategy: boolean;
  isComplexQuery: boolean;
  requiresSpecializedSearch: boolean;
}

export const AgentState = Annotation.Root({
  userRequest: Annotation<string>,
  searchQuery: Annotation<string>,
  rawSearchResults: Annotation<string[]>,
  gameNames: Annotation<string[]>,
  gameDescriptions: Annotation<GameDescription[]>,
  gamePriceInfo: Annotation<GamePriceInfo[]>,
  gameRecommendations: Annotation<GameRecommendation[]>,
  games: Annotation<Game[]>,

  // Agentic decision-making fields
  qualityAssessment: Annotation<QualityAssessment>,
  decisionFlags: Annotation<DecisionFlags>,
  retryCount: Annotation<number>,
  alternativeSearchQueries: Annotation<string[]>,
  searchStrategy: Annotation<'standard' | 'broad' | 'specific'>,
});
