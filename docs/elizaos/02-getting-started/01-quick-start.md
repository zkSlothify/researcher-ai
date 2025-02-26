Quickstart Guide
Prerequisites
Before getting started with Eliza, ensure you have:

Node.js 23+ (using nvm is recommended)
pnpm 9+
Git for version control
A code editor (VS Code, Cursor or VSCodium recommended)
CUDA Toolkit (optional, for GPU acceleration)
Automated Installation
Use the start script
🔍 Auto OS Detection | 🛠️ Zero Config | 🎭 Character Management | 🔄 One-click Updates | ⚙️ Guided Setup
# Linux/macOS
./scripts/start.sh

Troubleshooting
Using https://github.com/elizaOS/eliza-starter
git clone git@github.com:elizaos/eliza-starter.git
cd eliza-starter
cp .env.example .env
pnpm i && pnpm build && pnpm start

Manual Installation
After installing the prerequisites, clone the repository and enter the directory

git clone git@github.com:elizaOS/eliza.git
cd eliza

Switch to the latest stable version tag This project moves quick, checkout the latest release known to work:

git checkout $(git describe --tags --abbrev=0)

Install the dependencies

pnpm install --no-frozen-lockfile

Note: Please only use the --no-frozen-lockfile option when you're initially instantiating the repo or are bumping the version of a package or adding a new package to your package.json. This practice helps maintain consistency in your project's dependencies and prevents unintended changes to the lockfile.

Build the local libraries

pnpm build

Configure Environment
Copy example environment file

cp .env.example .env

Edit .env and add your values. Do NOT add this file to version control.

# Suggested quickstart environment variables
DISCORD_APPLICATION_ID=  # For Discord integration
DISCORD_API_TOKEN=      # Bot token
HEURIST_API_KEY=       # Heurist API key for LLM and image generation
OPENAI_API_KEY=        # OpenAI API key
GROK_API_KEY=          # Grok API key
ELEVENLABS_XI_API_KEY= # API key from elevenlabs (for voice)
LIVEPEER_GATEWAY_URL=  # Livepeer gateway URL

Choose Your Model
Eliza supports multiple AI models and you set which model to use inside the character JSON file.

Heurist: Set modelProvider: "heurist" in your character file. Most models are uncensored.

LLM: Select available LLMs here and configure SMALL_HEURIST_MODEL,MEDIUM_HEURIST_MODEL,LARGE_HEURIST_MODEL

Image Generation: Select available Stable Diffusion or Flux models here and configure HEURIST_IMAGE_MODEL (default is FLUX.1-dev)

Llama: Set OLLAMA_MODEL to your chosen model

Grok: Set GROK_API_KEY to your Grok API key and set modelProvider: "grok" in your character file

OpenAI: Set OPENAI_API_KEY to your OpenAI API key and set modelProvider: "openai" in your character file

Livepeer: Set LIVEPEER_IMAGE_MODEL to your chosen Livepeer image model, available models here

Llama: Set XAI_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo

Grok: Set XAI_MODEL=grok-beta

OpenAI: Set XAI_MODEL=gpt-4o-mini or gpt-4o

Livepeer: Set SMALL_LIVEPEER_MODEL,MEDIUM_LIVEPEER_MODEL,LARGE_LIVEPEER_MODEL and IMAGE_LIVEPEER_MODEL to your desired models listed here.

For llama_local inference:
The system will automatically download the model from Hugging Face
LOCAL_LLAMA_PROVIDER can be blank
Note: llama_local requires a GPU, it currently will not work with CPU inference

For Ollama inference:
If OLLAMA_SERVER_URL is left blank, it defaults to localhost:11434
If OLLAMA_EMBEDDING_MODE is left blank, it defaults to mxbai-embed-large
Create Your First Agent
Create a Character File

Check out the characters/ directory for a number of character files to try out. Additionally you can read packages/core/src/defaultCharacter.ts.

Copy one of the example character files and make it your own

cp characters/sbf.character.json characters/deep-thought.character.json

📝 Character Documentation

Start the Agent

Inform it which character you want to run:

pnpm start --character="characters/deep-thought.character.json"

You can load multiple characters with a comma-separated list:

pnpm start --characters="characters/deep-thought.character.json, characters/sbf.character.json"


Interact with the Agent

Now you're ready to start a conversation with your agent.

Open a new terminal window and run the client's http server.

pnpm start:client

Once the client is running, you'll see a message like this:

➜  Local:   http://localhost:5173/

