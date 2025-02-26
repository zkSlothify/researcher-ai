const { exec } = require('child_process');
const path = require('path');

console.log('Starting Twitter monitoring process...');

// Run the tweet fetching script
console.log('Step 1: Fetching tweets from selected accounts...');
exec('node ' + path.join(__dirname, 'fetch-tweets.js'), (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing fetch-tweets.js: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`fetch-tweets.js stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('Tweet fetching completed.');
  
  // Run the summary generation script
  console.log('Step 2: Generating 12-hour summary...');
  exec('node ' + path.join(__dirname, 'generate-half-day-summary.js'), (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing generate-half-day-summary.js: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`generate-half-day-summary.js stderr: ${stderr}`);
    }
    
    console.log(stdout);
    console.log('Summary generation completed.');
    console.log('Twitter monitoring process completed successfully.');
  });
}); 