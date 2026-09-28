/**
 * Centralized API Client for RIMS REST API
 * Base URL: http://localhost:5000/api
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('rims_jwt_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('rims_current_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.currentUser = user;
    if (token) {
      localStorage.setItem('rims_jwt_token', token);
      localStorage.setItem('rims_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rims_jwt_token');
      localStorage.removeItem('rims_current_user');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Request failed`);
      }
      return data;
    } catch (error) {
      console.warn(`[API REQUEST ERROR] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // --- Health Check ---
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'disconnected', error: err.message };
    }
  }

  // --- Auth APIs ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data) {
      this.setSession(res.data.token, res.data.user);
    }
    return res;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  logout() {
    this.setSession(null, null);
  }

  // --- Products APIs ---
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProductById(id) {
    return await this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  // --- Warehouses APIs ---
  async getWarehouses() {
    return await this.request('/warehouses');
  }

  async getWarehouseById(id) {
    return await this.request(`/warehouses/${id}`);
  }

  // --- Inventory & Stock APIs ---
  async getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/inventory${query ? `?${query}` : ''}`);
  }

  async getLowStockAlerts() {
    return await this.request('/inventory/low-stock');
  }

  async adjustStock(payload) {
    return await this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async transferStock(payload) {
    return await this.request('/inventory/transfer', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getStockMovements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/inventory/movements${query ? `?${query}` : ''}`);
  }

  // --- Orders & Fulfillment APIs ---
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrderById(id) {
    return await this.request(`/orders/${id}`);
  }

  async createOrder(orderPayload) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  }

  async updateOrderStatus(id, status) {
    return await this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // --- Suppliers & Purchase Orders APIs ---
  async getSuppliers() {
    return await this.request('/suppliers');
  }

  async getPurchaseOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/purchase-orders${query ? `?${query}` : ''}`);
  }

  async createPurchaseOrder(poPayload) {
    return await this.request('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(poPayload)
    });
  }

  async receivePurchaseOrder(id) {
    return await this.request(`/purchase-orders/${id}/receive`, {
      method: 'PUT'
    });
  }

  // --- Reports & Dashboard Analytics ---
  async getDashboardSummary() {
    return await this.request('/reports/dashboard');
  }

  async getInventoryValuation() {
    return await this.request('/reports/inventory-valuation');
  }
}

export const api = new ApiClient();
