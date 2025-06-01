# GameFinder 🎮

A modern, AI-powered game recommendation chatbot that helps users discover their next favorite games through natural language conversations.

## 🌟 Features

- **Natural Language Search**: Describe what you're looking for in plain English
- **AI-Powered Recommendations**: Uses LangChain and OpenAI for intelligent game suggestions
- **Real-time Game Data**: Integrates with RAWG API for comprehensive game information
- **Price Tracking**: Integration with IsThereAnyDeal (ITAD) for game pricing
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Type-Safe**: Full TypeScript implementation for better development experience

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TanStack Router** - Type-safe routing
- **TanStack Start** - Full-stack React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend & AI

- **LangChain** - AI framework for building applications with LLMs
- **LangGraph** - Graph-based workflow orchestration
- **OpenAI** - Large language model integration
- **Tavily** - Web search capabilities

### Development Tools

- **TypeScript** - Type safety and better DX
- **Vinxi** - Build tool and development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite** - Fast build tool

### External APIs

- **RAWG API** - Game database and information
- **IsThereAnyDeal (ITAD)** - Game pricing and deals

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key
- RAWG API key
- ITAD API key (optional, for pricing features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd game-recommender-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # RAWG API Configuration
   RAWG_API_KEY=your_rawg_api_key_here

   # ITAD API Configuration
   ITAD_API_KEY=your_itad_api_key_here

   # Tavily Search
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

   **Optional Environment Variables:**

   ```env
   # Model Configuration
   DEFAULT_MODEL_NAME=anthropic/claude-3.5-haiku  # Default model for all agents
   MODEL_TEMPERATURE=0                              # Temperature for model responses (0-1)
   MAX_OUTPUT_TOKENS=4096                          # Maximum tokens in model responses
   MODEL_VERBOSE=false                             # Enable verbose logging for models

   # OpenRouter Settings
   OPENROUTER_REFERER=http://localhost:3000        # Referer header for OpenRouter requests
   OPENROUTER_TITLE=Game Recommender Chatbot       # Title for OpenRouter requests

   # LangSmith Configuration (for observability and debugging)
   LANGSMITH_TRACING=true                       # Enable LangSmith tracing
   LANGSMITH_API_KEY=your_langsmith_api_key_here   # LangSmith API key
   LANGSMITH_PROJECT=game-recommender              # Project name in LangSmith
   LANGSMITH_ENDPOINT=https://api.smith.langchain.com  # LangSmith API endpoint

   # Agent-Specific Model Overrides
   ANALYZE_QUERY_MODEL=anthropic/claude-3.5-haiku      # Model for query analysis
   ASSESS_QUERY_MODEL=anthropic/claude-3.5-haiku       # Model for query assessment
   ASSESS_RESULTS_MODEL=anthropic/claude-3.5-haiku     # Model for assessing results
   EXTRACT_GAMES_MODEL=anthropic/claude-3.5-haiku     # Model for extracting games from search results
   GENERATE_RECOMMENDATIONS_MODEL=anthropic/claude-3.5-haiku  # Model for generating recommendations
   REFINE_SEARCH_MODEL=anthropic/claude-3.5-haiku  # Model for refining search
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000` to see the application.

### API Keys Setup

#### OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to the API Keys section in your dashboard
4. Create a new API key
5. Choose your preferred models and set up billing if needed

#### RAWG API Key

1. Visit [RAWG API](https://rawg.io/apidocs)
2. Create a free account
3. Get your API key from the dashboard

#### ITAD API Key

1. Visit [IsThereAnyDeal API](https://itad.docs.apiary.io/)
2. Follow their documentation to get an API key

#### LangSmith API Key (Optional)

1. Visit [LangSmith](https://smith.langchain.com/)
2. Create an account or sign in with your existing LangChain account
3. Navigate to the Settings or API Keys section
4. Create a new API key
5. Set up a project name (e.g., "game-recommender") to organize your traces
6. Enable tracing by setting `LANGSMITH_TRACING=true` in your environment variables

LangSmith provides powerful observability features for your AI workflows:

- **Trace Visualization**: See how queries flow through your LangGraph agents
- **Performance Monitoring**: Track latency and token usage for each model call
- **Debugging Tools**: Inspect inputs, outputs, and intermediate steps
- **Cost Analysis**: Monitor API usage and costs across different models

## 📖 Usage

1. **Start a conversation**: Type what kind of game you're looking for in natural language

   - "I want a relaxing puzzle game"
   - "Show me action RPGs similar to The Witcher"
   - "I need a co-op game for 4 players"

2. **Get recommendations**: The AI will analyze your request and provide personalized game recommendations

3. **Explore results**: Each recommendation includes:
   - Game title and description
   - Screenshots and media
   - Ratings and reviews
   - Platform availability
   - Pricing information (if ITAD is configured)

## 🏗️ Project Structure

```
game-recommender-chatbot/
├── app/
│   ├── client/           # External API clients
│   │   ├── rawg/        # RAWG API integration
│   │   └── itad/        # ITAD API integration
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/
│   │   ├── agents/      # LangChain agents
│   │   ├── models/      # Data models
│   │   ├── schemas/     # Zod schemas
│   │   ├── services/    # Business logic
│   │   └── tools/       # LangChain tools
│   ├── routes/          # Application routes
│   │   └── api/         # API endpoints
│   └── styles/          # Global styles
├── public/              # Static assets
└── openapi/            # OpenAPI specifications
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run dev:mock` - Start with mock data (for development without API keys)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Mock Development

For development without API keys, you can use mock mode:

```bash
npm run dev:mock
```

This will use mock data instead of making real API calls.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [RAWG](https://rawg.io/) for providing comprehensive game data
- [IsThereAnyDeal](https://isthereanydeal.com/) for game pricing information
- [OpenAI](https://openai.com/) for powering the AI recommendations
- [LangChain](https://langchain.com/) for the AI framework
- [Radix UI](https://radix-ui.com/) for accessible components

## 📞 Support

If you have any questions or run into issues, please:

1. Check the existing [Issues](../../issues)
2. Create a new issue with detailed information
3. Include your environment details and steps to reproduce

---

**Happy Gaming! 🎮**
