# Game Recommender Chatbot

A chatbot that intelligently recommends video games based on user preferences using LangChain, LangGraph, and large language models.

## Features

- Intelligent game recommendations based on user preferences
- Real-time data gathering through search tools
- Structured output for consistent recommendations
- Support for multiple AI model providers

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Environment Configuration

The application uses dotenv to load environment variables from a `.env.config` file.

1. Create a `.env.config` file in the root directory with the following variables:

```
# Model Configuration
MODEL_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash-preview-04-17
GEMINI_API_KEY=your-api-key-here
MODEL_TEMPERATURE=0.2
MAX_OUTPUT_TOKENS=4096
MODEL_VERBOSE=true
```

2. Replace `your-api-key-here` with your actual Gemini API key

### Environment Variables

| Variable          | Description                | Default                        |
| ----------------- | -------------------------- | ------------------------------ |
| MODEL_PROVIDER    | AI model provider to use   | gemini                         |
| GEMINI_MODEL      | Gemini model name          | gemini-2.5-flash-preview-04-17 |
| GEMINI_API_KEY    | Your Gemini API key        | (required)                     |
| MODEL_TEMPERATURE | Temperature for generation | 0.2                            |
| MAX_OUTPUT_TOKENS | Maximum output tokens      | 4096                           |
| MODEL_VERBOSE     | Enable verbose logging     | true                           |

## Running the Application

```
npm run dev
```

## Building for Production

```
npm run build
```

## License

[MIT License](LICENSE)
