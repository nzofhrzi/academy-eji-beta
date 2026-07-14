/* ════════════════════════════════════════════════════
   ACADEMY EJI - ENHANCED AUTH INTEGRATION v2.0
   Melengkapi auth.js original dengan Utils modular
   ════════════════════════════════════════════════════ */

// Extended Auth methods dengan integration ke Utils
const AuthUtils = {
  /**
   * Check if current user can access resource
   */
  canAccess: (requiredRole = null) => {
    const user = Auth.getUser();
    if (!user) return false;
    
    if (requiredRole === 'vip') return Auth.isVIP();
    if (requiredRole === 'guest') return Auth.isGuest();
    return true;
  },

  /**
   * Require login, redirect jika belum
   */
  requireLogin: (redirectTo = '/auth/login.html') => {
    if (!Auth.isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  /**
   * Require VIP, show upgrade prompt jika tidak
   */
  requireVIP: (callback = null) => {
    if (!Auth.isVIP()) {
      if (callback) {
        callback();
      } else {
        Notify.warning('Fitur ini hanya untuk member VIP. Upgrade sekarang!');
      }
      return false;
    }
    return true;
  },

  /**
   * Handle login form
   */
  handleLoginForm: async (username, password) => {
    if (!username || !password) {
      Notify.error('Username dan password tidak boleh kosong');
      return false;
    }

    const result = await Auth.login(username, password);
    
    if (result.success) {
      Notify.success('Login berhasil!');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
      return true;
    } else {
      Notify.error(result.message);
      return false;
    }
  },

  /**
   * Handle signup form
   */
  handleSignupForm: async (username, password, confirmPassword) => {
    if (!username || !password || !confirmPassword) {
      Notify.error('Semua field harus diisi');
      return false;
    }

    if (password !== confirmPassword) {
      Notify.error('Password tidak cocok');
      return false;
    }

    if (password.length < 6) {
      Notify.error('Password minimal 6 karakter');
      return false;
    }

    const result = await Auth.signup(username, password);
    
    if (result.success) {
      Notify.success('Signup berhasil! Selamat datang!');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
      return true;
    } else {
      Notify.error(result.message);
      return false;
    }
  },

  /**
   * Logout dengan konfirmasi
   */
  logout: (confirmLogout = true) => {
    if (confirmLogout) {
      if (!confirm('Apakah Anda yakin ingin logout?')) {
        return false;
      }
    }

    Auth.logout();
    Notify.success('Logout berhasil');
    setTimeout(() => {
      window.location.href = '/';
    }, 800);
    return true;
  },

  /**
   * Get user display name
   */
  getUserName: () => {
    const user = Auth.getUser();
    return user ? user.username : 'Guest';
  },

  /**
   * Get user role badge
   */
  getRoleBadge: () => {
    if (Auth.isVIP()) {
      return '<span class="badge badge-warning">VIP</span>';
    } else if (Auth.isGuest()) {
      return '<span class="badge badge-secondary">Member</span>';
    }
    return '<span class="badge badge-secondary">Guest</span>';
  },

  /**
   * Update user UI elements
   */
  updateUserUI: () => {
    const user = Auth.getUser();
    
    if (!user) {
      // Show login button
      const loginBtn = DOM.byId('login-btn');
      if (loginBtn) DOM.show(loginBtn);
      
      const userProfile = DOM.byId('user-profile');
      if (userProfile) DOM.hide(userProfile);
      
      return;
    }

    // Update user profile section
    const userNameEl = DOM.query('.user-name');
    if (userNameEl) DOM.text(userNameEl, user.username);

    const userRoleEl = DOM.query('.user-role');
    if (userRoleEl) {
      const role = Auth.isVIP() ? 'VIP Member' : 'Regular Member';
      DOM.text(userRoleEl, role);
    }

    const userBadge = DOM.byId('user-badge');
    if (userBadge) userBadge.innerHTML = AuthUtils.getRoleBadge();

    // Show logout button
    const logoutBtn = DOM.byId('logout-btn');
    if (logoutBtn) DOM.show(logoutBtn);

    const loginBtn = DOM.byId('login-btn');
    if (loginBtn) DOM.hide(loginBtn);
  }
};

// Listen to auth changes
document.addEventListener('authchange', () => {
  AuthUtils.updateUserUI();
});

document.addEventListener('logout', () => {
  AuthUtils.updateUserUI();
});

// Update UI on load
if (document.readyState !== 'loading') {
  AuthUtils.updateUserUI();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    AuthUtils.updateUserUI();
  });
}
