# Research AI Agent 

### Specification, Roadmap, and Feature List

## 1\. Overview

The Research & KOL AI Agent is designed to serve as a comprehensive news aggregator, deep research tool, and KOL (Key Opinion Leader) assistant, initially focused on the @movementlabsxyz ecosystem and the Move programming language.  
The agent aggregates data from multiple sources (X/Twitter, Discord, YouTube, Spaces, podcasts) to generate insights, news highlights, alpha, and content ideas.  
Its modular architecture will allow for expansion into other niches by simply modifying topics and source lists.

#### **Tech Stack Overview (to be determined)**

* **ElizaOS (TypeScript/Node.js):** Core framework for building and managing autonomous AI agents.  
* **Supabase (PostgreSQL):** Persistent storage for agent configurations, logs, and historical state.  
* **BullMQ:** Node.js-based task scheduler for handling asynchronous background tasks. (alternatively N8N?)  
* **Optional Vector Database:** For advanced retrieval-augmented generation (RAG) if enhanced semantic search is required. (**pgvector (most likely)**, pinecone, weaviate, or chromadb?)

---

## 2\. Core Objectives

* **Alpha Discovery & Research**: Automatically extract and analyze data from social media and online sources.  
* **Content Generation & Strategy**: Use AI to generate **summary posts, thread ideas, deep-dive articles, and discover alpha**.  
* **Community Engagement**: Empower users with AI-generated insights to enhance research and discovery. Keep up with the ecosystem news easily without constantly checking X and uncover alpha in one place.  
* **KOL Positioning**: The agent’s X account will serve as a thought leader, providing invaluable content and insights, working 24/7 to ensure the community doesn’t miss anything. It enables the admin to run a KOL account for a niche topic or ecosystem with the help of AI operating around the clock.

---

## 3\. Key Features

### **Data Aggregation & Monitoring**

#### **Social Media Tracking and Web Scraping**

* Follow specified **X (Twitter) accounts, hashtags, and token tickers**.  
* Auto-crawl **linked articles** from tweets for additional context and data.

#### **Manual Information Input**

* Admins can manually add information by copying and pasting text along with comments (e.g., "so and so username from X company says this about Movement Labs"). The agent adds this data to its database for consideration.

#### **Transcript Extraction**

* Extract transcripts from **YouTube and Twitter Spaces URLs**, then process them using AI for insights and summarization.

---

### **AI Processing & Insights Generation**

#### **Automated Summaries**

* Post **key highlights, alpha, ecosystem summaries, and important dates** at adjustable intervals (**e.g., every 24 hours**).

#### **Content Strategy Suggestions**

* Analyze content and engagement data to recommend **high-impact** post topics and article/thread ideas.

#### **Deep Research & Sentiment Analysis**

* Use **NLP** to detect trends, sentiment, and narratives.  
* Track a **separate set of X accounts** to monitor broader web3 industry news and sentiment beyond the Movement ecosystem.  
* Ensure the AI can **differentiate this data** from Movement specific topics.

---

### **Interaction & Workflow**

* Private chat for **admin commands** (e.g., “Generate a thread idea” or “Write a post on {topic}”).  
* Allow **partners with a special role** to drop **information and alpha** into a **private Discord channel**, where:  
  * Admins can manually add information by copying and pasting text along with comments (e.g., "so and so username from X company says this about Movement Labs"). The agent **adds this data** to its database for consideration.  
  * The AI **determines whether it’s worth sharing** on X.

#### **Admin & Moderation Controls**

* **Approval workflow**: The agent pings **admins** in Discord with generated content for:  
  * **Approval & posting**  
  * **Editing**  
  * **Rejection**  
* **Command-based configuration/settings** (e.g., “Every 24 hours, create a draft of the ecosystem highlight summary thread based on tweets from the past 24 hours.”).  
* The agent will send a digest of pending approvals to a dedicated Discord channel. 

#### **Automated Posting**

* Once **approved on Discord**, content can be:  
  * **Scheduled** for later publishing.  
  * **Published immediately** to the agent’s account on X.  
  * Create settings to auto publish certain content types with commands

---

## 4\. Roadmap

### **Phase 1: MVP Development**

