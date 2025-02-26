Overview
Eliza is a framework for creating AI agents that can interact across multiple platforms.

Features

Modular Design: Plugins and services allow for flexible customization.
Scalable Knowledge: Supports both RAG-based and direct knowledge processing.
Stateful Interactions: Maintains context across conversations.
Multi-Agent Support: Supports running multiple agents with distinct configurations.
Multi-Platform Support: Integrates with various clients (e.g., Discord, Telegram).
This document provides a high-level overview of the system architecture and how components work together.

Agent Runtime
The Brain

The Runtime (src/runtime.ts) acts as the control tower for your AI agents. Think of it as a conductor leading an orchestra - it ensures all parts work together harmoniously. It serves as the central coordination layer for message processing, memory management, state composition, action execution, and integration with AI models and external services.

Core Functions:
Coordinates message processing
Manages the agent's lifecycle
Handles integration with AI models
Orchestrates plugins and services
Character Files
The Personality

Character Files (src/types.ts) define agent personalities and capabilities including biographical information, interaction styles, plugin configurations, and platform integrations.

The character file defines who your agent is - like a script for an actor. It includes:

Biographical information and backstory
Topics the agent can discuss
Writing style and tone
Which AI models to use
Which plugins to load
Which platforms to connect to
Client System
The Interface

Clients connect your agent to different platforms (Discord, Twitter, Slack, Farcaster, etc.) while maintaining consistent behavior across all interfaces. Each client can handle different types of interactions:

Chat messages
Social media posts
Voice conversations
Platform-specific features
Actions
What Agents Can Do

Actions (src/actions.ts) are like tools in a toolbox. They define how agents respond and interact with messages, enabling custom behaviors, external system interactions, media processing, and platform-specific features.

Evaluators
Quality Control

Evaluators (src/evaluators.ts) act like referees, making sure the agent follows rules and guidelines. They monitor conversations and help improve agent responses over time by assessing conversations and maintaining agent knowledge through fact extraction, goal tracking, memory building, and relationship management.

Providers
Information Flow

Providers (src/providers.ts) are the agent's eyes and ears, like a newsroom keeping them informed about the world. They supply real-time information to agents by integrating external APIs, managing temporal awareness, and providing system status updates to help agents make better decisions.

Memory & Knowledge Systems
The framework implements specialized memory systems through:

Memory Manager
The Memory Manager (src/memory.ts) acts like a personal diary and helps agents remember:

Recent conversations
Important facts
User interactions
Immediate context for current discussions
Knowledge Systems
Think of this as the agent's library (src/knowledge.ts, src/ragknowledge.ts), where information is:

Organized into searchable chunks
Converted into vector embeddings
Retrieved based on relevance
Used to enhance responses
Data Management
The data layer provides robust storage and caching through:

Database System
The database (src/database.ts) acts as a filing cabinet, storing:

Conversation histories
User interactions
Transaction management
Vector storage
Relationship tracking
Embedded knowledge
Agent state
See also: Memory Management

Cache System
Performance Optimization

The Cache System (src/cache.ts) creates shortcuts for frequently accessed information, making agents respond faster and more efficiently.

System Flow
When someone interacts with your agent, the Client receives the message and forwards it to the Runtime which processes it with the characterfile configuration. The Runtime loads relevant memories and knowledge, uses actions and evaluators to determine how to response, gets additional context through providers. Then the Runtime generates a response using the AI model, stores new memories, and sends the response back through the client.

Common Patterns
Memory Usage (src/memory.ts)
// Store conversation data
await messageManager.createMemory({
    id: messageId,
    content: { text: "Message content" },
    userId: userId,
    roomId: roomId
});

// Retrieve context
const recentMessages = await messageManager.getMemories({
    roomId: roomId,
    count: 10
});

Action Implementation (src/actions.ts)
const customAction: Action = {
    name: "CUSTOM_ACTION",
    similes: ["ALTERNATE_NAME"],
    description: "Action description",
    validate: async (runtime, message) => {
        // Validation logic
        return true;
    },
    handler: async (runtime, message) => {
        // Implementation logic
        return true;
    }
};

Provider Integration (src/providers.ts)
const dataProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory) => {
        // Fetch and format data
        return "Formatted context string";
    }
};

FAQ
What's the difference between Actions, Evaluators, and Providers?
Actions define what an agent can do, Evaluators analyze what happened, and Providers supply information to help make decisions.

Can I use multiple AI models with one agent?
Yes, agents can be configured to use different models for different tasks (chat, image generation, embeddings) through the modelProvider settings.

How does memory persistence work?
Memory is stored through database adapters which can use SQLite, PostgreSQL, or other backends, with each type (messages, facts, knowledge) managed separately.

What's the difference between Lore and Knowledge?
Lore defines the character's background and history, while Knowledge represents factual information the agent can reference and use.

How do I add custom functionality?
Create plugins that implement the Action, Provider, or Evaluator interfaces and register them with the runtime.

Do I need to implement all components?
No, each component is optional. Start with basic Actions and add Evaluators and Providers as needed.

How does RAG integration work?
Documents are chunked, embedded, and stored in the knowledge base for semantic search during conversations via the RAGKnowledgeManager.

What's the recommended database for production?
PostgreSQL with vector extensions is recommended for production, though SQLite works well for development and testing.