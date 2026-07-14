/* ════════════════════════════════════════════════════
   ACADEMY EJI - THEME MANAGER
   ════════════════════════════════════════════════════ */

class ThemeManager {
  constructor() {
    this.storageKey = 'app-theme';
    this.defaultTheme = 'light';
    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    const savedTheme = Storage.get(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : this.defaultTheme);
    
    this.setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Storage.get(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    Storage.set(this.storageKey, theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Get current theme
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || this.defaultTheme;
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const current = this.getTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Switch to light theme
   */
  toLightTheme() {
    this.setTheme('light');
  }

  /**
   * Switch to dark theme
   */
  toDarkTheme() {
    this.setTheme('dark');
  }
}

// Initialize theme manager on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}
