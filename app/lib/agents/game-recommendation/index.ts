import { END, START, StateGraph } from '@langchain/langgraph';
import { AgentState } from './state';
import { analyzeQuery } from './nodes/analyze-query';
import { searchGames } from './nodes/search-games';
import { extractGames } from './nodes/extract-games';
import { describeGames } from './nodes/describe-games';
import { fetchPrices } from './nodes/fetch-prices';
import { combineGameData } from './nodes/combine-game-data';
import { generateRecommendations } from './nodes/generate-recommendations';
import { assessQueryComplexity } from './nodes/assess-query-complexity';
import { assessResultsQuality } from './nodes/assess-results-quality';
import { refineSearch } from './nodes/refine-search';
import {
  routeAfterQualityAssessment,
  routeAfterAnalysis,
  routeAfterCombine,
} from './nodes/decision-router';
import { GameRecommendation } from '../../schemas/gameRecommendation';

function createGameRecommendationGraph() {
  const workflow = new StateGraph(AgentState)
    // Core processing nodes
    .addNode('assess-complexity', assessQueryComplexity)
    .addNode('analyze', analyzeQuery)
    .addNode('search', searchGames)
    .addNode('extract', extractGames)
    .addNode('describe', describeGames)
    .addNode('price', fetchPrices)
    .addNode('combine', combineGameData)
    .addNode('recommend', generateRecommendations)

    // Agentic decision nodes
    .addNode('assess-quality', assessResultsQuality)
    .addNode('refine-search', refineSearch);

  // Initial flow: assess complexity then analyze
  workflow.addEdge(START, 'assess-complexity').addEdge('assess-complexity', 'analyze');

  // Conditional routing after analysis
  workflow.addConditionalEdges('analyze', routeAfterAnalysis, {
    search: 'search',
  });

  // Standard data processing flow
  workflow
    .addEdge('search', 'extract')
    .addEdge('extract', 'describe')
    .addEdge('extract', 'price')
    .addEdge('describe', 'combine')
    .addEdge('price', 'combine');

  // Quality assessment after combining data
  workflow.addConditionalEdges('combine', routeAfterCombine, {
    'assess-quality': 'assess-quality',
  });

  // Agentic decision making after quality assessment
  workflow.addConditionalEdges('assess-quality', routeAfterQualityAssessment, {
    'refine-search': 'refine-search',
    recommend: 'recommend',
  });

  // After refining search, go back to search with new query
  workflow.addEdge('refine-search', 'search');

  // Final step
  workflow.addEdge('recommend', END);

  return workflow.compile();
}

const graph = createGameRecommendationGraph();

export const run = async (userRequest: string): Promise<GameRecommendation[]> => {
  const graphState = await graph.invoke({ userRequest });

  return graphState.gameRecommendations || [];
};
