"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Get the port from environment variables or use a default
const port = process.env.PORT || 3000;
// Create a new instance of our App class
const app = new app_1.default(port);
// Start the server and store the returned http.Server instance
const server = app.listen();
// Add a listener for the 'listening' event to confirm the server is running
server.on('listening', () => {
    console.log(`✅ Server is successfully running on http://localhost:${port}`);
    console.log('Press CTRL + C to stop.');
});
// Add a listener for the 'error' event to handle potential startup issues
server.on('error', (err) => {
    // Check if the error code is 'EADDRINUSE' (address already in use)
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use.`);
        console.error('Please close the application using this port and try again.');
        process.exit(1); // Exit with a failure code
    }
    else {
        // Handle any other unexpected server errors
        console.error(`❌ An unexpected server error occurred: ${err.message}`);
        process.exit(1);
    }
});
