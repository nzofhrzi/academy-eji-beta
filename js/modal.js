/* ════════════════════════════════════════════════════
   ACADEMY EJI - MODAL MANAGER
   ════════════════════════════════════════════════════ */

class ModalManager {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.init();
  }

  /**
   * Initialize modal manager
   */
  init() {
    // Auto-register existing modals
    DOM.queryAll('.modal').forEach((modal) => {
      const id = modal.id;
      if (id) {
        this.register(id, modal);
      }
    });

    // Attach close handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.close(e.target.id);
      }

      if (e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.close(modal.id);
        }
      }
    });

    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close(this.activeModal);
      }
    });
  }

  /**
   * Register modal
   */
  register(id, element) {
    this.modals.set(id, element);
  }

  /**
   * Get modal by ID
   */
  get(id) {
    return this.modals.get(id);
  }

  /**
   * Open modal
   */
  open(id, callback = null) {
    const modal = this.get(id);
    if (!modal) {
      console.warn(`Modal "${id}" not found`);
      return false;
    }

    this.activeModal = id;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (callback) {
      callback(modal);
    }

    return true;
  }

  /**
   * Close modal
   */
  close(id) {
    const modal = this.get(id);
    if (!modal) return false;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (this.activeModal === id) {
      this.activeModal = null;
    }

    return true;
  }

  /**
   * Close all modals
   */
  closeAll() {
    this.modals.forEach((modal, id) => {
      this.close(id);
    });
  }

  /**
   * Toggle modal
   */
  toggle(id) {
    const modal = this.get(id);
    if (!modal) return false;

    if (modal.classList.contains('active')) {
      return this.close(id);
    } else {
      return this.open(id);
    }
  }

  /**
   * Create and open modal dynamically
   */
  createAndOpen(id, title, content, actions = []) {
    const modal = DOM.create('div', 'modal');
    modal.id = id;

    const content_el = DOM.create('div', 'modal-content');

    const header = DOM.create('div', 'modal-header');
    header.innerHTML = `
      <h2>${title}</h2>
      <button class="modal-close" type="button">
        <i class="bx bx-x"></i>
      </button>
    `;

    const body = DOM.create('div', 'modal-body');
    body.innerHTML = content;

    const footer = DOM.create('div', 'modal-footer');
    
    actions.forEach((action) => {
      const btn = DOM.create('button', `btn btn-${action.type || 'primary'}`);
      btn.textContent = action.label;
      btn.addEventListener('click', action.click);
      footer.appendChild(btn);
    });

    const closeBtn = DOM.create('button', 'btn btn-ghost');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => this.close(id));
    footer.appendChild(closeBtn);

    content_el.appendChild(header);
    content_el.appendChild(body);
    content_el.appendChild(footer);
    modal.appendChild(content_el);

    document.body.appendChild(modal);
    this.register(id, modal);
    this.open(id);

    return modal;
  }
}

// Initialize modal manager
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
  });
} else {
  window.modalManager = new ModalManager();
}
