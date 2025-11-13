import axios from 'axios';

// This creates a central configuration for all your API calls
const instance = axios.create({
  // If there is a cloud URL set in the environment, use it.
  // Otherwise, default to your local server port 5000.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

export default instance;