/**
 * validation.js — Form Validation Engine
 * Validates the structured form data from App.collectFormData().
 * Shows inline error messages and toast notifications.
 */

const Validation = {
  /**
   * Validate the form data.
   * @param {Object} data — structured data from App.collectFormData()
   * @returns {{ valid: boolean, errors: Array<{fieldId: string, message: string}> }}
   */
  validateForm(data) {
    this.clearAllErrors();
    const errors = [];

    // Invoice Number — required
    if (!data.invoice.number || !data.invoice.number.trim()) {
      errors.push({ fieldId: 'invoice-number', message: 'Invoice number is required.' });
    }

    // Invoice Date — required
    if (!data.invoice.date) {
      errors.push({ fieldId: 'invoice-date', message: 'Invoice date is required.' });
    }

    // Client Name OR Company Name — at least one required
    if (!data.client.name?.trim() && !data.client.company?.trim()) {
      errors.push({ fieldId: 'client-name', message: 'Client name or company name is required.' });
    }

    // At least one valid work item (description + rate > 0)
    const validItems = (data.items || []).filter(i => i.description?.trim() && i.rate > 0);
    if (validItems.length === 0) {
      errors.push({ fieldId: null, message: 'At least one work item with a description and rate is required.' });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Show an error on a specific form field.
   */
  showFieldError(fieldId, message) {
    if (!fieldId) return; // For non-field errors, we use toast only

    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-invalid');

    // Avoid duplicate error messages
    const parent = field.closest('.field-group') || field.parentNode;
    let errorEl = parent.querySelector('.invalid-feedback');
    if (errorEl) {
      errorEl.textContent = message;
    } else {
      errorEl = document.createElement('div');
      errorEl.className = 'invalid-feedback';
      errorEl.textContent = message;
      parent.appendChild(errorEl);
    }
  },

  /**
   * Clear error on a specific field.
   */
  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('is-invalid');
    const parent = field.closest('.field-group') || field.parentNode;
    const errorEl = parent.querySelector('.invalid-feedback');
    if (errorEl) errorEl.remove();
  },

  /**
   * Clear all errors.
   */
  clearAllErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
      el.remove();
    });
  },

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   */
  showToast(message, type = 'success') {
    // Create container if needed
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon
    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};
