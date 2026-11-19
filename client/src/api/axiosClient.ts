import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const getBaseUrl = () => {
    // If running locally 
    if (window.location.port === '5173') return 'http://localhost:8080/api';
    // If running in production
    return '/api';
};

const axiosClient = axios.create({
    baseURL: getBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
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
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            await new Promise(resolve => setTimeout(resolve, 100));
            return axiosClient(originalRequest);
        }
        
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Session expired or unauthorized. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;