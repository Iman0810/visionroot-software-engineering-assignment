import axios from 'axios';

const axiosClient = axios.create({
    baseURL: window.location.port === '5173' ? 'http://localhost:8080/api' : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the JWT token 
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosClient;