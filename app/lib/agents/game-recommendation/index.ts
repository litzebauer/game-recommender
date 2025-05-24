import { END, START, StateGraph } from '@langchain/langgraph';
import { AgentState } from './state';
import { analyzeQuery } from './nodes/analyze-query';
import { searchGames } from './nodes/search-games';
import { extractGames } from './nodes/extract-games';
import { fetchPrices } from './nodes/fetch-prices';
import { generateRecommendations } from './nodes/generate-recommendations';
import { GameRecommendation } from '../../schemas/gameRecommendation';

function createGameRecommendationGraph() {
  const workflow = new StateGraph(AgentState)
    .addNode('analyze', analyzeQuery)
    .addNode('search', searchGames)
    .addNode('extract', extractGames)
    .addNode('price', fetchPrices)
    .addNode('recommend', generateRecommendations);

  workflow
    .addEdge(START, 'analyze')
    .addEdge('analyze', 'search')
    .addEdge('search', 'extract')
    .addEdge('extract', 'price')
    .addEdge('price', 'recommend')
    .addEdge('recommend', END);

  return workflow.compile();
}

const graph = createGameRecommendationGraph();

export const run = async (userRequest: string): Promise<GameRecommendation[]> => {
  const graphState = await graph.invoke({ userRequest });

  return graphState.gameRecommendations;
};
