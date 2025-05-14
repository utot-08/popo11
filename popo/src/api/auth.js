import api from './axios';

export const login = async (username, password) => {
    try {
        const response = await api.post('http://127.0.0.1:8000/api/token/', {
            username,
            password
        });

        if (response.data && response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh);
            }
            return response.data;
        }

        throw new Error('Authentication failed: No access token received');
    } catch (error) {
        // Transform Axios error to a more specific error
        if (error.response) {
            // Handle HTTP errors
            if (error.response.status === 401) {
                throw new Error('Invalid username or password');
            } else if (error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        // Re-throw other errors
        throw new Error(error.message || 'Login failed');
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getProtectedData = async () => {
    try {
        const response = await api.get('http://127.0.0.1:8000/api/protected/');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch protected data:', error);
        throw error;
    }
};
