# Researcher AI Agent

A modular TypeScript-based research agent that collects, enriches, and analyzes ecosystem-specific content from multiple sources. Built on top of ElizaOS, this agent serves as a comprehensive news aggregator, deep research tool, and KOL (Key Opinion Leader) assistant.

## Current Focus: Movement Labs Ecosystem

Currently configured to track the @movementlabsxyz ecosystem and Move programming language, but designed to be easily adaptable for other ecosystems.

### Key Features

- **Ecosystem-Specific Data Collection**
  - Twitter/X posts and threads monitoring
  - YouTube and X Spaces transcript processing
  - Discord channel messages and announcements
  - Manual information input from trusted sources

- **AI-Powered Analysis**
  - Automated alpha discovery
  - Content summarization and categorization
  - Thread and article idea generation
  - Sentiment and trend analysis

- **Automated Content Generation**
  - Daily and weekly ecosystem summaries
  - Structured Twitter threads with source attribution
  - Deep-dive articles and analysis
  - Alpha alerts and ecosystem updates

- **Workflow Management**
  - Discord-based approval system
  - Content scheduling and publishing
  - Partner information submission
  - Multi-role access control

## Architecture

Built on the AI-News aggregator framework with significant customizations:

- **Core Framework**: ElizaOS (TypeScript/Node.js)
- **Data Storage**: Supabase (PostgreSQL)
- **Task Scheduling**: BullMQ
- **Vector Storage**: pgvector (planned)

## Getting Started

### Prerequisites

- Node.js ≥ 18
- TypeScript 4.x
- PostgreSQL (for Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/researcher-ai.git

# Install dependencies
cd researcher-ai
npm install

# Create .env file
cp example.env .env
```

### Configuration

1. Create a `.env` file with your credentials:
```env
# SocialData API
SOCIALDATA_API_KEY=your_key_here
SOCIALDATA_BASE_URL=https://api.socialdata.tools

# OpenAI Configuration
OPENAI_API_KEY=your_key_here

# Discord Bot
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# Database
DATABASE_URL=your_supabase_url_here
```

2. Configure your ecosystem sources in `config/sources.json`:
```json
{
  "twitter": {
    "accounts": ["@movementlabsxyz", "@rushimanche"],
    "keywords": ["$MOVE", "Movement Labs", "Cornucopia"],
    "maxResults": 100
  },
  "youtube": {
    "channels": ["MovementLabs"],
    "maxResults": 10
  }
}
```

## Usage

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start

# Fetch historical data (default: last 60 days)
npm run historical

# Fetch data for specific date range
npm run historical -- --after=2024-01-01 --before=2024-02-01
```

## Content Format Examples

### Weekly Recap Format

```markdown
**Movement Weekly Recap**

Here are the highlights from the Movement ecosystem this past week:

🔹 **[Highlight 1]**
Details and impact...

🔹 **[Highlight 2]**
Details and impact...

See sources in comments!

[Thread continues with source links in comments]
```

## Extending for New Ecosystems

The agent is designed to be ecosystem-agnostic. To adapt for a new ecosystem:

1. Create a new ecosystem configuration file in `config/ecosystems/`
2. Define relevant accounts, keywords, and sources
3. Customize summary templates if needed
4. Update Discord workflow settings

## Contributing

This project is built on top of the [AI-News](https://github.com/bozp-pzob/ai-news) framework. When contributing:

1. Create feature branches from `main`
2. Keep core framework changes separate from ecosystem-specific changes
3. Test with multiple ecosystem configurations
4. Submit PRs with clear documentation

## License

MIT License - see the [LICENSE](LICENSE) file for details

---

**Note**: This is a customized version of the AI-News aggregator. For core framework documentation, see the original [README.md](README.md). 