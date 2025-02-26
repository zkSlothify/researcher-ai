Introduction to Eliza
 As seen powering @DegenSpartanAI and @aixvc_agent

What is Eliza?
Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents. Built with TypeScript, it provides a flexible and extensible platform for developing intelligent agents that can interact across multiple platforms while maintaining consistent personalities and knowledge.

Technical Report (Whitepaper)
Examples (Awesome Eliza)
Key Features
Platform Integration: Clients for Discord, X (Twitter), Telegram, and many others
Flexible Model Support: Deepseek, Ollama, Grok, OpenAI, Anthropic, Gemini, LLama, etc.
Character System: Create diverse agents using characterfiles
Multi-Agent Architecture: Manage multiple unique AI personalities simultaneously
Memory Management: Easily ingest and interact with documents using RAG
Media Processing: PDF, URLs, Audio transcription, Video processing, Image analysis, Conversation summarization
Technical Foundation:
100% TypeScript implementation
Modular architecture
Highly extensible action and plugin system
Custom client support
Comprehensive API
Use Cases
Eliza can be used to create:

AI Assistants: Customer support agents, Community moderators, Personal assistants
Social Media Personas: Automated content creators, Brand representatives, Influencers
Knowledge Workers: Research assistants, Content analysts, Document processors
Interactive Characters: Role-playing characters, Educational tutors, Entertainment bots
Architecture
 Source: https://x.com/0xCygaar/status/1874575841763770492

The characterfile contains everything about the agent's personality, backstory, knowledge, and topics to talk about, as well as which clients / models / and plugins to load. The database is where an agent stores relevant info for generating responses, including previous tweets, interactions, and embeddings. Without a db, agent's wouldn't be able to give good responses.

Then we have the "runtime", which you can think of as the core agent logic. It's effectively the coordination layer of the agent or the brain, calling the necessary modules and external services to generate responses and take actions. Within the runtime is the LLM, which processes various inputs and generates responses or action items for the agent to take. Devs can declare which LLM provider to use in the characterfile. The runtime also handles the registration of plugins, which are called when a user input asks it take an action, such as transferring ETH on Abstract or doing a web search.

Eliza supports a variety of clients including Discord, Twitter, Slack, Farcaster, and others. The client is basically where the agent will live and interact with users. Agents can run on multiple clients at once. Clients can have modules to handle different interactions, such as responding to tweets, or even participating in Twitter spaces.

Getting Started
For a more detailed guide, check out our Quickstart Guide to begin your journey with Eliza.

Prerequisites
Python 2.7+
Node.js 23+
pnpm
Note for Windows Users: WSL 2 is required.

The start script provides an automated way to set up and run Eliza:

Automated Start
git clone https://github.com/elizaos/eliza-starter.git
cd eliza-starter
cp .env.example .env
pnpm i && pnpm build && pnpm start

OR

git clone https://github.com/elizaos/eliza
cd eliza
sh scripts/start.sh

For detailed instructions on using the start script, including character management and troubleshooting, see our Quickstart Guide.

Note: The start script handles all dependencies, environment setup, and character management automatically.

