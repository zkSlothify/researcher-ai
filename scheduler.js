const { main } = require('./fetch_tweets');
const fs = require('fs');
const path = require('path');

// Configuration
const SCHEDULER_LOG_PATH = path.join(__dirname, 'data', 'scheduler_log.json');
const INTERVAL_HOURS = 12;
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;

// Initialize scheduler log
let schedulerLog = {
  lastRun: null,
  nextRun: null,
  runs: []
};

// Load existing scheduler log if it exists
if (fs.existsSync(SCHEDULER_LOG_PATH)) {
  try {
    schedulerLog = JSON.parse(fs.readFileSync(SCHEDULER_LOG_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading scheduler log:', error);
  }
}

// Function to update the scheduler log
function updateSchedulerLog(status, error = null) {
  const now = new Date();
  const nextRun = new Date(now.getTime() + INTERVAL_MS);
  
  schedulerLog.lastRun = now.toISOString();
  schedulerLog.nextRun = nextRun.toISOString();
  
  schedulerLog.runs.push({
    timestamp: now.toISOString(),
    status: status,
    error: error ? error.message : null
  });
  
  // Keep only the last 100 runs
  if (schedulerLog.runs.length > 100) {
    schedulerLog.runs = schedulerLog.runs.slice(-100);
  }
  
  // Save to file
  fs.writeFileSync(SCHEDULER_LOG_PATH, JSON.stringify(schedulerLog, null, 2));
  
  console.log(`Next run scheduled for: ${nextRun.toLocaleString()}`);
}

// Function to run the main process
async function runProcess() {
  console.log(`Running scheduled process at ${new Date().toLocaleString()}`);
  
  try {
    await main();
    updateSchedulerLog('success');
  } catch (error) {
    console.error('Error running scheduled process:', error);
    updateSchedulerLog('error', error);
  }
}

// Run immediately on startup
runProcess();

// Schedule to run every INTERVAL_MS milliseconds
setInterval(runProcess, INTERVAL_MS);

console.log(`Scheduler started. Will run every ${INTERVAL_HOURS} hours.`);
console.log(`First run started at ${new Date().toLocaleString()}`); 