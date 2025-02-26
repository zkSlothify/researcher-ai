const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config.json');
const LAST_TWEET_PATH = path.join(__dirname, '../data/last_tweets.json');
const TWEETS_DB_PATH = path.join(__dirname, '../data/tweets_db.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const socialDataConfig = config.socialData;

// Initialize last tweets tracking
let lastTweets = {};
if (fs.existsSync(LAST_TWEET_PATH)) {
  try {
    lastTweets = JSON.parse(fs.readFileSync(LAST_TWEET_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading last tweets file:', error);
    lastTweets = {};
  }
}

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

// Fetch tweets for a specific user
async function fetchUserTweets(username, hoursAgo = 0) {
  try {
    const apiKey = process.env.SOCIALDATA_API_KEY;
    if (!apiKey) {
      throw new Error('SOCIALDATA_API_KEY not found in environment variables');
    }

    const baseUrl = socialDataConfig.baseUrl || 'https://api.socialdata.tools';
    const maxResults = socialDataConfig.maxResults || 20;
    
    // Get the last tweet ID for this user
    const sinceId = lastTweets[username] || '';
    
    console.log(`Fetching tweets for @${username}${sinceId ? ` since ID ${sinceId}` : ''}${hoursAgo > 0 ? ` from the last ${hoursAgo} hours` : ''}`);
    
    // Set up parameters for the API request
    let params = {
      limit: maxResults,
      include_retweets: true,
      include_quotes: true
    };
    
    // Only use since_id if we're not using time-based filtering
    // This prevents potential conflicts between the two filtering methods
    if (sinceId && hoursAgo === 0) {
      params.since_id = sinceId;
    }
    
    // Add time-based filtering if specified
    if (hoursAgo > 0) {
      // Calculate the timestamp for X hours ago in ISO format
      const now = new Date();
      const hoursAgoDate = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
      
      // Format according to SocialData API requirements (ISO 8601 format)
      params.start_time = hoursAgoDate.toISOString();
      console.log(`Using start_time: ${params.start_time}`);
      
      // If we're using time-based filtering, we don't need to track last tweet ID
      // as we'll always get tweets from the specified time period
      delete params.since_id;
    }
    
    // Try different endpoint formats
    let response;
    let endpointUsed;
    let success = false;
    
    // List of endpoints to try
    const endpoints = [
      // Standard Twitter v2 API format
      {
        url: `${baseUrl}/twitter/user/${username}/tweets`,
        params: params
      },
      // Twitter v1.1 timeline format
      {
        url: `${baseUrl}/v1/twitter/user_timeline`,
        params: { ...params, username: username }
      },
      // Another possible format
      {
        url: `${baseUrl}/twitter/users/${username}/tweets`,
        params: params
      },
      // Try with screen_name parameter
      {
        url: `${baseUrl}/twitter/tweets`,
        params: { ...params, screen_name: username }
      }
    ];
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint.url}`);
        console.log(`With parameters: ${JSON.stringify(endpoint.params)}`);
        
        response = await axios.get(endpoint.url, {
          params: endpoint.params,
          headers: {
            'x-api-key': apiKey
          }
        });
        
        // If we get here, the request was successful
        endpointUsed = endpoint.url;
        success = true;
        console.log(`Successfully connected to endpoint: ${endpointUsed}`);
        break;
      } catch (error) {
        console.log(`Endpoint ${endpoint.url} failed: ${error.message}`);
        if (error.response) {
          console.log(`Response status: ${error.response.status}`);
          if (error.response.data) {
            console.log(`Response data: ${JSON.stringify(error.response.data)}`);
          }
        }
      }
    }
    
    if (!success) {
      throw new Error(`All endpoints failed for @${username}`);
    }
    
    // Check response structure
    console.log(`Response structure: ${JSON.stringify(Object.keys(response.data))}`);
    
    if (!response.data) {
      console.log(`No data in response for @${username}`);
      return [];
    }
    
    // Handle different response formats
    let tweets = [];
    if (response.data.data && Array.isArray(response.data.data)) {
      tweets = response.data.data;
    } else if (Array.isArray(response.data)) {
      tweets = response.data;
    } else if (response.data.tweets && Array.isArray(response.data.tweets)) {
      tweets = response.data.tweets;
    } else {
      console.log(`Unexpected response format for @${username}: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return [];
    }
    
    if (tweets.length === 0) {
      console.log(`No tweets found for @${username}`);
      return [];
    }
    
    // Update the last tweet ID if we got any tweets and we're not using time-based filtering
    if (tweets.length > 0 && hoursAgo === 0) {
      // Sort by ID to get the most recent tweet
      const sortedTweets = [...tweets].sort((a, b) => {
        const idA = a.id || a.id_str || '';
        const idB = b.id || b.id_str || '';
        return idB.localeCompare(idA);
      });
      lastTweets[username] = sortedTweets[0].id || sortedTweets[0].id_str;
    }
    
    console.log(`Retrieved ${tweets.length} tweets for @${username}`);
    
    // Transform tweets to ContentItem format
    return tweets.map(tweet => {
      // Determine if this is a retweet or quote tweet
      const isRetweet = tweet.retweeted_status || (tweet.text && tweet.text.startsWith('RT @'));
      const isQuote = tweet.quoted_status || tweet.is_quote_status;
      
      // Get the appropriate type
      let tweetType = 'tweet';
      if (isRetweet) tweetType = 'retweet';
      if (isQuote) tweetType = 'quote_tweet';
      
      // Get the original text for retweets
      let tweetText = tweet.text || tweet.full_text || '';
      let originalAuthor = '';
      
      if (isRetweet && tweet.retweeted_status) {
        originalAuthor = tweet.retweeted_status.user?.screen_name || '';
        tweetText = tweet.retweeted_status.text || tweet.retweeted_status.full_text || tweet.text || '';
      } else if (isQuote && tweet.quoted_status) {
        originalAuthor = tweet.quoted_status.user?.screen_name || '';
      }
      
      const tweetId = tweet.id || tweet.id_str || '';
      
      return {
        cid: `twitter-${tweetId}`,
        type: tweetType,
        source: `Twitter (${username})`,
        title: tweetText.substring(0, 50) + (tweetText.length > 50 ? '...' : ''),
        text: tweetText,
        link: `https://twitter.com/${username}/status/${tweetId}`,
        date: tweet.created_at ? new Date(tweet.created_at).getTime() / 1000 : Math.floor(Date.now() / 1000),
        metadata: {
          userId: tweet.author_id || tweet.user?.id_str || username,
          tweetId: tweetId,
          likes: tweet.public_metrics?.like_count || tweet.favorite_count || 0,
          replies: tweet.public_metrics?.reply_count || tweet.reply_count || 0,
          retweets: tweet.public_metrics?.retweet_count || tweet.retweet_count || 0,
          isRetweet: isRetweet,
          isQuote: isQuote,
          originalAuthor: originalAuthor
        }
      };
    });
  } catch (error) {
    console.error(`Error fetching tweets for @${username}:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    return [];
  }
}

// Save tweets to database
function saveTweetsToDb(tweets) {
  if (tweets.length === 0) return;
  
  // Check for duplicates and add only new tweets
  const existingIds = new Set(tweetsDb.map(tweet => tweet.cid));
  const newTweets = tweets.filter(tweet => !existingIds.has(tweet.cid));
  
  if (newTweets.length === 0) {
    console.log('No new tweets to save');
    return;
  }
  
  // Add new tweets to the database
  tweetsDb = [...tweetsDb, ...newTweets];
  
  // Save to file
  fs.writeFileSync(TWEETS_DB_PATH, JSON.stringify(tweetsDb, null, 2));
  console.log(`Saved ${newTweets.length} new tweets to database`);
}

// Save last tweet IDs to file
function saveLastTweets() {
  fs.writeFileSync(LAST_TWEET_PATH, JSON.stringify(lastTweets, null, 2));
  console.log('Updated last tweet IDs file');
}

// Main function
async function main() {
  try {
    console.log('Starting tweet fetching process...');
    
    // Get usernames from config
    const usernames = socialDataConfig.usernames || [];
    if (usernames.length === 0) {
      console.log('No Twitter usernames configured. Please update config.json');
      return;
    }
    
    console.log(`Found ${usernames.length} Twitter accounts to monitor`);
    
    // Fetch tweets for each user from the last 24 hours
    let allTweets = [];
    for (const username of usernames) {
      const tweets = await fetchUserTweets(username, 24); // Fetch tweets from the last 24 hours
      allTweets = allTweets.concat(tweets);
    }
    
    // Save tweets to database
    saveTweetsToDb(allTweets);
    
    // Save last tweet IDs
    saveLastTweets();
    
    console.log('Tweet fetching process completed successfully');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main(); 