Simply click the link or open your browser to http://localhost:5173/. You'll see the chat interface connect to the system, and you can begin interacting with your character.

Platform Integration
Discord Bot Setup
Create a new application at Discord Developer Portal
Create a bot and get your token
Add bot to your server using OAuth2 URL generator
Set DISCORD_API_TOKEN and DISCORD_APPLICATION_ID in your .env
Twitter Integration
Add to your .env:

TWITTER_USERNAME=  # Account username
TWITTER_PASSWORD=  # Account password
TWITTER_EMAIL=    # Account email

Important: Log in to the Twitter Developer Portal and enable the "Automated" label for your account to avoid being flagged as inauthentic.

Telegram Bot
Create a bot
Add your bot token to .env:
TELEGRAM_BOT_TOKEN=your_token_here

Optional: GPU Acceleration
If you have an NVIDIA GPU:

# Install CUDA support
npx --no node-llama-cpp source download --gpu cuda

# Ensure CUDA Toolkit, cuDNN, and cuBLAS are installed

Basic Usage Examples
Chat with Your Agent
# Start chat interface
pnpm start

Run Multiple Agents
pnpm start --characters="characters/trump.character.json,characters/tate.character.json"


Common Issues & Solutions
Node.js Version
Ensure Node.js 23.3.0 is installed
Use node -v to check version
Consider using nvm to manage Node versions
NOTE: pnpm may be bundled with a different node version, ignoring nvm. If this is the case, you can use

pnpm env use --global 23.3.0

to force it to use the correct one.

Sharp Installation If you see Sharp-related errors:
pnpm install --include=optional sharp

CUDA Setup
Verify CUDA Toolkit installation
Check GPU compatibility with toolkit
Ensure proper environment variables are set
Exit Status 1 If you see
triggerUncaughtException(
^
[Object: null prototype] {
[Symbol(nodejs.util.inspect.custom)]: [Function: [nodejs.util.inspect.custom]]
}


You can try these steps, which aim to add @types/node to various parts of the project

# Add dependencies to workspace root
pnpm add -w -D ts-node typescript @types/node

# Add dependencies to the agent package specifically
pnpm add -D ts-node typescript @types/node --filter "@elizaos/agent"

# Also add to the core package since it's needed there too
pnpm add -D ts-node typescript @types/node --filter "@elizaos/core"

# First clean everything
pnpm clean

# Install all dependencies recursively
pnpm install -r

# Build the project
pnpm build

# Then try to start
pnpm start

Better sqlite3 was compiled against a different Node.js version If you see
Error starting agents: Error: The module '.../eliza-agents/dv/eliza/node_modules/better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 131. This version of Node.js requires
NODE_MODULE_VERSION 127. Please try re-compiling or re-installing


or

Error: Could not locate the bindings file. Tried:
.../better_sqlite3.node
...

You can try this, which will attempt to rebuild better-sqlite3.

pnpm rebuild better-sqlite3

If that doesn't work, try clearing your node_modules in the root folder

rm -fr node_modules; pnpm store prune

Then reinstall the requirements

pnpm i

You can also add a postinstall script in your package.json if you want to automate this:

scripts: {
    "postinstall": "npm rebuild better-sqlite3"
}

FAQ
How do I install and set up ElizaOS?
Clone the repository, run pnpm install --no-frozen-lockfile, then pnpm build. Requires Node.js version 23.3.0.

Which Node.js version should I use?
Use Node.js version 23+ (specifically 23.3.0 is recommended) and pnpm v9.x for optimal compatibility. You can use nvm to manage Node versions with nvm install 23 and nvm use 23.

How do I run multiple agents?
Create separate projects with unique character files and run in separate terminals, or use pnpm start --characters="characters/agent1.json,characters/agent2.json".

What's the difference between eliza and eliza-starter?
Eliza-starter is a lightweight version for simpler setups, while the main eliza repository includes all advanced features and plugins.

How do I fix build/installation issues?
Use Node v23.3.0, run pnpm clean, then pnpm install --no-frozen-lockfile, followed by pnpm build. If issues persist, checkout the latest stable tag.

What are the minimum system requirements?
8GB RAM recommended for build process. For deployment, a t2.large instance on AWS with 20GB storage running Ubuntu is the minimum tested configuration.

How do I fix "Exit Status 1" errors?
If you see triggerUncaughtException errors, try:

Add dependencies to workspace root
Add dependencies to specific packages
Clean and rebuild