import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de REQUEST (já existente)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !config.url.endsWith("api/AuthLogin/Login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 Interceptor de RESPONSE (novo)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redireciona para login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

// import axios from 'axios';

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL,
// });

// // Interceptador para enviar o token em todas as requisições
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');

//     // Não envia token se for login (ou outras rotas públicas)
//     if (token && !config.url.endsWith('api/AuthLogin/Login')) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
// });

// export default api;
