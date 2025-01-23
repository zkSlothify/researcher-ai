# AI News Aggregator

A modular TypeScript-based news aggregator that collects, enriches, and analyzes AI-related content from multiple sources using OpenAI's GPT models.

## Features

- **Multiple Data Sources**
  - Twitter posts monitoring
  - Discord channel messages and announcements
  - GitHub activity tracking
  - Solana token analytics
  - CoinGecko market data

- **Content Enrichment**
  - AI-powered topic extraction
  - Automated content summarization 
  - Image generation capabilities

- **Storage & Analysis**
  - SQLite database for persistent storage
  - Daily summary generation
  - JSON export functionality

## Prerequisites

- Node.js ≥ 18
- TypeScript 4.x
- SQLite3

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-news.git

# Install dependencies
cd ai-news
npm install

# Create .env file and add your credentials
cp example.env .env
```

## Configuration

Create a `.env` file with the following variables:

```env
TWITTER_USERNAME=           # Twitter account username
TWITTER_PASSWORD=           # Twitter account password 
TWITTER_EMAIL=              # Twitter account email

OPENAI_API_KEY=            # OpenAI API key

DISCORD_APP_ID=            # Discord application ID
DISCORD_TOKEN=             # Discord bot token
```

## Running the Application

```bash
# Development mode
npm run dev

# Build and run production
npm run build
npm start

# Generate daily summary
npm run generator
```

## Project Structure

```
src/
├── aggregator/          # Core aggregation logic
├── plugins/
│   ├── ai/             # AI provider implementations
│   ├── enrichers/      # Content enrichment plugins
│   ├── generators/     # Summary generation tools
│   ├── sources/        # Data source implementations
│   └── storage/        # Database storage handlers
├── types.ts            # TypeScript type definitions
├── index.ts            # Main application entry
└── generator.ts        # Summary generator entry
```

## Adding New Sources

1. Implement the `ContentSource` interface
2. Add configuration in `index.ts`
3. Register the source with the aggregator

Example:
```typescript
class NewSource implements ContentSource {
  public name: string;
  
  async fetchItems(): Promise<ContentItem[]> {
    // Implementation
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Data Structures

### ContentItem
Core data structure used throughout the application:
```typescript
interface ContentItem {
  id?: number;          // Assigned by storage
  cid: string;          // Content Id from source
  type: string;         // "tweet", "newsArticle", "discordMessage", etc.
  source: string;       // "twitter", "discord", "github", etc.
  title?: string;       // Optional title
  text?: string;        // Main content text
  link?: string;        // URL to original content
  topics?: string[];    // AI-generated topics
  date?: number;        // Creation/publication timestamp
  metadata?: Record<string, any>; // Additional source-specific data
}
```

### Example JSON Output
Daily summaries are stored in JSON files with this structure:
```json
[
  {
    "title": "Topic Category",
    "messages": [
      {
        "text": "Summary or content text",
        "sources": [
          "https://source1.com/link",
          "https://source2.com/link"
        ],
        "images": [
          "https://image1.com/url"
        ],
        "videos": [
          "https://video1.com/url"
        ]
      }
    ]
  }
]
```

## Supported Source Types

### Twitter
- Monitors specified Twitter accounts
- Captures tweets, retweets, media
- Metadata includes engagement metrics

### Discord
- Channel messages monitoring
- Announcement tracking
- Server activity summaries

### GitHub
- Repository activity tracking
- Pull requests and commits
- Issue tracking and summaries

### Cryptocurrency Analytics
- Token price monitoring (Solana)
- Market data from CoinGecko
- Trading metrics and volume data

## Scheduled Tasks

The application runs hourly tasks via GitHub Actions:
- Twitter monitoring: every 30 minutes
- Discord monitoring: every 6 minutes
- Announcements: hourly
- GitHub data: every 6 hours
- Market analytics: every 12 hours
- Daily summaries: generated once per day

## Environment Variables Reference

```env
# Twitter Authentication
TWITTER_USERNAME=           # Account username
TWITTER_PASSWORD=           # Account password
TWITTER_EMAIL=              # Account email

# OpenAI Configuration
OPENAI_API_KEY=            # API key for GPT models

# Discord Integration
DISCORD_APP_ID=            # Discord application ID
DISCORD_TOKEN=             # Bot token

# Analytics
BIRDEYE_API_KEY=          # Optional: For Solana token analytics
```

## Storage

The application uses SQLite with two main tables:

### Items Table
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cid TEXT,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT,
  text TEXT,
  link TEXT,
  topics TEXT,
  date INTEGER,
  metadata TEXT
);
```

### Summary Table
```sql
CREATE TABLE summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT,
  text TEXT,
  date INTEGER
);
```
