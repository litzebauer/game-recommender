import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
  Text,
  Group,
  Badge,
  Anchor,
  Divider,
} from '@mantine/core';
import { getRecommendations } from './api/recommendationAgent';
import { GameRecommendation } from '../lib/schemas/gameRecommendation';
import '@mantine/core/styles.css';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [mood, setMood] = useState('');
  const [recommendedGames, setRecommendedGames] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mood.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const results = await getRecommendations({
        data: { query: mood },
      });
      setRecommendedGames(results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack gap="lg">
          <Title order={1} ta="center">
            Game Recommender
          </Title>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="What type of game are you looking for?"
                placeholder="e.g., dark fantasy RPG"
                value={mood}
                onChange={event => setMood(event.currentTarget.value)}
                required
              />
              <Button type="submit" loading={isLoading} disabled={!mood.trim()} fullWidth>
                Get Recommendations
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>

      {recommendedGames.length > 0 && (
        <Paper shadow="md" p="xl" radius="md" mt="xl">
          <Stack gap="lg">
            <Title order={2}>Recommended Games</Title>

            <Stack gap="md">
              {recommendedGames.map((recommendedGame, index) => (
                <Paper key={index} p="md" withBorder radius="sm">
                  <Stack gap="sm">
                    <Title order={3} size="h4">
                      {recommendedGame.game.name}
                    </Title>

                    <Group gap="xs" wrap="wrap">
                      <Badge variant="light" color="blue">
                        {recommendedGame.game.genre}
                      </Badge>
                      <Badge variant="light" color="green">
                        {recommendedGame.game.playtime}
                      </Badge>
                    </Group>

                    <Group gap="xs" wrap="wrap">
                      {recommendedGame.game.platforms.map((platform, platformIndex) => (
                        <Badge key={platformIndex} variant="outline" size="sm">
                          {platform}
                        </Badge>
                      ))}
                    </Group>

                    <Group gap="xs" align="center">
                      <Text size="sm" fw={500}>
                        Price:
                      </Text>
                      <Anchor
                        href={recommendedGame.game.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ${recommendedGame.game.currentPrice?.toFixed(2) ?? 'N/A'}
                      </Anchor>
                      {recommendedGame.game.discount &&
                        recommendedGame.game.originalPrice &&
                        recommendedGame.game.discount > 0 && (
                          <Badge color="red" variant="light" size="sm">
                            {recommendedGame.game.discount}% off from $
                            {recommendedGame.game.originalPrice?.toFixed(2)}
                          </Badge>
                        )}
                    </Group>

                    <Divider />

                    <Text size="sm">
                      <Text component="span" fw={500}>
                        Reasoning:
                      </Text>{' '}
                      {recommendedGame.reasoning}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}
