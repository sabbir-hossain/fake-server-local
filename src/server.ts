import App from './app';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { spawn } from 'child_process';

// Open a URL in the system's default browser without blocking the server.
function openBrowser(url: string): void {
  let command: string;
  let args: string[];

  switch (process.platform) {
    case 'win32':
      command = 'cmd';
      args = ['/c', 'start', '""', url];
      break;
    case 'darwin':
      command = 'open';
      args = [url];
      break;
    default:
      command = 'xdg-open';
      args = [url];
      break;
  }

  try {
    spawn(command, args, { stdio: 'ignore', detached: true }).unref();
  } catch (error) {
    console.warn('⚠️ Could not open the browser automatically, please visit the URL below.');
  }
}

// Get the port from environment variables or use a default
const port = process.env.PORT || 9920;

// Create a new instance of our App class
const app = new App(port);

// Start the server and store the returned http.Server instance
const server = app.listen();

// Add a listener for the 'listening' event to confirm the server is running
server.on('listening', () => {
  const dashboardUrl = `http://localhost:${port}/dashboard`;
  console.log(`✅ Server is successfully running on http://localhost:${port}`);
  console.log(`📊 Dashboard: ${dashboardUrl}`);
  console.log('Press CTRL + C to stop.');
  openBrowser(dashboardUrl);
});

// Add a listener for the 'error' event to handle potential startup issues
server.on('error', (err: NodeJS.ErrnoException) => {
  // Check if the error code is 'EADDRINUSE' (address already in use)
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use.`);
    console.error('Please close the application using this port and try again.');
    process.exit(1); // Exit with a failure code
  } else {
    // Handle any other unexpected server errors
    console.error(`❌ An unexpected server error occurred: ${err.message}`);
    process.exit(1);
  }
});
