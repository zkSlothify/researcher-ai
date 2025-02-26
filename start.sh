#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the scheduler in the background and redirect output to a log file
echo "Starting Twitter monitor scheduler..."
nohup node scheduler.js > logs/twitter_monitor.log 2>&1 &

# Save the process ID
echo $! > .scheduler.pid
echo "Scheduler started with PID: $!"
echo "Logs are being written to logs/twitter_monitor.log"
echo "To stop the scheduler, run: ./stop.sh" 