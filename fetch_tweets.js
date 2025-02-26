require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get API key from environment variables
const apiKey = process.env.SOCIALDATA_API_KEY;

if (!apiKey) {
  console.error('Error: SOCIALDATA_API_KEY not found in environment variables');
  process.exit(1);
}

// Load configuration
const CONFIG_PATH = path.join(__dirname, 'config.json');
const DATA_DIR = path.join(__dirname, 'data');
const TWEETS_DB_PATH = path.join(DATA_DIR, 'tweets_db.json');
const LAST_RUN_PATH = path.join(DATA_DIR, 'last_run.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  console.error('Error reading config file:', error);
  process.exit(1);
}

// Initialize tweets database
let tweetsDb = [];
if (fs.existsSync(TWEETS_DB_PATH)) {
  try {
    tweetsDb = JSON.parse(fs.readFileSync(TWEETS_DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading tweets database:', error);
    tweetsDb = [];
  }
}

// Initialize last run timestamp
let lastRun = {};
if (fs.existsSync(LAST_RUN_PATH)) {
  try {
    lastRun = JSON.parse(fs.readFileSync(LAST_RUN_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading last run file:', error);
    lastRun = {};
  }
}

// Map of known Twitter usernames to their user IDs
const USER_ID_MAP = {
  'movementlabsxyz': '1632504432746192896',
  'rushimanche': '1269729199008473088',
  'moveecosystem': '1547270343450136578',
  'movementfdn': '1502034905206722563',
  'torabyou': '1033104458656317440'
};

// Function to fetch tweets from a username or user ID
async function fetchTweets(usernameOrId, hoursAgo = 12) {
  try {
    // Calculate the timestamp for X hours ago
    const now = new Date();
    const hoursAgoDate = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    
    // Format according to API requirements
    const startTime = hoursAgoDate.toISOString();
    
    // Determine if this is a username or user ID
    const isUserId = /^\d+$/.test(usernameOrId);
    const userId = isUserId ? usernameOrId : USER_ID_MAP[usernameOrId];
    const username = isUserId ? null : usernameOrId;
    
    console.log(`Fetching tweets from ${username ? '@' + username : 'user ID ' + userId} in the last ${hoursAgo} hours...`);
    console.log(`Using start_time: ${startTime}`);
    
    // Try different endpoint formats
    const endpoints = [];
    
    if (userId) {
      // User ID-based endpoints
      endpoints.push({
        url: `https://api.socialdata.tools/twitter/user/${userId}/tweets`,
        params: { 
          limit: 50, 
          start_time: startTime,
          include_retweets: true,
          include_quotes: true
        }
      });
    }
    
    if (username) {
      // Username-based endpoints
      endpoints.push({
        url: `https://api.socialdata.tools/twitter/user/${username}/tweets`,
        params: { 
          limit: 50, 
          start_time: startTime,
          include_retweets: true,
          include_quotes: true
        }
      });
      
      endpoints.push({
        url: `https://api.socialdata.tools/v1/twitter/user_timeline`,
        params: { 
          username, 
          limit: 50, 
          start_time: startTime,
          include_retweets: true,
          include_quotes: true
        }
      });
    }
    
    // Try each endpoint until one works
    let response = null;
    let successEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint.url}`);
        
        const result = await axios.get(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          },
          params: endpoint.params
        });
        
        if (result.data) {
          response = result;
          successEndpoint = endpoint.url;
          console.log(`Successfully connected to endpoint: ${successEndpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint.url} failed: ${error.message}`);
      }
    }
    
    if (!response) {
      throw new Error(`All endpoints failed for ${username ? '@' + username : 'user ID ' + userId}`);
    }
    
    // Process the response to ensure we only get tweets from the specified time period
    const data = response.data;
    if (data && data.tweets && data.tweets.length > 0) {
      // Filter tweets to only include those from the specified time period
      const cutoffTime = hoursAgoDate.getTime();
      const filteredTweets = data.tweets.filter(tweet => {
        const tweetDate = new Date(tweet.tweet_created_at).getTime();
        return tweetDate >= cutoffTime;
      });
      
      console.log(`Found ${filteredTweets.length} tweets in the last ${hoursAgo} hours`);
      
      // Transform tweets to a more structured format
      return filteredTweets.map(tweet => {
        // Determine if this is a retweet or quote tweet
        const isRetweet = tweet.retweeted_status || (tweet.full_text && tweet.full_text.startsWith('RT @'));
        const isQuote = tweet.quoted_status || tweet.is_quote_status;
        
        // Get the appropriate type
        let tweetType = 'tweet';
        if (isRetweet) tweetType = 'retweet';
        if (isQuote) tweetType = 'quote_tweet';
        
        // Get the original text for retweets
        let tweetText = tweet.full_text || '';
        let originalAuthor = '';
        
        if (isRetweet && tweet.retweeted_status) {
          originalAuthor = tweet.retweeted_status.user?.screen_name || '';
          tweetText = tweet.retweeted_status.full_text || tweet.full_text || '';
        } else if (isQuote && tweet.quoted_status) {
          originalAuthor = tweet.quoted_status.user?.screen_name || '';
        }
        
        const tweetId = tweet.id_str || '';
        const tweetDate = new Date(tweet.tweet_created_at);
        
        // Extract media URLs
        const mediaUrls = [];
        if (tweet.entities && tweet.entities.media) {
          tweet.entities.media.forEach(media => {
            if (media.media_url_https) {
              mediaUrls.push(media.media_url_https);
            }
          });
        }
        
        // Extract video URLs
        const videoUrls = [];
        if (tweet.extended_entities && tweet.extended_entities.media) {
          tweet.extended_entities.media.forEach(media => {
            if (media.video_info && media.video_info.variants) {
              // Get the highest quality video
              const videos = media.video_info.variants
                .filter(v => v.content_type === 'video/mp4')
                .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
              
              if (videos.length > 0) {
                videoUrls.push(videos[0].url);
              }
            }
          });
        }
        
        return {
          id: tweetId,
          type: tweetType,
          account: username || (tweet.user ? tweet.user.screen_name : ''),
          text: tweetText,
          original_author: originalAuthor,
          date: tweetDate.toISOString(),
          timestamp: tweetDate.getTime(),
          url: `https://twitter.com/${tweet.user ? tweet.user.screen_name : username}/status/${tweetId}`,
          retweet_count: tweet.retweet_count || 0,
          like_count: tweet.favorite_count || 0,
          reply_count: tweet.reply_count || 0,
          media: mediaUrls,
          videos: videoUrls,
          raw_data: tweet // Store the raw data for reference
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching tweets for ${usernameOrId}:`, error.message);
    return [];
  }
}

// Function to save tweets to the database
function saveTweetsToDb(tweets) {
  if (tweets.length === 0) return;
  
  // Check for duplicates and add only new tweets
  const existingIds = new Set(tweetsDb.map(tweet => tweet.id));
  const newTweets = tweets.filter(tweet => !existingIds.has(tweet.id));
  
  if (newTweets.length === 0) {
    console.log('No new tweets to save');
    return;
  }
  
  // Add new tweets to the database
  tweetsDb = [...tweetsDb, ...newTweets];
  
  // Save to file
  fs.writeFileSync(TWEETS_DB_PATH, JSON.stringify(tweetsDb, null, 2));
  console.log(`Saved ${newTweets.length} new tweets to database`);
  
  return newTweets;
}

// Function to generate a summary of new tweets
function generateSummary(newTweets) {
  if (newTweets.length === 0) {
    return "No new tweets in the last 12 hours.";
  }
  
  // Group tweets by account
  const tweetsByAccount = {};
  newTweets.forEach(tweet => {
    if (!tweetsByAccount[tweet.account]) {
      tweetsByAccount[tweet.account] = [];
    }
    tweetsByAccount[tweet.account].push(tweet);
  });
  
  // Generate summary
  let summary = `# Movement Ecosystem Update\n\n`;
  summary += `*${new Date().toLocaleString()}*\n\n`;
  summary += `## Latest Activity (Last 12 Hours)\n\n`;
  
  // Add tweets for each account
  Object.keys(tweetsByAccount).forEach(account => {
    const accountTweets = tweetsByAccount[account];
    summary += `### @${account} (${accountTweets.length} updates)\n\n`;
    
    accountTweets.forEach(tweet => {
      const date = new Date(tweet.date);
      const timeAgo = getTimeAgo(date);
      
      summary += `**[${timeAgo}](${tweet.url})**`;
      
      if (tweet.type === 'retweet') {
        summary += ` (Retweeted @${tweet.original_author})`;
      } else if (tweet.type === 'quote_tweet') {
        summary += ` (Quoted @${tweet.original_author})`;
      }
      
      summary += `\n\n${tweet.text}\n\n`;
      
      if (tweet.media.length > 0) {
        summary += `*Media:* ${tweet.media.join(', ')}\n\n`;
      }
      
      summary += `*Engagement:* ${tweet.retweet_count} RTs, ${tweet.like_count} Likes\n\n`;
      summary += `---\n\n`;
    });
  });
  
  // Add footer
  summary += `\n\n*This summary was automatically generated at ${new Date().toLocaleString()}*`;
  
  return summary;
}

// Function to save the summary to a file
function saveSummary(summary) {
  const date = new Date();
  const filename = `summary_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}.md`;
  const filepath = path.join(DATA_DIR, filename);
  
  fs.writeFileSync(filepath, summary);
  console.log(`Summary saved to ${filepath}`);
  
  return filepath;
}

// Function to update the last run timestamp
function updateLastRun() {
  lastRun.timestamp = new Date().toISOString();
  fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(lastRun, null, 2));
  console.log(`Updated last run timestamp: ${lastRun.timestamp}`);
}

// Helper function to get time ago string
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`;
  }
}

// Main function
async function main() {
  // Get accounts from config
  const accounts = config.socialData.usernames || [];
  
  if (accounts.length === 0) {
    console.error('No Twitter accounts configured. Please update config.json');
    process.exit(1);
  }
  
  console.log(`Found ${accounts.length} Twitter accounts to monitor`);
  console.log(`Current database has ${tweetsDb.length} tweets`);
  
  // Process each account
  let allNewTweets = [];
  
  for (const account of accounts) {
    try {
      // Try with user ID if available, otherwise use username
      const userId = USER_ID_MAP[account];
      const accountToUse = userId || account;
      
      const tweets = await fetchTweets(accountToUse, 12);
      
      if (tweets.length === 0) {
        console.log(`No tweets found in the last 12 hours for ${account}`);
        continue;
      }
      
      console.log(`Retrieved ${tweets.length} tweets from ${account}`);
      
      // Save individual account tweets to a file for reference
      const filename = path.join(DATA_DIR, `tweets_${account}.json`);
      fs.writeFileSync(filename, JSON.stringify(tweets, null, 2));
      
      // Add to all tweets
      allNewTweets = allNewTweets.concat(tweets);
    } catch (error) {
      console.error(`Failed to process ${account}:`, error);
    }
  }
  
  // Save all new tweets to the database
  const newTweets = saveTweetsToDb(allNewTweets);
  
  // Generate and save summary
  if (newTweets && newTweets.length > 0) {
    const summary = generateSummary(newTweets);
    const summaryPath = saveSummary(summary);
    console.log(`Generated summary with ${newTweets.length} new tweets`);
    
    // Print the summary to console
    console.log('\n' + summary);
  } else {
    console.log('No new tweets to summarize');
  }
  
  // Update last run timestamp
  updateLastRun();
}

// If this script is run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error in main process:', error);
    process.exit(1);
  });
}

// Export functions for use in scheduler
module.exports = {
  main,
  fetchTweets,
  generateSummary
}; 