🔗 \*\*Fork and customize: \*\*[**https://github.com/bozp-pzob/ai-news**](https://github.com/bozp-pzob/ai-news)  
🔗 \*\*Use this for X data:\*\*[**https://docs.socialdata.tools/reference/get-search-results/**](https://docs.socialdata.tools/reference/get-search-results/)  
🔗 \*\*Scrape Youtube transcripts: \*\* [**https://apify.com/streamers/youtube-scraper\#what-data-can-you-scrape-from-youtube**](https://apify.com/streamers/youtube-scraper#what-data-can-you-scrape-from-youtube)

#### **Data Aggregation**

* **Specify** list of X accounts to monitor.  
* **Scrape linked articles** from tweets.  
* **Manually add** foundational knowledge (e.g., blog articles, PDFs, whitepapers).

* #### Admin can manually add tweets by submitting url or information by copying and pasting blocks of text. The agent adds this data to its database for consideration.

#### **Transcript Fetching**

* Be able to **drop a YouTube & X Spaces URL** for transcript extraction and AI processing. Use Apify for YouTube.

#### **Discord Bot Integration**

* Allow **admin commands** and **query respo**nses in Discord. (e.g., “add user [@xxxxxx](https://x.com/xxxxxx)”, “generate summary”)

#### **Automated Summary & Custom Content Generation**

* Generate **daily summaries** and **insights** from aggregated data.  
* Extract **alpha** from **X, YouTube, and Spaces**.  
* Allow admin to **query the AI** to: (ensure agent remembers these requests)  
  * **Schedule posts** in advance.  
  * **Create weekly sector updates** (DeFi, gaming, NFTs, etc.).  
  * **Highlight the best tweets** from a selected founder over a specific period (e.g., past 6 months).  
  * **Generate custom articles** based on specific prompts or topics.  
  * Alert admin when agent thinks it found valuable alpha.

#### **Approval & Posting Workflow**

* Streamlined approval system in Discord with digests of pending content for review before it’s published..

#### **Agent X Account**

* Launch the agent on **X (Twitter)** for **public-facing content distribution**.

#### **Scalability Prep**

* Scalability Prep  
  * Add indexes in Supabase, configure BullMQ with priority queues, and implement basic caching for repetitive data.

---

### **Phase 2: Feature Expansion & Refinement**

#### **Advanced AI & Content Strategy based on sentiment and trends.**

* Enhance AI-driven post topic suggestions and engagement strategies using NLP models. (i.e. Hugging Face’s BERT for sentiment, SpaCy for trends)

#### **Multi-Agent Swarm**

* Leverage specialized agents for cross-domain insights, including token analysis, market-wide narratives, sentiment tracking, and technical analysis, as part of a swarm intelligence model.

#### **Enhanced Role-Based Access & Posting Workflow**

* Allow **Partners** (with a specific Discord role) can submit content for review, triggering an admin notification.  
* Moderators can review/edit but require admin approval for publishing.

**Dashboard**

* Create a web dashboard for managing sources, reviewing content, and adding new topics and ecosystems to track. I.e. create a list of accounts to track for Solana, Base, etc. 

---

## **Final Thoughts**

This AI-powered Research & KOL Agent is designed to amplify ecosystem intelligence and streamline research. As it evolves, it will incorporate deeper AI-driven analytics, multi-agent collaboration, and improved workflow automation, ensuring continuous growth and scalability.

**Updates**

The full vision outlined above is my ideal **Version 1**, but I want to **break it down into smaller, manageable steps**.

#### **Immediate Focus**

1. **Twitter Data Aggregation**  
   * Pull data from **a third-party API** that collects tweets, threads, quote tweets, and replies/comments from a specified list of users.  
   * Link to API documentation: [(also provided as a json file)](https://docs.socialdata.tools/reference/get-user-tweets-replies/)  
     [https://docs.socialdata.tools/reference/get-user-tweets-replies/](https://docs.socialdata.tools/reference/get-user-tweets-replies/)  
2. **AI-Driven Insights & Summarization**  
   * AI will **identify potential alpha** and generate **daily & weekly highlights**.  
   * It will **rank** information based on significance and **retain the original source links** for easy reference when posting summaries on Twitter.  
3. **YouTube & X Spaces Transcript Extraction**  
   * I've created a **Python script** that enables users to submit a URL from **X Spaces or YouTube**.  
   * The script **automatically downloads the audio** and **extracts the text** for further AI processing.

#### **Format for Summaries**

The **24-hour and weekly recaps** will follow this structure:

---

**Movement Weekly Recap**

Here are the highlights from the Movement ecosystem this past week:

🔹 **Trump @worldlibertyfi** loaded up another $MOVE tokens. Current position: **4.03 million tokens**, split between **Coinbase** and **on-chain**.

🔹 **Cornucopia program** now has a **TVL of $200 million** as of **Friday, February 14, 2025**. Shoutout to partners **@veda\_labs @ConcreteXYZ @canopyxyz**\!

🔹 Movement has **extended the Cornucopia program** to **February 21st**. Movement is now in the **Top 10 for ETH TVL** and still rising.

🔹 **@rushimanche** was live on **@FintechTvGlobal** to discuss the future of Movement, L1s, and L2s on **Wednesday**.

🔹 **MOVEdrop is coming soon\!** You can **pre-register your wallet now** for an **automated and faster claim**.

🔹 **Movement has added @redstone\_defi**, a modular oracle delivering **reliable price feeds for emerging DeFi assets**.

**See sources in comments\!**

---

Each highlight will be followed by **a separate comment containing the source link**, like this:

**(Comment 1\)**  
🔹 **Trump @worldlibertyfi** loaded up another $MOVE tokens. Current position: **4.03 million tokens**.  
📌 **Source:** [https://x.com/OnchainLens/status/1890185181790892509](https://x.com/OnchainLens/status/1890185181790892509)

**(Comment 2\)**  
🔹 **Cornucopia program** now has a **TVL of $200 million** as of **Friday, February 14, 2025**.  
📌 **Source:** [https://x.com/rushimanche/status/1890464975715438725](https://x.com/rushimanche/status/1890464975715438725)

