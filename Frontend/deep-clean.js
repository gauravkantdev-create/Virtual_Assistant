#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { platform } from 'os';

const isWindows = platform() === 'win32';

console.log('🧹 Clearing all development cache and processes...');

// 1. Kill processes on common ports
const killPort = (port) => {
  try {
    if (isWindows) {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0' && !isNaN(pid)) {
          console.log(`🔫 Killing process ${pid} using port ${port}...`);
          execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf8' });
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { encoding: 'utf8' });
    }
  } catch {
    // Port is already clear
  }
};

// 2. Clear Vite cache and build artifacts
const clearCache = () => {
  const cacheDirs = [
    'node_modules/.vite',
    'node_modules/.cache',
    'dist',
    '.vite',
    '.cache'
  ];
  
  cacheDirs.forEach(dir => {
    if (existsSync(dir)) {
      console.log(`🗑️  Removing ${dir}...`);
      rmSync(dir, { recursive: true, force: true });
    }
  });
};

// Execute cleanup
[8080, 5000, 3000, 5173, 5174].forEach(killPort);
clearCache();

console.log('✅ All cache cleared! Ready for fresh start.');
console.log('💡 Run "npm run dev" to start your servers.');
