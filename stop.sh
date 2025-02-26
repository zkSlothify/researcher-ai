#!/bin/bash

# Check if the PID file exists
if [ -f .scheduler.pid ]; then
  PID=$(cat .scheduler.pid)
  
  # Check if the process is still running
  if ps -p $PID > /dev/null; then
    echo "Stopping scheduler process (PID: $PID)..."
    kill $PID
    
    # Wait for the process to terminate
    sleep 2
    
    # Check if it's still running and force kill if necessary
    if ps -p $PID > /dev/null; then
      echo "Process still running, force killing..."
      kill -9 $PID
    fi
    
    echo "Scheduler stopped."
  else
    echo "Scheduler process (PID: $PID) is not running."
  fi
  
  # Remove the PID file
  rm .scheduler.pid
else
  echo "Scheduler PID file not found. Process may not be running."
fi 