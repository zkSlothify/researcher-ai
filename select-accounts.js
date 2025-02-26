const fs = require('fs');
const readline = require('readline');

// Define account categories with descriptions
const accounts = {
  'AI Companies': [
    { username: 'OpenAI', description: 'Official account of OpenAI, creators of ChatGPT and GPT models' },
    { username: 'DeepMind', description: 'Google\'s AI research lab' },
    { username: 'AnthropicAI', description: 'AI safety company, creators of Claude' },
    { username: 'MetaAI', description: 'Meta\'s AI research division' },
    { username: 'GoogleAI', description: 'Google\'s AI division' },
    { username: 'StabilityAI', description: 'Creators of Stable Diffusion' },
    { username: 'Cohere', description: 'NLP and LLM company' },
    { username: 'Mistral', description: 'French AI startup' },
    { username: 'Midjourney', description: 'Text-to-image AI company' },
    { username: 'Inflection_AI', description: 'AI company focused on personal AI assistants' },
  ],
  'AI Leaders & Researchers': [
    { username: 'sama', description: 'Sam Altman - CEO of OpenAI' },
    { username: 'gdb', description: 'Demis Hassabis - CEO of Google DeepMind' },
    { username: 'jackclarkSF', description: 'Jack Clark - Co-founder of Anthropic' },
    { username: 'demiandabi', description: 'Demian Brecht - AI researcher' },
    { username: 'ylecun', description: 'Yann LeCun - Chief AI Scientist at Meta' },
    { username: 'karpathy', description: 'Andrej Karpathy - Former Director of AI at Tesla, former OpenAI researcher' },
    { username: 'jeffdean', description: 'Jeff Dean - Google Senior Fellow, head of Google AI' },
    { username: 'emostaque', description: 'Emad Mostaque - CEO of Stability AI' },
    { username: 'aidan_gomez', description: 'Aidan Gomez - CEO of Cohere' },
  ],
  'AI Ethics & Critics': [
    { username: 'garymarkus', description: 'Gary Marcus - AI researcher and critic' },
    { username: 'melaniemitchell', description: 'Melanie Mitchell - AI researcher focusing on conceptual abstraction' },
    { username: 'AnimaAnandkumar', description: 'Anima Anandkumar - Director of ML Research at NVIDIA, Caltech Professor' },
    { username: 'mmitchell_ai', description: 'Margaret Mitchell - AI ethics researcher, former Google AI' },
    { username: 'timnitGebru', description: 'Timnit Gebru - AI ethics researcher, former Google AI' },
  ],
  'AI News & Media': [
    { username: 'thegradientpub', description: 'The Gradient - AI research publication' },
    { username: 'ai_breakfast', description: 'AI Breakfast - Daily AI news digest' },
    { username: 'weights_biases', description: 'Weights & Biases - ML platform with educational content' },
    { username: 'huggingface', description: 'Hugging Face - Open-source AI community' },
    { username: 'scale_ai', description: 'Scale AI - AI infrastructure company' },
    { username: 'VentureBeat_AI', description: 'VentureBeat AI - AI news from VentureBeat' },
  ]
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to display accounts by category
function displayAccounts() {
  console.log('\nAvailable Twitter accounts by category:');
  console.log('=====================================\n');
  
  let accountIndex = 1;
  const accountMap = {};
  
  for (const [category, accountList] of Object.entries(accounts)) {
    console.log(`\n${category}:`);
    console.log('-'.repeat(category.length + 1));
    
    for (const account of accountList) {
      console.log(`${accountIndex}. @${account.username} - ${account.description}`);
      accountMap[accountIndex] = account.username;
      accountIndex++;
    }
  }
  
  return accountMap;
}

// Function to update config.json with selected accounts
function updateConfig(selectedUsernames) {
  try {
    // Read the current config
    const configPath = './config.json';
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Update the usernames array
    config.socialData.usernames = selectedUsernames;
    
    // Write the updated config back to the file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\nConfiguration updated with ${selectedUsernames.length} accounts.`);
    console.log('Run "npm start" to fetch tweets from these accounts.');
  } catch (error) {
    console.error('Error updating config.json:', error.message);
  }
}

// Main function
async function main() {
  console.log('Twitter Account Selection Tool');
  console.log('=============================');
  console.log('This tool helps you select which Twitter accounts to monitor.');
  
  const accountMap = displayAccounts();
  
  console.log('\nEnter the numbers of the accounts you want to monitor, separated by commas.');
  console.log('For example: 1,3,5,10');
  console.log('Or type "all" to select all accounts.');
  
  rl.question('\nYour selection: ', (answer) => {
    let selectedUsernames = [];
    
    if (answer.toLowerCase() === 'all') {
      // Select all accounts
      selectedUsernames = Object.values(accountMap);
    } else {
      // Parse the selected indices
      const selectedIndices = answer.split(',').map(index => index.trim());
      
      for (const index of selectedIndices) {
        const accountIndex = parseInt(index);
        if (accountMap[accountIndex]) {
          selectedUsernames.push(accountMap[accountIndex]);
        } else {
          console.log(`Warning: Invalid account number ${index}, skipping.`);
        }
      }
    }
    
    if (selectedUsernames.length === 0) {
      console.log('No accounts selected. Exiting without changes.');
    } else {
      console.log('\nSelected accounts:');
      selectedUsernames.forEach(username => console.log(`- @${username}`));
      
      rl.question('\nUpdate config with these accounts? (y/n): ', (confirm) => {
        if (confirm.toLowerCase() === 'y') {
          updateConfig(selectedUsernames);
        } else {
          console.log('Operation cancelled. No changes made to configuration.');
        }
        rl.close();
      });
    }
  });
}

// Run the main function
main(); 