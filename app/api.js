import axios from 'axios';
import axiosRetry from 'axios-retry';

// Set up Axios instance
const api = axios.create({
    baseURL: '<ADD NGROK LINK>',
    timeout: 30000, // 10 seconds
});

// Set up retry configuration
axiosRetry(api, {
    retries: 5, // number of retries
    retryDelay: (retryCount) => {
        return retryCount * 2000; // time interval between retries
    },
    retryCondition: (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        return error.response.status === 503; // Only retry for specific status codes
    },
});

export default api;