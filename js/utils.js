/* Utility Functions - Compatible with Auth system */
const DOM = {
  byId: (id) => document.getElementById(id),
  query: (selector) => document.querySelector(selector),
  queryAll: (selector) => document.querySelectorAll(selector),
  create: (tag, className = '') => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  },
  addClass: (el, cls) => el && el.classList.add(cls),
  removeClass: (el, cls) => el && el.classList.remove(cls),
  toggleClass: (el, cls) => el && el.classList.toggle(cls),
  hasClass: (el, cls) => el && el.classList.contains(cls),
  attr: (el, key, value) => {
    if (value === undefined) return el?.getAttribute(key);
    el?.setAttribute(key, value);
  },
  text: (el, content) => {
    if (content === undefined) return el?.textContent;
    if (el) el.textContent = content;
  },
  html: (el, content) => {
    if (content === undefined) return el?.innerHTML;
    if (el) el.innerHTML = content;
  },
  value: (el, val) => {
    if (val === undefined) return el?.value;
    if (el) el.value = val;
  },
  show: (el) => el && (el.style.display = ''),
  hide: (el) => el && (el.style.display = 'none'),
  toggle: (el) => el && (el.style.display = el.style.display === 'none' ? '' : 'none'),
};

const Storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      return false;
    }
  },
};

const API = {
  request: async (method, url, data = null, headers = {}) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      if (data) options.body = JSON.stringify(data);
      const response = await fetch(url, options);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'API Error');
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  get: (url, headers = {}) => API.request('GET', url, null, headers),
  post: (url, data, headers = {}) => API.request('POST', url, data, headers),
  put: (url, data, headers = {}) => API.request('PUT', url, data, headers),
  delete: (url, headers = {}) => API.request('DELETE', url, null, headers),
};

const Notify = {
  show: (message, type = 'info', duration = 3000) => {
    const el = DOM.create('div', `card card-alert ${type === 'success' ? 'success' : type === 'error' ? 'danger' : type}`);
    el.innerHTML = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success: (message, duration = 3000) => Notify.show(message, 'success', duration),
  error: (message, duration = 3000) => Notify.show(message, 'error', duration),
  info: (message, duration = 3000) => Notify.show(message, 'info', duration),
  warning: (message, duration = 3000) => Notify.show(message, 'warning', duration),
};

const Utils = {
  debounce: (func, delay = 300) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },
  throttle: (func, limit = 300) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  randomId: () => Math.random().toString(36).substring(2, 11),
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
};
