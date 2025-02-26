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
let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  console.error('Error reading config file:', error);
  process.exit(1);
}

// Function to fetch user profile
async function fetchUserProfile(username) {
  try {
    console.log(`Fetching profile for @${username}...`);
    
    const response = await axios.get(`https://api.socialdata.tools/twitter/user/${username}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.id_str) {
      console.log(`Found user ID for @${username}: ${response.data.id_str}`);
      return {
        username,
        id: response.data.id_str,
        name: response.data.name,
        followers: response.data.followers_count,
        following: response.data.friends_count,
        tweets: response.data.statuses_count
      };
    } else {
      console.log(`No user ID found for @${username}`);
      return { username, id: null };
    }
  } catch (error) {
    console.error(`Error fetching profile for @${username}:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    return { username, id: null };
  }
}

// Main function
async function main() {
  // Get usernames from config
  const usernames = config.socialData.usernames || [];
  
  if (usernames.length === 0) {
    console.error('No Twitter usernames configured. Please update config.json');
    process.exit(1);
  }
  
  console.log(`Found ${usernames.length} Twitter accounts to lookup`);
  
  // Store user ID mapping
  const userIdMap = {};
  const userDetails = [];
  
  // Process each username
  for (const username of usernames) {
    const userInfo = await fetchUserProfile(username);
    if (userInfo.id) {
      userIdMap[username] = userInfo.id;
      userDetails.push(userInfo);
    }
  }
  
  // Print results
  console.log('\nUser ID Mapping:');
  console.log('----------------');
  console.log(JSON.stringify(userIdMap, null, 2));
  
  // Save to file
  fs.writeFileSync('user_ids.json', JSON.stringify(userIdMap, null, 2));
  console.log('\nSaved user IDs to user_ids.json');
  
  // Print user details
  if (userDetails.length > 0) {
    console.log('\nUser Details:');
    console.log('-------------');
    userDetails.forEach(user => {
      console.log(`@${user.username} (${user.id}):`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Followers: ${user.followers?.toLocaleString()}`);
      console.log(`  Following: ${user.following?.toLocaleString()}`);
      console.log(`  Tweets: ${user.tweets?.toLocaleString()}`);
      console.log('---');
    });
  }
  
  // Update fetch_tweets.js with the user IDs
  if (Object.keys(userIdMap).length > 0) {
    console.log('\nYou can update your fetch_tweets.js file with these user IDs:');
    console.log('\nconst USER_ID_MAP = {');
    Object.entries(userIdMap).forEach(([username, id]) => {
      console.log(`  '${username}': '${id}',`);
    });
    console.log('};');
  }
}

main(); 