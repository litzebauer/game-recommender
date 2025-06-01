import { createFileRoute, redirect } from '@tanstack/react-router';
import { getRecommendations } from '../api/recommendations';
import GameRecommendations from '../../components/GameRecommendations';
import GameRecommendationsLoading from '../../components/GameRecommendationsLoading';

export const Route = createFileRoute('/_layout/recommendations')({
  component: RouteComponent,
  pendingComponent: GameRecommendationsLoading,
  pendingMs: 0,
  validateSearch: ({ _t }) => ({ _t }),
  loaderDeps: ({ search }) => ({ _t: search._t }),
  loader: async ({ location }) => {
    if (!location.state.prompt) {
      throw redirect({ to: '/' });
    }

    return {
      recommendations: await getRecommendations({ data: { query: location.state.prompt } }),
    };
  },
});

function RouteComponent() {
  const { recommendations } = Route.useLoaderData();

  return <GameRecommendations gameRecommendations={recommendations} />;
}
