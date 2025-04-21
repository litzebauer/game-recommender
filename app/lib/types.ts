export type Game = {
	title: string;
	platform: string;
	genres?: string[];
	playtimeMinutes?: number;
	source: 'Steam' | 'Manual' | 'GamePass' | 'PS5';
};

export type MCPContext = {
	userId: string;
	platforms: string[];
	libraries: Record<string, Game[]>;
	history: {
		moods: string[];
		recommendations: Game[];
	};
};

export type RecommendationRequest = {
	userId: string;
	mood: string;
	platforms: string[];
	steamId?: string;
	manualGames?: Game[];
};

export type RecommendationResponse = {
	recommendation: Game;
	explanation: string;
}; 