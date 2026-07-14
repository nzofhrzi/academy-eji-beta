/* ════════════════════════════════════════════════════
   ACADEMY EJI - SIDEBAR NAVIGATION
   ════════════════════════════════════════════════════ */

class SidebarManager {
  constructor() {
    this.sidebar = DOM.byId('sidebar');
    this.wrapper = DOM.byId('wrapper');
    this.toggleBtn = DOM.query('[data-toggle="sidebar"]');
    this.navItems = DOM.queryAll('.nav-item');
    
    if (!this.sidebar) return;
    
    this.init();
  }

  /**
   * Initialize sidebar
   */
  init() {
    this.attachEventListeners();
    this.setActiveItem();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle button
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }

    // Navigation items
    this.navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActive(item);
      });
    });

    // Close sidebar on mobile when clicking outside
    if (Utils.isMobile()) {
      document.addEventListener('click', (e) => {
        const isClickInsideSidebar = this.sidebar.contains(e.target);
        const isClickOnToggle = this.toggleBtn?.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && this.sidebar.classList.contains('active')) {
          this.close();
        }
      });
    }
  }

  /**
   * Toggle sidebar
   */
  toggle() {
    this.sidebar.classList.toggle('active');
  }

  /**
   * Open sidebar
   */
  open() {
    this.sidebar.classList.add('active');
  }

  /**
   * Close sidebar
   */
  close() {
    this.sidebar.classList.remove('active');
  }

  /**
   * Set active nav item
   */
  setActive(item) {
    this.navItems.forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
    
    // Save to storage
    const href = item.getAttribute('href') || item.getAttribute('data-href');
    if (href) {
      Storage.set('active-nav', href);
    }

    // Close sidebar on mobile
    if (Utils.isMobile()) {
      this.close();
    }
  }

  /**
   * Set active item based on current page
   */
  setActiveItem() {
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    
    this.navItems.forEach((item) => {
      const href = item.getAttribute('href') || item.getAttribute('data-href') || '';
      
      if (href && (href === currentFile || href === currentPath || window.location.href.includes(href))) {
        this.setActive(item);
      }
    });
  }

  /**
   * Add nav item
   */
  addNavItem(section, label, icon, href) {
    const sectionEl = DOM.query(`.sidebar-section:contains("${section}")`);
    if (!sectionEl) return;

    const item = DOM.create('a', 'nav-item');
    item.href = href;
    item.innerHTML = `<i class="nav-icon bx ${icon}"></i><span>${label}</span>`;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActive(item);
    });

    sectionEl.parentElement.insertBefore(item, sectionEl.nextElementSibling);
  }
}

// Initialize sidebar on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
  });
} else {
  window.sidebarManager = new SidebarManager();
}
