import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (window.location.port === '5173') {
        return 'http://localhost:8080/api';
    }
    return '/api';
};

const axiosClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});


axiosClient.interceptors.request.use((config) => {
    
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const csrfToken = getCookie('XSRF-TOKEN');
    
    
    if (csrfToken && config.headers) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
});


axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Session expired or unauthorized. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;