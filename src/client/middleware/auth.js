// src/client/middleware/auth.js
import api from '../services/api';

// Interceptador para adicionar token nas requisições
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptador para tratar erros de autenticação
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Verificador de permissões
export const hasPermission = (requiredPermission) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.permissoes?.includes(requiredPermission);
};

// HOC para proteção de rotas
export const withPermission = (WrappedComponent, requiredPermission) => {
    return function WithPermissionComponent(props) {
        if (!hasPermission(requiredPermission)) {
            return <Navigate to="/" />;
        }
        return <WrappedComponent {...props} />;
    };
};

// Hook personalizado para verificar permissões
export const usePermission = (permission) => {
    return hasPermission(permission);
};

// Exporta funções auxiliares para autenticação
export const auth = {
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default auth;