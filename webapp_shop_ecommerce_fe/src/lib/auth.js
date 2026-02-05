// Authentication utility functions

const TOKEN_KEY = 'token';

/**
 * Get token from localStorage
 * @returns {string|null} token or null if not found
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set token in localStorage
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated (has token)
 * @returns {boolean} true if token exists
 */
export const isAuthenticated = () => {
    return !!getToken();
};
