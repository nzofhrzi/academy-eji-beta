/* ════════════════════════════════════════════════════
   ACADEMY EJI - MAIN APPLICATION
   ════════════════════════════════════════════════════ */

class App {
  constructor() {
    this.name = 'Academy Eji';
    this.version = '2.0.0';
    this.initialized = false;
    
    console.log(`${this.name} v${this.version} initialized`);
  }

  /**
   * Initialize app
   */
  async init() {
    if (this.initialized) return;

    try {
      // Initialize managers
      window.themeManager = window.themeManager || new ThemeManager();
      window.sidebarManager = window.sidebarManager || new SidebarManager();
      window.modalManager = window.modalManager || new ModalManager();

      // Load user data if authenticated
      await this.loadUserData();

      // Set up event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log('App fully initialized');
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  /**
   * Load user data
   */
  async loadUserData() {
    try {
      const userData = Storage.get('user');
      if (!userData) {
        // Check if user is on auth page
        if (!window.location.href.includes('auth') && !window.location.href.includes('login')) {
          // Redirect to login if not authenticated
          // window.location.href = '/auth/login.html';
        }
      }
      return userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('App resumed');
      } else {
        console.log('App hidden');
      }
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      Notify.success('Connection restored');
    });

    window.addEventListener('offline', () => {
      Notify.warning('Connection lost');
    });

    // Handle unload
    window.addEventListener('beforeunload', (e) => {
      // Optional: warn user about unsaved changes
    });
  }

  /**
   * Logout user
   */
  logout() {
    Storage.remove('user');
    Storage.remove('auth-token');
    window.location.href = '/';
  }

  /**
   * Update user data
   */
  updateUserData(data) {
    Storage.set('user', data);
    document.dispatchEvent(new CustomEvent('userupdate', { detail: data }));
  }

  /**
   * Get user data
   */
  getUserData() {
    return Storage.get('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!Storage.get('auth-token');
  }
}

// Initialize app on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
  });
} else {
  window.app = new App();
  window.app.init();
}
