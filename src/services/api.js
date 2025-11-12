import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Interceptador para enviar o token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    // Não envia token se for login (ou outras rotas públicas)
    if (token && !config.url.endsWith('api/AuthLogin/Login')) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;