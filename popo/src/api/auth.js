import api from './axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Request OTP for login
export const requestLoginOTP = async (email, password) => {
    try {
        const response = await api.post(`${API_URL}/request-login-otp/`, {
            email,
            password
        });

        if (response.data) {
            return {
                success: true,
                message: response.data.message || 'OTP sent successfully',
                user_id: response.data.user_id,
                email: response.data.email
            };
        }

        throw new Error('Failed to send OTP');
    } catch (error) {
        // Transform Axios error to a more specific error
        if (error.response) {
            // Handle HTTP errors with specific messages from backend
            if (error.response.status === 400) {
                throw new Error(error.response.data.error || 'Invalid credentials');
            } else if (error.response.status === 401) {
                throw new Error('Email not verified. Please check your email for verification instructions.');
            } else if (error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        // Re-throw other errors
        throw new Error(error.message || 'Failed to send OTP');
    }
};

// Verify OTP and complete login
export const verifyLoginOTP = async (email, otp) => {
    try {
        console.log('Sending OTP verification for:', email);
        const response = await api.post(`${API_URL}/verify-login-otp/`, {
            email,
            otp
        });

        console.log('OTP verification response:', response.data);

        if (response.data && response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refresh_token', response.data.refresh);
            }
            
            // Ensure user data is properly structured
            const userData = response.data.user || {};
            const completeUserData = {
                id: userData.id,
                username: userData.username || 'User', // Default fallback
                email: userData.email || email,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                role: userData.role || 'client',
                must_change_password: userData.must_change_password || false,
                email_verified: userData.email_verified || true
            };
            
            // Return enhanced response with guaranteed user data
            return {
                ...response.data,
                user: completeUserData
            };
        }

        throw new Error('OTP verification failed: No access token received');
    } catch (error) {
        console.error('OTP verification error:', error);
        // Transform Axios error to a more specific error
        if (error.response) {
            // Handle HTTP errors
            if (error.response.status === 400) {
                throw new Error(error.response.data.error || 'Invalid or expired OTP');
            } else if (error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        // Re-throw other errors
        throw new Error(error.message || 'OTP verification failed');
    }
};

// Legacy login (keep for reference, but you'll use OTP flow instead)
export const login = async (email, password) => {
    try {
        const response = await api.post(`${API_URL}/token/`, {
            email,
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
                throw new Error('Invalid email or password');
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
    // Clear any other user-related storage
    localStorage.removeItem('user_data');
};

export const getProtectedData = async () => {
    try {
        const response = await api.get(`${API_URL}/protected/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch protected data:', error);
        throw error;
    }
};

// Optional: Resend OTP function
export const resendLoginOTP = async (email) => {
    try {
        const response = await api.post(`${API_URL}/resend-login-otp/`, {
            email
        });

        if (response.data) {
            return {
                success: true,
                message: response.data.message || 'OTP resent successfully',
                user_id: response.data.user_id,
                email: response.data.email
            };
        }

        throw new Error('Failed to resend OTP');
    } catch (error) {
        if (error.response) {
            if (error.response.status === 400) {
                throw new Error(error.response.data.error || 'Failed to resend OTP');
            } else if (error.response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
        }
        throw new Error(error.message || 'Failed to resend OTP');
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

// Get current user from token with proper username handling
export const getCurrentUser = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        // Simple token parsing
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Ensure all fields have fallbacks
        return {
            id: payload.user_id,
            username: payload.username || 'User', // Critical fallback
            email: payload.email,
            first_name: payload.first_name || '',
            last_name: payload.last_name || '',
            role: payload.role || 'client',
            must_change_password: payload.must_change_password || false,
            email_verified: payload.email_verified !== undefined ? payload.email_verified : true
        };
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};

// Store user data in localStorage for persistence
export const storeUserData = (userData) => {
    try {
        localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
        console.error('Error storing user data:', error);
    }
};

// Retrieve user data from localStorage
export const getUserData = () => {
    try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// Clear all auth data
export const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
};

// Refresh token function
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken
        });

        if (response.data && response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            return response.data;
        }

        throw new Error('Token refresh failed');
    } catch (error) {
        console.error('Token refresh error:', error);
        clearAuthData();
        throw error;
    }
};

// Validate token and get user info
export const validateToken = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return { isValid: false, user: null };
        }

        // Try to get protected data to validate token
        await getProtectedData();
        
        // If successful, get user from token
        const user = getCurrentUser();
        return { isValid: true, user };
    } catch (error) {
        console.error('Token validation error:', error);
        
        // Try to refresh token if it's expired
        if (error.response && error.response.status === 401) {
            try {
                await refreshToken();
                const user = getCurrentUser();
                return { isValid: true, user };
            } catch (refreshError) {
                clearAuthData();
                return { isValid: false, user: null };
            }
        }
        
        clearAuthData();
        return { isValid: false, user: null };
    }
};

// Get user role for authorization
export const getUserRole = () => {
    const user = getCurrentUser();
    return user ? user.role : null;
};

// Check if user has specific role
export const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
};

// Check if user is admin
export const isAdmin = () => {
    return hasRole('administrator');
};

// Check if user is police officer
export const isPoliceOfficer = () => {
    return hasRole('police_officer');
};

// Check if user is client
export const isClient = () => {
    return hasRole('client');
};