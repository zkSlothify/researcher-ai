📊 Evaluators
Evaluators are core components that assess and extract information from conversations. Agents use evaluators to automatically process conversations after they happen to help build up their knowledge and understanding over time.

They integrate with the AgentRuntime evaluation system to enable reflection, fact-gathering, and behavioral adaptation and run after each agent action to help maintain contextural awareness. Enabling agents to reflect on their actions and world state is crucial for improving coherence and problem-solving abilities. For example, by reflecting on its performance, an agent can refine its strategies and improve its interactions over time.

How They Work
Evaluators run automatically after each agent action (responses, messages, activities, or API calls) to analyze what happened and update the agent's understanding. They extract important information (like facts about users), track progress on goals, and learn from interactions.

Let's say you're at a party and meet someone new. During the conversation:

You learn their name is Sarah
They mention living in Seattle
They work as a software engineer
After the conversation, your brain:

Stores these facts for later
Updates your understanding of who Sarah is
Might note "I should connect Sarah with Bob who's also in tech"
This is exactly how evaluators work for agents - they run in the background to extract insights, track progress, and build up the agent's knowledge over time. However there are some limitations, such as evaluators only process current interactions (can't modify past data), they run after actions complete (not during). Therefore evaluators are best for analysis rather than critical operations.

The key thing to remember is: evaluators are your agent's way of learning and growing from each interaction, just like how we naturally process and learn from our conversations.

Common Uses
Fact Evaluator: Learns and remembers facts about users
Goal Evaluator: Tracks progress on objectives
Trust Evaluator: Builds understanding of relationships
Sentiment Evaluator: Tracks emotional tone of conversations
Implementation
Here's a basic example of an evaluator implementation:

const evaluator = {
    // Should this evaluator run right now?
    validate: async (runtime, message) => {
        // Return true to run, false to skip
        return shouldRunThisTime;
    },

    // What to do when it runs
    handler: async (runtime, message) => {
        // Extract info, update memory, etc
        const newInfo = extractFromMessage(message);
        await storeInMemory(newInfo);
    }
};

Core Interface
interface Evaluator {
    name: string;                // Unique identifier
    similes: string[];          // Similar evaluator descriptions
    description: string;        // Purpose and functionality
    validate: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;
    handler: (runtime: IAgentRuntime, message: Memory) => Promise<any>;
    examples: EvaluatorExample[];
}


For full type definitions, see the Evaluator interface documentation.

Validation Function
The validate function is critical for determining when an evaluator should run. For peak performance, proper validation ensures evaluators run only when necessary. For instance, a customer service agent might check if all required user data has been collected and only run if data is still missing.

validate: async (runtime: IAgentRuntime, message: Memory) => boolean

Determines if evaluator should run for current message. Returns true to execute handler, false to skip. Should be efficient and quick to check.

Handler Function
The handler function contains the evaluator's code. It is where the logic for analyzing data, extracting information, and triggering actions resides.

handler: async (runtime: IAgentRuntime, message: Memory) => any

Contains main evaluation logic and runs when validate() returns true. Can access runtime services and memory.

tip
Ensure Evaluators are unique and lightweight

Avoid complex operations or lengthy computations within the evaluator's handler function and ensure that evaluators have clear and distinct responsibilities not already handled by other components for peak performance.

Memory Integration
Results are stored using runtime memory managers:

// Example storing evaluation results 
const memory = await runtime.memoryManager.addEmbeddingToMemory({
    userId: user?.id,
    content: { text: evaluationResult },
    roomId: roomId,
    embedding: await embed(runtime, evaluationResult)
});

await runtime.memoryManager.createMemory(memory);

Fact Evaluator
Deep Dive
For a comprehensive guide on how the fact evaluator system works, including implementation details and best practices, check out our Fact Evaluator Guide.

The Fact Evaluator is one of the most powerful built-in evaluators. It processes convos to:

Extract meaningful facts and opinions about users and the world
Distinguish between permanent facts, opinions, and status
Track what information is already known vs new information
Build up the agent's understanding over time through embeddings and memory storage
Facts are stored with the following structure:

