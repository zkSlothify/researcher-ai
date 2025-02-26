const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config.json');
const TWEETS_DB_PATH = path.join(__dirname, '../data/tweets_db.json');
const SUMMARIES_DB_PATH = path.join(__dirname, '../data/summaries_db.json');
const JSON_DIR = path.join(__dirname, '../json');

// Ensure directories exist
if (!fs.existsSync(JSON_DIR)) {
  fs.mkdirSync(JSON_DIR, { recursive: true });
}

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Initialize tweets database
let tweetsDb = [];
if (fs.existsSync(TWEETS_DB_PATH)) {
  try {
    tweetsDb = JSON.parse(fs.readFileSync(TWEETS_DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading tweets database file:', error);
    tweetsDb = [];
  }
}

// Initialize summaries database
let summariesDb = [];
if (fs.existsSync(SUMMARIES_DB_PATH)) {
  try {
    summariesDb = JSON.parse(fs.readFileSync(SUMMARIES_DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading summaries database file:', error);
    summariesDb = [];
  }
}

// Group content items by topics
function groupByTopics(contentItems) {
  const topicMap = new Map();
  
  contentItems.forEach(item => {
    let topics = [];
    
    // Parse topics if they exist
    if (item.topics) {
      try {
        if (typeof item.topics === 'string') {
          topics = JSON.parse(item.topics);
        } else if (Array.isArray(item.topics)) {
          topics = item.topics;
        }
      } catch (e) {
        // If topics is a string, split by commas
        topics = item.topics.split(',').map(t => t.trim());
      }
    }
    
    // If no topics, add to "uncategorized"
    if (!topics || topics.length === 0) {
      if (!topicMap.has('uncategorized')) {
        topicMap.set('uncategorized', []);
      }
      topicMap.get('uncategorized').push(item);
      return;
    }
    
    // Add to each topic
    topics.forEach(topic => {
      const normalizedTopic = topic.toLowerCase();
      if (!topicMap.has(normalizedTopic)) {
        topicMap.set(normalizedTopic, []);
      }
      topicMap.get(normalizedTopic).push(item);
    });
  });
  
  // Sort topics by number of items
  const sortedTopics = Array.from(topicMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([topic, items]) => ({ topic, items }));
  
  return sortedTopics;
}

// Generate summary using OpenAI
async function generateSummary(topicData) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }
    
    const prompt = `
    You are an AI assistant tasked with summarizing Twitter content about a specific topic.
    
    Topic: ${topicData.topic}
    
    Here are the tweets to summarize:
    ${topicData.items.map(item => `- ${item.text}`).join('\n')}
    
    Please create a concise summary of these tweets. Format your response as a JSON object with the following structure:
    {
      "summary": "Your summary text here",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "sources": ["URL1", "URL2", "URL3"]
    }
    
    The summary should be 2-3 sentences. Key points should be 3-5 bullet points. Sources should include the most relevant tweet URLs.
    `;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    } else {
      throw new Error('Failed to parse JSON from OpenAI response');
    }
  } catch (error) {
    console.error(`Error generating summary for topic ${topicData.topic}:`, error.message);
    return {
      summary: `Failed to generate summary for ${topicData.topic}`,
      key_points: [],
      sources: topicData.items.slice(0, 3).map(item => item.link)
    };
  }
}

// Generate and save summary
async function generateAndSaveSummary(timeframe) {
  try {
    // Calculate time range
    const now = new Date();
    const hours = timeframe === '12hour' ? 12 : 24;
    const startTime = Math.floor(now.getTime() / 1000) - (hours * 60 * 60);
    
    // Get content items from the last 12 or 24 hours
    const contentItems = tweetsDb.filter(item => item.date >= startTime);
    
    if (contentItems.length === 0) {
      console.log(`No content found in the last ${hours} hours`);
      return;
    }
    
    console.log(`Found ${contentItems.length} items in the last ${hours} hours`);
    
    // Group by topics
    const groupedTopics = groupByTopics(contentItems);
    
    // Generate summaries for each topic (limit to top 5 topics)
    const topTopics = groupedTopics.slice(0, 5);
    const summaries = [];
    
    for (const topicData of topTopics) {
      console.log(`Generating summary for topic: ${topicData.topic}`);
      const summary = await generateSummary(topicData);
      summaries.push({
        title: topicData.topic,
        summary: summary.summary,
        key_points: summary.key_points,
        sources: summary.sources
      });
    }
    
    // Create summary item
    const summaryType = timeframe === '12hour' ? 'halfDaySummary' : 'dailySummary';
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toISOString().slice(11, 16).replace(':', '-');
    const title = `${timeframe === '12hour' ? '12-Hour' : 'Daily'} Summary for ${dateStr} ${timeStr}`;
    
    const summaryItem = {
      id: Date.now().toString(),
      type: summaryType,
      title: title,
      categories: summaries,
      date: Math.floor(now.getTime() / 1000)
    };
    
    // Save to database
    summariesDb.push(summaryItem);
    fs.writeFileSync(SUMMARIES_DB_PATH, JSON.stringify(summariesDb, null, 2));
    
    // Save to JSON file
    const filename = `${dateStr}_${timeStr}_${timeframe}.json`;
    fs.writeFileSync(
      path.join(JSON_DIR, filename),
      JSON.stringify(summaryItem, null, 2)
    );
    
    console.log(`Summary saved to database and file: ${filename}`);
  } catch (error) {
    console.error('Error generating and saving summary:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting summary generation process...');
    
    // Generate 12-hour summary
    await generateAndSaveSummary('12hour');
    
    console.log('Summary generation process completed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main();