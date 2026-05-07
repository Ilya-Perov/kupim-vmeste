// Используем полный путь к бэкенду, чтобы избежать проблем с портами
const API_URL = 'http://localhost:5000/api';

export const api = {
    // Вход и получение токенов
    login: async (username, password) => {
        const response = await fetch(`${API_URL}/auth/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Django SimpleJWT ожидает именно эти поля
            body: JSON.stringify({ username, password }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            // Выводим в консоль, чтобы видеть причину (неверный пароль или юзер)
            console.error('Ошибка входа:', errorData);
            throw new Error(errorData.detail || 'Ошибка авторизации');
        }

        const data = await response.json();
        // Сохраняем токены
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('username', username); // Полезно сохранить имя для UI
        
        return data;
    },

    // Запрос с авторизацией
    get: async (endpoint) => {
        const token = localStorage.getItem('access');
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/account'; // Редирект если токен протух
            return null;
        }

        if (!response.ok) throw new Error('Ошибка при получении данных');
        return response.json();
    },

    // Действие (принять/отклонить приглашение, создать группу и т.д.)
    post: async (endpoint, body = {}) => {
        const token = localStorage.getItem('access');
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/account';
            return null;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Ошибка при отправке данных');
        return data;
    }
};