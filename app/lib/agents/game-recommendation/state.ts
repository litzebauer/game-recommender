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

export const AgentState = Annotation.Root({
  userRequest: Annotation<string>,
  searchQuery: Annotation<string>,
  rawSearchResults: Annotation<string[]>,
  gameNames: Annotation<string[]>,
  gameDescriptions: Annotation<GameDescription[] | Game[]>,
  gamePriceInfo: Annotation<GamePriceInfo[]>,
  gameRecommendations: Annotation<GameRecommendation[]>,
});
