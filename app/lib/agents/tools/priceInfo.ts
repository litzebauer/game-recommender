import { DynamicTool } from '@langchain/core/tools';
import { client } from '../../../client/itad/client.gen';
import { gamesSearchV1, gamesOverviewV2 } from '../../../client/itad/sdk.gen';
import type { ObjGame, ObjPrice, RespGamesSearch } from '../../../client/itad/types.gen';

function isRespGamesSearch(response: unknown): response is RespGamesSearch {
  return Array.isArray(response);
}

client.setConfig({
  auth: () => process.env.IS_THERE_ANY_DEAL_API_KEY!,
});

export type PriceInfoToolOutput =
  | {
      url: string;
      priceInfo: ObjPrice;
    }
  | string;

const getGame = (results: RespGamesSearch): ObjGame | null => {
  if (isRespGamesSearch(results)) {
    return results.find(game => game.type === 'game') ?? null;
  }
  return null;
};

export class PriceInfoTool extends DynamicTool<PriceInfoToolOutput> {
  constructor() {
    super({
      name: 'price_info',
      description: 'Gets the current price of a game. Input should be a game name.',
      func: async (query: string): Promise<PriceInfoToolOutput> => {
        try {
          const results = await gamesSearchV1({ query: { title: query }, throwOnError: true });
          const game = getGame(results.data);

          if (game === null) {
            return 'No matching game found.';
          }

          const pricesOverview = await gamesOverviewV2({
            query: {
              country: 'US',
            },
            body: [game.id],
            throwOnError: true,
          });

          const priceInfo = pricesOverview.data.prices[0].current?.price ?? null;
          if (!priceInfo) {
            return 'No price information found.';
          }

          return {
            url: pricesOverview.data.prices[0].urls.game ?? '',
            priceInfo,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error performing game price lookup: ', error);
          return 'Error performing search. Please try again.';
        }
      },
    });
  }
}
