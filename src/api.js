// ─── Central API Configuration ───────────────────────────────────────
export const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Returns Authorization header with the JWT access token (if available).
 */
export function authHeaders() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Wrapper around fetch that:
 *  - prepends the base URL
 *  - merges auth headers automatically
 *  - parses JSON response
 */
export async function apiRequest(endpoint, options = {}) {
    const { headers = {}, ...rest } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
            ...headers,
        },
        ...rest,
    });

    const data = await response.json();
    return { response, data };
}

/**
 * Save JWT tokens to localStorage after login.
 */
export function saveTokens(access, refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
}

/**
 * Clear JWT tokens from localStorage on logout.
 */
export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

/**
 * Check if user has a stored access token.
 */
export function hasToken() {
    return !!localStorage.getItem("access_token");
}
