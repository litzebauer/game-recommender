import { createServerFn } from '@tanstack/react-start'

export const analyzeMood = createServerFn({
	method: 'POST',
})
	.validator((d: { mood: string }) => d)
	.handler(async ({ data }): Promise<{ genres: string[] }> => {
		// TODO: Implement OpenAI integration for mood analysis
		// For now, return a simple mapping
		const moodToGenres: Record<string, string[]> = {
			'dark fantasy': ['Action RPG', 'Dark Fantasy', 'Adventure'],
			'relaxing': ['Simulation', 'Puzzle', 'Adventure'],
			'competitive': ['FPS', 'MOBA', 'RTS'],
			'story': ['RPG', 'Adventure', 'Visual Novel'],
		};

		const genres = moodToGenres[data.mood.toLowerCase()] || ['Action', 'Adventure'];
		return { genres };
	}); 