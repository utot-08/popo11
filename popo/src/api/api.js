import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions for firearm licenses
export const fetchUserFirearmLicenses = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await api.get('firearm-licenses/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.results || response.data)) {
      throw new Error('Invalid data format received from server');
    }

    // Process the license data
    const processedLicenses = (response.data.results || response.data).map((license) => ({
      ...license,
      // Ensure owner object exists
      owner: license.owner || {},
      // Format dates for consistent display
      date_issued: license.date_issued
        ? new Date(license.date_issued).toISOString().split('T')[0]
        : '',
      expiry_date: license.expiry_date
        ? new Date(license.expiry_date).toISOString().split('T')[0]
        : '',
      // Ensure photo URL is properly formatted
      photo_url: license.photo_url || null,
    }));

    return processedLicenses;
  } catch (error) {
    console.error('Error fetching user firearm licenses:', error);
    throw error;
  }
};

export default api;