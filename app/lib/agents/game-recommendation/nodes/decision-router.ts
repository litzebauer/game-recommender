import { GameRecommendationState } from '../state';

export function shouldRetrySearch(state: GameRecommendationState): boolean {
  return state.decisionFlags?.shouldRetrySearch || false;
}

export function shouldExpandSearch(state: GameRecommendationState): boolean {
  return state.decisionFlags?.shouldExpandSearch || false;
}

export function shouldUseAlternativeStrategy(state: GameRecommendationState): boolean {
  return state.decisionFlags?.shouldUseAlternativeStrategy || false;
}

export function shouldProceedToRecommendations(state: GameRecommendationState): boolean {
  // Proceed if we have sufficient quality or have exhausted retries
  const hasGoodQuality =
    state.qualityAssessment?.searchResultsQuality === 'good' ||
    state.qualityAssessment?.searchResultsQuality === 'excellent';
  const hasMinimumGames = (state.games?.length || 0) >= 2;
  const hasExhaustedRetries = (state.retryCount || 0) >= 2;

  return hasGoodQuality || (hasMinimumGames && hasExhaustedRetries);
}

export function routeAfterQualityAssessment(state: GameRecommendationState): string {
  // If we should retry search, go to refine-search
  if (shouldRetrySearch(state)) {
    return 'refine-search';
  }

  // If we should expand search, go to refine-search with expansion
  if (shouldExpandSearch(state)) {
    return 'refine-search';
  }

  // If we should use alternative strategy, go to refine-search
  if (shouldUseAlternativeStrategy(state)) {
    return 'refine-search';
  }

  // Otherwise proceed to recommendations
  return 'recommend';
}

export function routeAfterAnalysis(): string {
  // For multi-query strategy, we might want to handle differently in the future
  // For now, all strategies go to search
  return 'search';
}

export function routeAfterCombine(): string {
  // Always assess quality after combining data
  return 'assess-quality';
}
