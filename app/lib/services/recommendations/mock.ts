import { GetRecommendations } from '.';
import { GameRecommendation } from '../../schemas/gameRecommendation';

export const getRecommendations: GetRecommendations = async () => {
  // Add 2 second delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  const recommendations: GameRecommendation[] = [
    {
      game: {
        id: '1',
        name: 'The Witcher 3: Wild Hunt',
        description:
          'An epic open-world RPG featuring Geralt of Rivia in his most expansive adventure yet. Hunt monsters, make choices that matter, and explore a richly detailed fantasy world.',
        currentPrice: 39.99,
        originalPrice: 59.99,
        discount: 33,
        tags: ['RPG', 'Open World', 'Fantasy', 'Story Rich'],
        imageUrl: '/placeholder.svg',
      },
      reasoning:
        'Perfect match for your interest in immersive storytelling and fantasy settings. The game offers hundreds of hours of content with meaningful choices.',
    },
    {
      game: {
        id: '2',
        name: 'Hades',
        description:
          "A rogue-like dungeon crawler that combines the best aspects of Supergiant's critically acclaimed titles, including the fast-paced action of Bastion and the rich atmosphere of Transistor.",
        currentPrice: 24.99,
        tags: ['Rogue-like', 'Action', 'Indie', 'Greek Mythology'],
        imageUrl: '/placeholder.svg',
      },
      reasoning:
        'Recommended for its perfect balance of challenging gameplay and engaging narrative. Each run feels unique and rewarding.',
    },
    {
      game: {
        id: '3',
        name: 'Stardew Valley',
        description:
          "A charming farming simulation game where you inherit your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
        currentPrice: 14.99,
        tags: ['Simulation', 'Farming', 'Relaxing', 'Pixel Art'],
        imageUrl: '/placeholder.svg',
      },
      reasoning:
        'Ideal for relaxing gameplay sessions. Offers the perfect escape with its peaceful farming mechanics and charming community interactions.',
    },
    {
      game: {
        id: '4',
        name: 'Cyberpunk 2077',
        description:
          'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant.',
        currentPrice: 29.99,
        originalPrice: 59.99,
        discount: 50,
        tags: ['RPG', 'Open World', 'Cyberpunk', 'Sci-Fi'],
        imageUrl: '/placeholder.svg',
      },
      reasoning:
        'Matches your preference for futuristic settings and character customization. The game features deep RPG mechanics and a compelling storyline.',
    },
    {
      game: {
        id: '5',
        name: 'Among Us',
        description:
          'An online multiplayer social deduction game where you work together to complete tasks while trying to identify the impostor among your crewmates.',
        currentPrice: 4.99,
        tags: ['Multiplayer', 'Social Deduction', 'Casual', 'Party Game'],
        imageUrl: '/placeholder.svg',
      },
      reasoning:
        'Perfect for social gaming sessions with friends. Simple to learn but offers endless entertainment through player interaction and deduction.',
    },
  ];

  return recommendations.slice(0, 5);
};
