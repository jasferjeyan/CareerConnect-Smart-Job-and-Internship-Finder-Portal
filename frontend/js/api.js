/**
 * CareerConnect - Core API Client & Frontend Utilities
 */

const API_BASE = '/api';

// Token Management
const AuthToken = {
  get: () => localStorage.getItem('careerconnect_token'),
  set: (token) => localStorage.setItem('careerconnect_token', token),
  remove: () => localStorage.removeItem('careerconnect_token')
};

// User Session Management
const UserSession = {
  get: () => {
    try {
      const data = localStorage.getItem('careerconnect_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem('careerconnect_user', JSON.stringify(user)),
  remove: () => localStorage.removeItem('careerconnect_user')
};

/**
 * Universal API Request Wrapper
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const token = AuthToken.get();

  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle JSON body if not FormData
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body
    });

    // Handle 401 Unauthorized (expired or invalid token)
    if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      AuthToken.remove();
      UserSession.remove();
      // Redirect to login if on protected page
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('dashboard') ||
        currentPath.includes('profile') ||
        currentPath.includes('post-job') ||
        currentPath.includes('applications') ||
        currentPath.includes('manage-jobs') ||
        currentPath.includes('saved-jobs') ||
        currentPath.includes('applicants')
      ) {
        showToast('Your session has expired. Please log in again.', 'warning');
        setTimeout(() => {
          window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
        }, 1200);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'warning') icon = '🔔';

  toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * HTML Escaper to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format ISO Date to readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Application status badge helper
 */
function getStatusBadge(status) {
  let badgeClass = 'badge-muted';
  switch (status) {
    case 'Applied':
      badgeClass = 'badge-primary';
      break;
    case 'Under Review':
      badgeClass = 'badge-warning';
      break;
    case 'Shortlisted':
      badgeClass = 'badge-secondary';
      break;
    case 'Selected':
      badgeClass = 'badge-success';
      break;
    case 'Rejected':
      badgeClass = 'badge-danger';
      break;
    case 'Withdrawn':
      badgeClass = 'badge-muted';
      break;
  }
  return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
}

