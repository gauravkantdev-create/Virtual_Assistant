#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

const killPort = (port) => {
  try {
    if (isWindows) {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0' && !isNaN(pid)) {
          console.log(`Killing process ${pid} using port ${port}...`);
          execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { encoding: 'utf8' });
    }
    
    console.log(`✅ Port ${port} cleared successfully`);
  } catch (error) {
    console.log(`No process found using port ${port} or error occurred: ${error.message}`);
  }
};

// Kill common development ports
[5000, 3000, 8080, 5173, 5174].forEach(killPort);

console.log('🚀 Backend ports cleared! You can now start your server.');
