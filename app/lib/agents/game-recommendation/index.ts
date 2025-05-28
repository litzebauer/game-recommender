import { END, START, StateGraph } from '@langchain/langgraph';
import { AgentState } from './state';
import { analyzeQuery } from './nodes/analyze-query';
import { searchGames } from './nodes/search-games';
import { extractGames } from './nodes/extract-games';
import { describeGames } from './nodes/describe-games';
import { fetchPrices } from './nodes/fetch-prices';
import { combineGameData } from './nodes/combine-game-data';
import { generateRecommendations } from './nodes/generate-recommendations';
import { GameRecommendation } from '../../schemas/gameRecommendation';

function createGameRecommendationGraph() {
  const workflow = new StateGraph(AgentState)
    .addNode('analyze', analyzeQuery)
    .addNode('search', searchGames)
    .addNode('extract', extractGames)
    .addNode('describe', describeGames)
    .addNode('price', fetchPrices)
    .addNode('combine', combineGameData)
    .addNode('recommend', generateRecommendations);

  workflow
    .addEdge(START, 'analyze')
    .addEdge('analyze', 'search')
    .addEdge('search', 'extract')
    .addEdge('extract', 'describe')
    .addEdge('extract', 'price')
    .addEdge('describe', 'combine')
    .addEdge('price', 'combine')
    .addEdge('combine', 'recommend')
    .addEdge('recommend', END);

  return workflow.compile();
}

const graph = createGameRecommendationGraph();

export const run = async (userRequest: string): Promise<GameRecommendation[]> => {
  const graphState = await graph.invoke({ userRequest });

  return graphState.gameRecommendations;
};
