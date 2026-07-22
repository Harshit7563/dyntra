const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('dyntra-token');
}

function authHeaders(token = getToken()) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(res.ok ? 'Empty response from server' : `Server error (${res.status}). Is the backend running?`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server. Is the backend running on port 5001?');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  if (Array.isArray(data)) return { products: data, total: data.length, page: 1, pages: 1 };
  return data;
}

export async function fetchProduct(slug) {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCategoriesGrouped() {
  const res = await fetch(`${API_BASE}/categories?grouped=true`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchTestimonials() {
  const res = await fetch(`${API_BASE}/testimonials`);
  if (!res.ok) throw new Error('Failed to fetch testimonials');
  return res.json();
}

export async function fetchHeroSlides() {
  const res = await fetch(`${API_BASE}/hero`);
  if (!res.ok) throw new Error('Failed to fetch hero slides');
  return res.json();
}

export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Subscription failed');
  return data;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export async function placeOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData),
  });
  return parseJson(res);
}

export async function fetchOrder(orderNumber, email) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : '';
  const res = await fetch(`${API_BASE}/orders/${orderNumber}${qs}`, {
    headers: authHeaders(),
  });
  return parseJson(res);
}

export async function confirmPayment(orderNumber, paymentReference) {
  const res = await fetch(`${API_BASE}/payment/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_number: orderNumber,
      payment_reference: paymentReference,
    }),
  });
  return parseJson(res);
}

export async function fetchUpiCheckout(orderNumber, email) {
  const qs = new URLSearchParams({ email });
  const res = await fetch(`${API_BASE}/payment/upi-checkout/${encodeURIComponent(orderNumber)}?${qs}`);
  return parseJson(res);
}

export async function fetchBrightPayCheckout(orderNumber, email) {
  const qs = new URLSearchParams({ email });
  const res = await fetch(
    `${API_BASE}/payment/brightpay-checkout/${encodeURIComponent(orderNumber)}?${qs}`
  );
  return parseJson(res);
}

export async function pollBrightPayStatus(orderNumber, email) {
  const res = await fetch(`${API_BASE}/payment/brightpay-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_number: orderNumber, email }),
  });
  return parseJson(res);
}

export async function submitContactForm(data) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJson(res);
}

export async function shopWithAI(messages, excludeIds = []) {
  const res = await fetch(`${API_BASE}/ai/shop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, exclude_ids: excludeIds }),
  });
  return parseJson(res);
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: authHeaders(null),
    body: JSON.stringify({ email }),
  });
  return parseJson(res);
}

export async function resetPassword({ token, password }) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: authHeaders(null),
    body: JSON.stringify({ token, password }),
  });
  return parseJson(res);
}

export async function registerUser({ name, email, password, phone }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: authHeaders(null),
    body: JSON.stringify({ name, email, password, phone }),
  });
  return parseJson(res);
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: authHeaders(null),
    body: JSON.stringify({ email, password }),
  });
  return parseJson(res);
}

export async function fetchMe(token = getToken()) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(token),
  });
  return parseJson(res);
}

export async function fetchMyOrders() {
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers: authHeaders(),
  });
  return parseJson(res);
}

async function adminFetch(path, options = {}) {
  const headers = { ...authHeaders(), ...options.headers };
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const res = await fetch(`${API_BASE}/admin${path}`, {
    ...options,
    headers,
  });
  return parseJson(res);
}

export const adminApi = {
  stats: () => adminFetch('/dashboard/stats'),
  products: (params = {}) => adminFetch(`/products?${new URLSearchParams(params)}`),
  product: (id) => adminFetch(`/products/${id}`),
  createProduct: (data) => adminFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => adminFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => adminFetch(`/products/${id}`, { method: 'DELETE' }),
  categories: () => adminFetch('/categories'),
  updateCategory: (id, data) => adminFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  orders: (params = {}) => adminFetch(`/orders?${new URLSearchParams(params)}`),
  updateOrderStatus: (id, status) => adminFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  hero: () => adminFetch('/hero'),
  createHero: (data) => adminFetch('/hero', { method: 'POST', body: JSON.stringify(data) }),
  updateHero: (id, data) => adminFetch(`/hero/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHero: (id) => adminFetch(`/hero/${id}`, { method: 'DELETE' }),
  testimonials: () => adminFetch('/testimonials'),
  createTestimonial: (data) => adminFetch('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => adminFetch(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestimonial: (id) => adminFetch(`/testimonials/${id}`, { method: 'DELETE' }),
  paymentSettings: () => adminFetch('/payment/settings'),
  updatePaymentSettings: (data) => adminFetch('/payment/settings', { method: 'PUT', body: JSON.stringify(data) }),
  createPaymentGateway: (data) => adminFetch('/payment/gateways', { method: 'POST', body: JSON.stringify(data) }),
  updatePaymentGateway: (id, data) => adminFetch(`/payment/gateways/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePaymentGateway: (id) => adminFetch(`/payment/gateways/${id}`, { method: 'DELETE' }),
  activatePaymentGateway: (id) => adminFetch(`/payment/gateways/${id}/activate`, { method: 'POST' }),
  festivalSettings: () => adminFetch('/festival'),
  updateFestivalSettings: (data) => adminFetch('/festival', { method: 'PUT', body: JSON.stringify(data) }),
  uploadProductImage: (file) => {
    const body = new FormData();
    body.append('image', file);
    return adminFetch('/upload/product-image', { method: 'POST', body });
  },
  uploadProductImages: (files) => {
    const body = new FormData();
    [...files].forEach((file) => body.append('images', file));
    return adminFetch('/upload/product-images', { method: 'POST', body });
  },
};

export async function fetchFestivalTheme() {
  const res = await fetch(`${API_BASE}/festival`);
  if (!res.ok) throw new Error('Failed to load festival theme');
  return res.json();
}

export async function fetchPaymentConfig() {
  const res = await fetch(`${API_BASE}/payment/config`);
  if (!res.ok) throw new Error('Failed to load payment options');
  return res.json();
}

export async function buildPaymentRedirect(order) {
  const res = await fetch(`${API_BASE}/payment/build-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_number: order.order_number,
      amount: order.total,
      email: order.email,
      phone: order.phone,
      name: order.customer_name,
    }),
  });
  return parseJson(res);
}
