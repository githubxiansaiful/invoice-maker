/**
 * app.js — Main Application Controller
 * Invoice Maker for Freelance Developers
 * 
 * Orchestrates form state, event binding, work item management,
 * and coordinates between calculations, preview, validation, and PDF modules.
 */

const App = (() => {
  // ─── State ───────────────────────────────────────────────
  let workItems = [];
  let workItemIdCounter = 0;
  let discountEnabled = false;
  let taxEnabled = false;

  // ─── Work Type Options ───────────────────────────────────
  const WORK_TYPES = [
    'Website Development',
    'Web Application',
    'Feature Development',
    'Bug Fix',
    'UI/UX Update',
    'Maintenance',
    'Performance Optimization',
    'API Integration',
    'Database Work',
    'Deployment',
    'Consultation',
    'Other'
  ];

  // ─── Unit Options ────────────────────────────────────────
  const UNITS = [
    'Project',
    'Task',
    'Hour',
    'Day',
    'Fixed Price'
  ];

  // ─── Currency Options ────────────────────────────────────
  const CURRENCIES = [
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    { code: 'BDT', symbol: '৳', label: 'BDT (৳)' }
  ];

  // ─── Payment Method Options ──────────────────────────────
  const PAYMENT_METHODS = [
    'Bank Transfer',
    'PayPal',
    'Wise',
    'Payoneer',
    'Stripe',
    'Cash',
    'Other'
  ];

  // ─── Payment Terms Options ───────────────────────────────
  const PAYMENT_TERMS = [
    'Due on receipt',
    'Net 7',
    'Net 14',
    'Net 30',
    'Custom'
  ];

  // ─── Initialization ─────────────────────────────────────
  function init() {
    setDefaultValues();
    addWorkItem(); // Start with one empty work item
    bindEvents();
    restoreBusinessDetails(); // Restore saved business info
    populateSavedClientsDropdown(); // Populate saved clients
    updatePreview();

    // Try to restore from localStorage
    restoreFromLocalStorage();
  }

  // ─── Set Default Values ──────────────────────────────────
  function setDefaultValues() {
    // Invoice date = today
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const el = document.getElementById('invoice-date');
    if (el) el.value = dateStr;

    // Due date = 14 days from now
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    const dueEl = document.getElementById('due-date');
    if (dueEl) dueEl.value = dueDateStr;

    // Invoice number
    const invNum = document.getElementById('invoice-number');
    if (invNum) invNum.value = Calculations.generateInvoiceNumber();

    // Currency default: EUR
    const currSelect = document.getElementById('currency');
    if (currSelect) currSelect.value = 'EUR';

    // Payment terms default
    const termsSelect = document.getElementById('payment-terms');
    if (termsSelect) termsSelect.value = 'Due on receipt';

    // Discount & Tax toggles off
    discountEnabled = false;
    taxEnabled = false;
    updateToggleUI('discount', false);
    updateToggleUI('tax', false);
  }

  // ─── Toggle UI Update ───────────────────────────────────
  function updateToggleUI(type, enabled) {
    const toggle = document.getElementById(`${type}-toggle`);
    const content = document.getElementById(`${type}-content`);
    if (toggle) {
      toggle.classList.toggle('active', enabled);
      toggle.setAttribute('aria-checked', enabled);
    }
    if (content) {
      content.style.display = enabled ? 'block' : 'none';
    }
  }

  // ─── Bind Events ────────────────────────────────────────
  function bindEvents() {
    // All form inputs trigger preview update
    const editorPanel = document.getElementById('editor-panel');
    if (editorPanel) {
      editorPanel.addEventListener('input', debounce(handleFormChange, 150));
      editorPanel.addEventListener('change', handleFormChange);
    }

    // Add work item button
    const addBtn = document.getElementById('add-work-item');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addWorkItem();
        updatePreview();
      });
    }

    // Discount toggle
    const discountToggle = document.getElementById('discount-toggle');
    if (discountToggle) {
      discountToggle.addEventListener('click', () => {
        discountEnabled = !discountEnabled;
        updateToggleUI('discount', discountEnabled);
        updatePreview();
        saveToLocalStorage();
      });
      discountToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          discountToggle.click();
        }
      });
    }

    // Tax toggle
    const taxToggle = document.getElementById('tax-toggle');
    if (taxToggle) {
      taxToggle.addEventListener('click', () => {
        taxEnabled = !taxEnabled;
        updateToggleUI('tax', taxEnabled);
        updatePreview();
        saveToLocalStorage();
      });
      taxToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          taxToggle.click();
        }
      });
    }

    // Download PDF button
    const downloadBtn = document.getElementById('download-pdf');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', handleDownloadPDF);
    }

    // Print button
    const printBtn = document.getElementById('print-invoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        PDFExport.printInvoice();
      });
    }

    // New Invoice button
    const newBtn = document.getElementById('new-invoice');
    if (newBtn) {
      newBtn.addEventListener('click', handleNewInvoice);
    }

    // Discount type change
    const discountType = document.getElementById('discount-type');
    if (discountType) {
      discountType.addEventListener('change', () => {
        updatePreview();
        saveToLocalStorage();
      });
    }

    // Save business details button
    const saveBizBtn = document.getElementById('save-business-details');
    if (saveBizBtn) {
      saveBizBtn.addEventListener('click', saveBusinessDetails);
    }

    // Save client button
    const saveClientBtn = document.getElementById('save-client-btn');
    if (saveClientBtn) {
      saveClientBtn.addEventListener('click', saveCurrentClient);
    }

    // Delete client button
    const deleteClientBtn = document.getElementById('delete-client-btn');
    if (deleteClientBtn) {
      deleteClientBtn.addEventListener('click', deleteSelectedClient);
    }

    // Saved client select change
    const savedClientSelect = document.getElementById('saved-client-select');
    if (savedClientSelect) {
      savedClientSelect.addEventListener('change', loadSelectedClient);
    }
  }

  // ─── Handle Form Change ──────────────────────────────────
  function handleFormChange() {
    updatePreview();
    saveToLocalStorage();
  }

  // ─── Collect Form Data ───────────────────────────────────
  function collectFormData() {
    const data = {
      // Business details
      business: {
        name: getVal('business-name'),
        address: getVal('business-address'),
        email: getVal('business-email'),
        phone: getVal('business-phone'),
        website: getVal('business-website'),
        taxNumber: getVal('business-tax-number')
      },
      // Client details
      client: {
        name: getVal('client-name'),
        company: getVal('client-company'),
        email: getVal('client-email'),
        address: getVal('client-address'),
        phone: getVal('client-phone'),
        taxNumber: getVal('client-tax-number')
      },
      // Invoice details
      invoice: {
        number: getVal('invoice-number'),
        date: getVal('invoice-date'),
        dueDate: getVal('due-date'),
        currency: getVal('currency') || 'EUR',
        paymentTerms: getVal('payment-terms')
      },
      // Work items
      items: collectWorkItems(),
      // Discount
      discount: {
        enabled: discountEnabled,
        type: getVal('discount-type') || 'percentage',
        value: parseFloat(getVal('discount-value')) || 0
      },
      // Tax
      tax: {
        enabled: taxEnabled,
        rate: parseFloat(getVal('tax-rate')) || 0
      },
      // Payment info
      payment: {
        method: getVal('payment-method'),
        details: getVal('payment-details')
      },
      // Notes & Terms
      notes: getVal('invoice-notes'),
      terms: getVal('invoice-terms')
    };

    // Calculate totals
    const subtotal = Calculations.calculateSubtotal(data.items);
    const discountAmount = data.discount.enabled
      ? Calculations.calculateDiscount(subtotal, data.discount.value, data.discount.type)
      : 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = data.tax.enabled
      ? Calculations.calculateTax(afterDiscount, data.tax.rate)
      : 0;
    const total = Calculations.calculateTotal(subtotal, discountAmount, taxAmount);

    data.totals = {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };

    return data;
  }

  // ─── Collect Work Items from DOM ─────────────────────────
  function collectWorkItems() {
    const items = [];
    const rows = document.querySelectorAll('.work-item-row');
    rows.forEach(row => {
      const id = row.dataset.itemId;
      const description = row.querySelector(`[data-field="description"]`)?.value || '';
      const workType = row.querySelector(`[data-field="work-type"]`)?.value || '';
      const quantity = parseFloat(row.querySelector(`[data-field="quantity"]`)?.value) || 0;
      const unit = row.querySelector(`[data-field="unit"]`)?.value || '';
      const rate = parseFloat(row.querySelector(`[data-field="rate"]`)?.value) || 0;
      const amount = Calculations.calculateItemAmount(quantity, rate);

      // Update the amount display in the row
      const amountDisplay = row.querySelector('.item-amount-display');
      if (amountDisplay) {
        const currency = getVal('currency') || 'EUR';
        amountDisplay.textContent = Calculations.formatCurrency(amount, currency);
      }

      items.push({ id, description, workType, quantity, unit, rate, amount });
    });
    return items;
  }

  // ─── Add Work Item ───────────────────────────────────────
  function addWorkItem(itemData = null) {
    workItemIdCounter++;
    const id = workItemIdCounter;

    const container = document.getElementById('work-items-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'work-item-row';
    row.dataset.itemId = id;

    const description = itemData?.description || '';
    const workType = itemData?.workType || 'Feature Development';
    const quantity = itemData?.quantity || 1;
    const unit = itemData?.unit || 'Fixed Price';
    const rate = itemData?.rate || '';

    row.innerHTML = `
      <div class="work-item-header">
        <span class="work-item-number">#${id}</span>
        <button type="button" class="btn-icon btn-delete-item" aria-label="Delete work item" title="Delete work item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
      <div class="work-item-fields">
        <div class="field-group field-description">
          <label>Description</label>
          <textarea data-field="description" placeholder="e.g., Website Development & Feature Updates" rows="2">${description}</textarea>
        </div>
        <div class="work-item-grid">
          <div class="field-group">
            <label>Work Type</label>
            <select data-field="work-type">
              ${WORK_TYPES.map(t => `<option value="${t}" ${t === workType ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="field-group">
            <label>Quantity</label>
            <input type="number" data-field="quantity" value="${quantity}" min="0" step="0.5" />
          </div>
          <div class="field-group">
            <label>Unit</label>
            <select data-field="unit">
              ${UNITS.map(u => `<option value="${u}" ${u === unit ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>
          <div class="field-group">
            <label>Rate</label>
            <input type="number" data-field="rate" value="${rate}" min="0" step="0.01" placeholder="0.00" />
          </div>
          <div class="field-group">
            <label>Amount</label>
            <div class="item-amount-display">—</div>
          </div>
        </div>
      </div>
    `;

    // Bind delete button
    const deleteBtn = row.querySelector('.btn-delete-item');
    deleteBtn.addEventListener('click', () => {
      // Don't allow deleting the last item
      const allRows = document.querySelectorAll('.work-item-row');
      if (allRows.length <= 1) {
        Validation.showToast('You need at least one work item.', 'warning');
        return;
      }
      row.classList.add('removing');
      setTimeout(() => {
        row.remove();
        renumberWorkItems();
        updatePreview();
        saveToLocalStorage();
      }, 200);
    });

    container.appendChild(row);

    // Animate in
    requestAnimationFrame(() => {
      row.classList.add('visible');
    });
  }

  // ─── Renumber Work Items ─────────────────────────────────
  function renumberWorkItems() {
    const rows = document.querySelectorAll('.work-item-row');
    rows.forEach((row, index) => {
      const numberEl = row.querySelector('.work-item-number');
      if (numberEl) numberEl.textContent = `#${index + 1}`;
    });
  }

  // ─── Update Preview ──────────────────────────────────────
  function updatePreview() {
    const data = collectFormData();
    Preview.update(data);
  }

  // ─── Handle Download PDF ─────────────────────────────────
  async function handleDownloadPDF() {
    const data = collectFormData();
    const result = Validation.validateForm(data);

    if (!result.valid) {
      result.errors.forEach(err => {
        Validation.showFieldError(err.fieldId, err.message);
      });
      Validation.showToast('Please fix the errors before downloading.', 'error');
      return;
    }

    Validation.clearAllErrors();

    const downloadBtn = document.getElementById('download-pdf');
    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="30 70" />
        </svg>
        Generating...
      `;
    }

    try {
      await PDFExport.downloadPDF();
      Validation.showToast('Invoice PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      Validation.showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download PDF
        `;
      }
    }
  }

  // ─── Handle New Invoice ──────────────────────────────────
  function handleNewInvoice() {
    // Check if form has content
    const data = collectFormData();
    const hasContent = data.business.name || data.client.name || data.client.company ||
      data.items.some(i => i.description || i.rate > 0);

    if (hasContent) {
      showConfirmDialog(
        'Start a new invoice?',
        'Your current invoice will be cleared. This action cannot be undone.',
        () => {
          resetForm();
        }
      );
    } else {
      resetForm();
    }
  }

  // ─── Reset Form ──────────────────────────────────────────
  function resetForm() {
    // Clear all inputs
    const editorPanel = document.getElementById('editor-panel');
    if (editorPanel) {
      const inputs = editorPanel.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.type === 'number') {
          input.value = '';
        } else if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        } else {
          input.value = '';
        }
      });
    }

    // Remove all work items
    const container = document.getElementById('work-items-list');
    if (container) container.innerHTML = '';

    // Reset state
    workItemIdCounter = 0;
    discountEnabled = false;
    taxEnabled = false;

    // Set defaults again
    setDefaultValues();
    restoreBusinessDetails(); // Re-fill business info from saved
    addWorkItem();
    updatePreview();

    // Clear validation errors
    Validation.clearAllErrors();

    // Clear localStorage
    localStorage.removeItem('invoice-maker-data');

    Validation.showToast('New invoice started.', 'success');
  }

  // ─── Confirm Dialog ──────────────────────────────────────
  function showConfirmDialog(title, message, onConfirm) {
    // Remove existing dialog if any
    const existing = document.getElementById('confirm-dialog-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirm-dialog-overlay';
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog-content">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" id="dialog-cancel">Cancel</button>
          <button type="button" class="btn btn-danger" id="dialog-confirm">Clear & Start New</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    document.getElementById('dialog-cancel').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
    });

    document.getElementById('dialog-confirm').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
      onConfirm();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
      }
    });
  }

  // ─── LocalStorage ────────────────────────────────────────
  function saveToLocalStorage() {
    try {
      const data = collectFormData();
      // Also save toggle states
      data._meta = {
        discountEnabled,
        taxEnabled
      };
      localStorage.setItem('invoice-maker-data', JSON.stringify(data));
    } catch (e) {
      // Silently fail — localStorage is optional
    }
  }

  function restoreFromLocalStorage() {
    try {
      const saved = localStorage.getItem('invoice-maker-data');
      if (!saved) return;

      const data = JSON.parse(saved);

      // Restore business info
      setVal('business-name', data.business?.name);
      setVal('business-address', data.business?.address);
      setVal('business-email', data.business?.email);
      setVal('business-phone', data.business?.phone);
      setVal('business-website', data.business?.website);
      setVal('business-tax-number', data.business?.taxNumber);

      // Restore client info
      setVal('client-name', data.client?.name);
      setVal('client-company', data.client?.company);
      setVal('client-email', data.client?.email);
      setVal('client-address', data.client?.address);
      setVal('client-phone', data.client?.phone);
      setVal('client-tax-number', data.client?.taxNumber);

      // Restore invoice details
      setVal('invoice-number', data.invoice?.number);
      setVal('invoice-date', data.invoice?.date);
      setVal('due-date', data.invoice?.dueDate);
      setVal('currency', data.invoice?.currency);
      setVal('payment-terms', data.invoice?.paymentTerms);

      // Restore work items
      if (data.items && data.items.length > 0) {
        const container = document.getElementById('work-items-list');
        if (container) container.innerHTML = '';
        workItemIdCounter = 0;
        data.items.forEach(item => {
          addWorkItem(item);
        });
      }

      // Restore discount
      if (data._meta?.discountEnabled) {
        discountEnabled = true;
        updateToggleUI('discount', true);
        setVal('discount-type', data.discount?.type);
        setVal('discount-value', data.discount?.value);
      }

      // Restore tax
      if (data._meta?.taxEnabled) {
        taxEnabled = true;
        updateToggleUI('tax', true);
        setVal('tax-rate', data.tax?.rate);
      }

      // Restore payment
      setVal('payment-method', data.payment?.method);
      setVal('payment-details', data.payment?.details);

      // Restore notes & terms
      setVal('invoice-notes', data.notes);
      setVal('invoice-terms', data.terms);

      updatePreview();
    } catch (e) {
      // Silently fail
    }
  }

  // ─── Utility Helpers ─────────────────────────────────────
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.value = value;
    }
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ─── Business Details Persistence ────────────────────────
  function saveBusinessDetails() {
    try {
      const bizData = {
        name: getVal('business-name'),
        address: getVal('business-address'),
        email: getVal('business-email'),
        phone: getVal('business-phone'),
        website: getVal('business-website'),
        taxNumber: getVal('business-tax-number')
      };

      if (!bizData.name && !bizData.email) {
        Validation.showToast('Please fill in at least your name or email.', 'warning');
        return;
      }

      localStorage.setItem('invoice-maker-business', JSON.stringify(bizData));
      Validation.showToast('Your details saved! They will auto-fill on future invoices.', 'success');
    } catch (e) {
      Validation.showToast('Could not save details.', 'error');
    }
  }

  function restoreBusinessDetails() {
    try {
      const saved = localStorage.getItem('invoice-maker-business');
      if (!saved) return;

      const biz = JSON.parse(saved);
      setVal('business-name', biz.name);
      setVal('business-address', biz.address);
      setVal('business-email', biz.email);
      setVal('business-phone', biz.phone);
      setVal('business-website', biz.website);
      setVal('business-tax-number', biz.taxNumber);
    } catch (e) {
      // Silently fail
    }
  }

  // ─── Saved Clients System ────────────────────────────────
  function getSavedClients() {
    try {
      const data = localStorage.getItem('invoice-maker-clients');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function setSavedClients(clients) {
    try {
      localStorage.setItem('invoice-maker-clients', JSON.stringify(clients));
    } catch (e) {
      // Silently fail
    }
  }

  function populateSavedClientsDropdown() {
    const select = document.getElementById('saved-client-select');
    if (!select) return;

    const clients = getSavedClients();
    const currentVal = select.value;

    // Clear existing options except the first one
    select.innerHTML = '<option value="">\u2014 New Client \u2014</option>';

    clients.forEach((client, index) => {
      const opt = document.createElement('option');
      opt.value = index.toString();
      const label = client.name || client.company || 'Unnamed Client';
      const sub = client.company && client.name ? ` (${client.company})` : '';
      opt.textContent = label + sub;
      select.appendChild(opt);
    });

    // Restore previous selection if it still exists
    if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
      select.value = currentVal;
    }

    updateDeleteBtnVisibility();
  }

  function saveCurrentClient() {
    const clientData = {
      name: getVal('client-name'),
      company: getVal('client-company'),
      email: getVal('client-email'),
      address: getVal('client-address'),
      phone: getVal('client-phone'),
      taxNumber: getVal('client-tax-number')
    };

    if (!clientData.name && !clientData.company) {
      Validation.showToast('Please fill in at least the client name or company.', 'warning');
      return;
    }

    const clients = getSavedClients();
    const select = document.getElementById('saved-client-select');
    const selectedIdx = select ? select.value : '';

    if (selectedIdx !== '') {
      // Update existing client
      const idx = parseInt(selectedIdx, 10);
      if (idx >= 0 && idx < clients.length) {
        clients[idx] = clientData;
        setSavedClients(clients);
        populateSavedClientsDropdown();
        select.value = selectedIdx;
        updateDeleteBtnVisibility();
        Validation.showToast('Client updated!', 'success');
        return;
      }
    }

    // Add new client
    clients.push(clientData);
    setSavedClients(clients);
    populateSavedClientsDropdown();
    // Select the newly added client
    if (select) select.value = (clients.length - 1).toString();
    updateDeleteBtnVisibility();
    Validation.showToast('Client saved!', 'success');
  }

  function loadSelectedClient() {
    const select = document.getElementById('saved-client-select');
    if (!select) return;

    updateDeleteBtnVisibility();

    const selectedIdx = select.value;
    if (selectedIdx === '') {
      // "New Client" selected — clear fields
      setVal('client-name', '');
      setVal('client-company', '');
      setVal('client-email', '');
      setVal('client-address', '');
      setVal('client-phone', '');
      setVal('client-tax-number', '');
      updatePreview();
      saveToLocalStorage();
      return;
    }

    const clients = getSavedClients();
    const idx = parseInt(selectedIdx, 10);
    if (idx >= 0 && idx < clients.length) {
      const c = clients[idx];
      setVal('client-name', c.name || '');
      setVal('client-company', c.company || '');
      setVal('client-email', c.email || '');
      setVal('client-address', c.address || '');
      setVal('client-phone', c.phone || '');
      setVal('client-tax-number', c.taxNumber || '');
      updatePreview();
      saveToLocalStorage();
    }
  }

  function deleteSelectedClient() {
    const select = document.getElementById('saved-client-select');
    if (!select || select.value === '') return;

    const clients = getSavedClients();
    const idx = parseInt(select.value, 10);
    const clientName = clients[idx]?.name || clients[idx]?.company || 'this client';

    showConfirmDialog(
      'Delete saved client?',
      `"${clientName}" will be removed from your saved clients.`,
      () => {
        clients.splice(idx, 1);
        setSavedClients(clients);
        populateSavedClientsDropdown();
        // Reset dropdown to "New Client"
        if (select) select.value = '';
        updateDeleteBtnVisibility();
        Validation.showToast('Client deleted.', 'success');
      }
    );
  }

  function updateDeleteBtnVisibility() {
    const select = document.getElementById('saved-client-select');
    const deleteBtn = document.getElementById('delete-client-btn');
    if (deleteBtn) {
      deleteBtn.style.display = (select && select.value !== '') ? 'inline-flex' : 'none';
    }
  }

  // ─── Public API ──────────────────────────────────────────
  return {
    init,
    updatePreview,
    collectFormData,
    addWorkItem,
    WORK_TYPES,
    UNITS,
    CURRENCIES,
    PAYMENT_METHODS,
    PAYMENT_TERMS
  };
})();

// ─── Start the app when DOM is ready ───────────────────────
document.addEventListener('DOMContentLoaded', App.init);
