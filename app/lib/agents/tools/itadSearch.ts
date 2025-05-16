import { DynamicTool } from '@langchain/core/tools';
import { client } from '../../../client/itad/client.gen';
import { gamesInfoV2, gamesSearchV1 } from '../../../client/itad/sdk.gen';
import type { ObjGame, RespGamesInfo, RespGamesSearch } from '../../../client/itad/types.gen';

function isRespGamesSearch(response: unknown): response is RespGamesSearch {
  return Array.isArray(response);
}

client.setConfig({
  auth: () => process.env.IS_THERE_ANY_DEAL_API_KEY!,
});

export type IatdSearchToolOutput = RespGamesInfo | string;

const getGame = (results: RespGamesSearch): ObjGame | null => {
  if (isRespGamesSearch(results)) {
    return results.find(game => game.type === 'game') ?? null;
  }
  return null;
};

export class IatdSearchTool extends DynamicTool<IatdSearchToolOutput> {
  constructor() {
    super({
      name: 'itad_search',
      description: 'Searches for the current price of a game. Input should be a game name.',
      func: async (query: string): Promise<IatdSearchToolOutput> => {
        try {
          const results = await gamesSearchV1({ query: { title: query }, throwOnError: true });
          const game = getGame(results.data);

          if (game === null) {
            return 'No matching game found.';
          }

          const gameInfo = await gamesInfoV2({ query: { id: game.id }, throwOnError: true });
          return gameInfo.data;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error performing game lookup: ', error);
          return 'Error performing search. Please try again.';
        }
      },
    });
  }
}
