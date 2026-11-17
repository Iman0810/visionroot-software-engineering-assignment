import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (window.location.port === '5173') {
        return 'http://localhost:8080/api';
    }
    return '/api'; // Fallback for Docker
};

const axiosClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

// Automatically attach the JWT token 
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // if the token expires orinvalid returns 401/403
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear local state and redirect to login (handled in AuthContext usually)
            console.warn("Session expired or unauthorized. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;