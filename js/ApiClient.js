// Pure OOP ApiClient Class
class ApiClient {
  constructor() {
    this._baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api'
      : '/api';
    this._storageKey = 'acme_store_token';
  }

  getToken() {
    return localStorage.getItem(this._storageKey) || null;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this._storageKey, token);
    } else {
      localStorage.removeItem(this._storageKey);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this._baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || `Error HTTP (${response.status})`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.code = data?.error?.code;
        err.details = data?.error?.details;
        throw err;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, v);
      }
    });
    const query = searchParams.toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();