interface Fact {
    claim: string;      // The actual information extracted
    type: "fact" | "opinion" | "status";  // Classification of the information
    in_bio: boolean;    // Whether this info is already in the agent's knowledge
    already_known: boolean;  // Whether this was previously extracted
}


Example Facts
Here's an example of extracted facts from a conversation:

User: I finally finished my marathon training program!
Agent: That's a huge accomplishment! How do you feel about it?
User: I'm really proud of what I achieved. It was tough but worth it.
Agent: What's next for you?
User: I'm actually training for a triathlon now. It's a whole new challenge.


const extractedFacts = [
    {
        "claim": "User completed marathon training",
        "type": "fact",          // Permanent info / achievement
        "in_bio": false,
        "already_known": false   // Prevents duplicate storage
    },
    {
        "claim": "User feels proud of their achievement",
        "type": "opinion",       // Subjective views or feelings
        "in_bio": false,
        "already_known": false
    },
    {
        "claim": "User is currently training for a triathlon",
        "type": "status",        // Ongoing activity, changeable
        "in_bio": false,
        "already_known": false
    }
];

View Full Fact Evaluator Implementation
Source: https://github.com/elizaOS/eliza/blob/main/packages/plugin-bootstrap/src/evaluators/fact.ts

Goal Evaluator
The Goal Evaluator tracks progress on conversation objectives by analyzing messages and updating goal status. Goals are structured like this:

interface Goal {
    id: string;
    name: string;
    status: "IN_PROGRESS" | "DONE" | "FAILED";
    objectives: Objective[];
}

Example Goals
Here's how the goal evaluator processes a conversation:

// Initial goal state
const goal = {
    id: "book-club-123",
    name: "Complete reading assignment",
    status: "IN_PROGRESS",
    objectives: [
        { description: "Read chapters 1-3", completed: false },
        { description: "Take chapter notes", completed: false },
        { description: "Share thoughts in book club", completed: false }
    ]
};

// Conversation happens
const conversation = `
User: I finished reading the first three chapters last night
Agent: Great! Did you take any notes while reading?
User: Yes, I made detailed notes about the main characters
Agent: Perfect, we can discuss those in the club meeting
User: I'm looking forward to sharing my thoughts tomorrow
`;

// Goal evaluator updates the goal status
const updatedGoal = {
    id: "book-club-123", 
    name: "Complete reading assignment",
    status: "IN_PROGRESS",                                    // Still in progress
    objectives: [
        { description: "Read chapters 1-3", completed: true }, // Marked complete
        { description: "Take chapter notes", completed: true }, // Marked complete
        { description: "Share thoughts in book club", completed: false } // Still pending
    ]
};

// After the book club meeting, goal would be marked DONE
// If user can't complete objectives, goal could be marked FAILED


View Full Goal Evaluator Implementation
Source: https://github.com/elizaOS/eliza/blob/main/packages/plugin-bootstrap/src/evaluators/goals.ts

FAQ
How do evaluators differ from providers?
While providers supply data to the agent before responses, evaluators analyze conversations after responses. Providers inform decisions, evaluators learn from outcomes.

Can evaluators modify agent behavior?
Evaluators can influence future behavior by storing insights in memory, but cannot directly modify agent responses or interrupt ongoing actions.

How many evaluators can run simultaneously?
There's no hard limit, but each evaluator adds processing overhead. Focus on essential evaluations and use efficient validation to optimize performance.

Can evaluators communicate with each other?
Evaluators don't directly communicate but can share data through the memory system. One evaluator can read insights stored by another.

How are evaluation results persisted?
Results are stored using the runtime's memory managers with embeddings for efficient retrieval. See the IMemoryManager interface for details.

What's the difference between similes and examples in evaluators?
Similes provide alternative descriptions of the evaluator's purpose, while examples show concrete scenarios with inputs and expected outcomes. Examples help verify correct implementation.

Can evaluators be conditionally enabled?
Yes, use the validation function to control when evaluators run. This can be based on message content, user status, or other runtime conditions.