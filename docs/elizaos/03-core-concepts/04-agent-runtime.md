🤖 Agent Runtime
The AgentRuntime is the core runtime environment for Eliza agents. It handles message processing, state management, plugin integration, and interaction with external services. You can think of it as the brains that provide the high-level orchestration layer for Eliza agents.




The runtime follows this general flow:

Agent loads character config, plugins, and services
Processes knowledge sources (e.g., documents, directories)
Receives a message, composes the state
Processes actions and then evaluates
Retrieves relevant knowledge fragments using RAG
Generates and executes responses, then evaluates
Updates memory and state
Overview
The AgentRuntime class is the primary implementation of the IAgentRuntime interface, which manages the agent's core functions, including:

Component	Description	API Reference	Related Files
Clients	Supports multiple communication platforms for seamless interaction.	Clients API	clients.ts, Discord, Telegram, Twitter, Farcaster, Lens, Slack, Auto, GitHub
State	Maintains context for coherent cross-platform interactions, updates dynamically. Also tracks goals, knowledge, and recent interactions	State API	state.ts
Plugins	Dynamic extensions of agent functionalities using custom actions, evaluators, providers, and adapters	Plugins API	plugins.ts, actions, evaluators, providers
Services	Connects with external services for IMAGE_DESCRIPTION, TRANSCRIPTION, TEXT_GENERATION, SPEECH_GENERATION, VIDEO, PDF, BROWSER, WEB_SEARCH, EMAIL_AUTOMATION, and more	Services API	services.ts
Memory Systems	Creates, retrieves, and embeds memories and manages conversation history.	Memory API	memory.ts
Database Adapters	Persistent storage and retrieval for memories and knowledge	databaseAdapter	MongoDB, PostgreSQL, SQLite, Supabase, PGLite, Qdrant, SQL.js
Cache Management	Provides flexible storage and retrieval via various caching methods.	Cache API	cache.ts
Advanced: IAgentRuntime Interface
Key Methods
initialize(): Sets up the agent's runtime environment, including services, plugins, and knowledge processing.
processActions(): Executes actions based on message content and state.
evaluate(): Assesses messages and state using registered evaluators.
composeState(): Constructs the agent's state object for response generation.
updateRecentMessageState(): Updates the state with recent messages and attachments.
registerService(): Adds a service to the runtime.
registerMemoryManager(): Registers a memory manager for specific types of memories.
ensureRoomExists() / ensureUserExists(): Ensures the existence of rooms and users in the database.
WIP

Service System
Services provide specialized functionality with standardized interfaces that can be accessed cross-platform:

See Example
State Management
The runtime maintains comprehensive state through the State interface:

interface State {
    // Core identifiers
    userId?: UUID;
    agentId?: UUID;
    roomId: UUID;

    // Character information
    bio: string;
    lore: string;
    messageDirections: string;
    postDirections: string;

    // Conversation context
    actors: string;
    actorsData?: Actor[];
    recentMessages: string;
    recentMessagesData: Memory[];

    // Goals and knowledge
    goals?: string;
    goalsData?: Goal[];
    knowledge?: string;
    knowledgeData?: KnowledgeItem[];
    ragKnowledgeData?: RAGKnowledgeItem[];
}

// State management methods
async function manageState() {
    // Initial state composition
    const state = await runtime.composeState(message, {
        additionalContext: "custom context"
    });

    // Update state with new messages
    const updatedState = await runtime.updateRecentMessageState(state);
}

Plugin System
Plugins extend agent functionality through a modular interface. The runtime supports various types of plugins including clients, services, adapters, and more:

interface Plugin {
    name: string;
    description: string;
    actions?: Action[];        // Custom behaviors
    providers?: Provider[];    // Data providers
    evaluators?: Evaluator[]; // Response assessment
    services?: Service[];     // Background processes
    clients?: Client[];       // Platform integrations
    adapters?: Adapter[];    // Database/cache adapters
}

Plugins can be configured through characterfile settings:

{
  "name": "MyAgent",
  "plugins": [
    "@elizaos/plugin-solana",
    "@elizaos/plugin-twitter"
  ]
}

For detailed information about plugin development and usage, see the ElizaOS Registry.

Running Multiple Agents
To run multiple agents:

pnpm start --characters="characters/agent1.json,characters/agent2.json"

Or use environment variables:

REMOTE_CHARACTER_URLS=https://example.com/characters.json

FAQ
What's the difference between an agent and a character?
A character defines personality and knowledge, while an agent provides the runtime environment and capabilities to bring that character to life.

How do I choose the right database adapter?
Choose based on your needs:

MongoDB: For scalable, document-based storage
PostgreSQL: For relational data with complex queries
SQLite: For simple, file-based storage
Qdrant: For vector search capabilities
How do I implement custom plugins?
Create a plugin that follows the plugin interface and register it with the runtime. See the plugin documentation for detailed examples.

Do agents share memory across platforms?
By default, agents maintain separate memory contexts for different platforms to avoid mixing conversations. Use the memory management system and database adapters to persist and retrieve state information.

How do I handle multiple authentication methods?
Use the character configuration to specify different authentication methods for different services. The runtime will handle the appropriate authentication flow.

How do I manage environment variables?
Use a combination of:

.env files for local development
Character-specific settings for per-agent configuration
Environment variables for production deployment
Can agents communicate with each other?
Yes, through the message system and shared memory spaces when configured appropriately.