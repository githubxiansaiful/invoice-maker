/**
 * preview.js — Seamless Minimalist Invoice Preview Renderer
 * 
 * Clean, borderless, box-free minimalist document.
 * 100% inline styles for pixel-perfect PDF export via html2canvas/html2pdf.
 */

const Preview = {
  colors: {
    dark:        '#111827',  // Primary heading black/charcoal
    body:        '#374151',  // Main text
    muted:       '#6b7280',  // Muted text
    light:       '#9ca3af',  // Subtle text / labels
    borderDark:  '#111827',  // Strong divider lines
    borderLight: '#e5e7eb',  // Soft hairline dividers
    red:         '#dc2626',  // Discount text
    white:       '#ffffff'
  },

  /**
   * Update the live preview container.
   */
  update(data) {
    const container = document.getElementById('invoice-preview-content');
    if (!container) return;

    const currency = data.invoice.currency || 'EUR';
    const hasContent = data.business.name || data.client.name || data.client.company ||
      (data.items && data.items.some(i => i.description || i.rate > 0));

    if (!hasContent) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${this.colors.body}; line-height: 1.5; font-size: 13px; background: ${this.colors.white}; width: 100%; box-sizing: border-box;">
        ${this.renderHeader(data, currency)}
        ${this.renderClientSection(data)}
        ${this.renderItemsTable(data, currency)}
        ${this.renderTotals(data, currency)}
        ${this.renderFooterSections(data)}
        ${this.renderBottomFooter(data)}
      </div>
    `;
  },

  // ─── Empty state ───────────────────────────────────────────
  renderEmptyState() {
    const c = this.colors;
    return `
      <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 80px 20px; color: ${c.light}; background: ${c.white};">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${c.light}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <p style="font-size: 16px; font-weight: 600; color: ${c.dark}; margin: 0 0 4px 0;">Invoice Preview</p>
        <p style="font-size: 13px; color: ${c.muted}; margin: 0;">Fill in your details on the left panel to update this document.</p>
      </div>
    `;
  },

  // ─── Header: Business Info + Invoice Meta ──────────────────
  renderHeader(data, currency) {
    const b = data.business;
    const inv = data.invoice;
    const c = this.colors;

    // Sender details
    let bizHtml = '';
    if (b.name) {
      bizHtml += `<div style="font-size: 22px; font-weight: 800; color: ${c.dark}; letter-spacing: -0.02em; margin-bottom: 4px;">${this.esc(b.name)}</div>`;
    }
    if (b.address) {
      bizHtml += `<div style="font-size: 12px; color: ${c.muted}; margin-bottom: 2px;">${this.esc(b.address)}</div>`;
    }
    
    const contactParts = [];
    if (b.email) contactParts.push(this.esc(b.email));
    if (b.phone) contactParts.push(this.esc(b.phone));
    if (contactParts.length) {
      bizHtml += `<div style="font-size: 12px; color: ${c.muted}; margin-bottom: 2px;">${contactParts.join(' &nbsp;•&nbsp; ')}</div>`;
    }
    if (b.website) {
      bizHtml += `<div style="font-size: 12px; color: ${c.body}; font-weight: 500;">${this.esc(b.website)}</div>`;
    }
    if (b.taxNumber) {
      bizHtml += `<div style="font-size: 11px; color: ${c.light}; margin-top: 4px;">VAT / Tax ID: ${this.esc(b.taxNumber)}</div>`;
    }

    // Invoice meta rows
    let metaRows = '';
    if (inv.number) {
      metaRows += `
        <tr>
          <td style="font-size: 12px; color: ${c.muted}; padding: 2px 14px 2px 0; text-align: right; white-space: nowrap;">Invoice No:</td>
          <td style="font-size: 12px; font-weight: 700; color: ${c.dark}; padding: 2px 0; text-align: right; white-space: nowrap;">${this.esc(inv.number)}</td>
        </tr>`;
    }
    if (inv.date) {
      metaRows += `
        <tr>
          <td style="font-size: 12px; color: ${c.muted}; padding: 2px 14px 2px 0; text-align: right; white-space: nowrap;">Issue Date:</td>
          <td style="font-size: 12px; font-weight: 600; color: ${c.body}; padding: 2px 0; text-align: right; white-space: nowrap;">${this.formatDate(inv.date)}</td>
        </tr>`;
    }
    if (inv.dueDate) {
      metaRows += `
        <tr>
          <td style="font-size: 12px; color: ${c.muted}; padding: 2px 14px 2px 0; text-align: right; white-space: nowrap;">Due Date:</td>
          <td style="font-size: 12px; font-weight: 600; color: ${c.dark}; padding: 2px 0; text-align: right; white-space: nowrap;">${this.formatDate(inv.dueDate)}</td>
        </tr>`;
    }
    if (inv.paymentTerms && inv.paymentTerms !== 'Due on receipt') {
      metaRows += `
        <tr>
          <td style="font-size: 12px; color: ${c.muted}; padding: 2px 14px 2px 0; text-align: right; white-space: nowrap;">Terms:</td>
          <td style="font-size: 12px; font-weight: 600; color: ${c.body}; padding: 2px 0; text-align: right; white-space: nowrap;">${this.esc(inv.paymentTerms)}</td>
        </tr>`;
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid ${c.borderLight}; margin-bottom: 24px;">
        <div style="flex: 1; padding-right: 16px;">
          ${bizHtml}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 28px; font-weight: 900; color: ${c.dark}; letter-spacing: 0.04em; margin-bottom: 8px; text-transform: uppercase;">INVOICE</div>
          <table style="border-collapse: collapse; margin-left: auto;">
            ${metaRows}
          </table>
        </div>
      </div>
    `;
  },

  // ─── Client Details (Billed To) ────────────────────────────
  renderClientSection(data) {
    const cl = data.client;
    const c = this.colors;

    if (!cl.name && !cl.company && !cl.email && !cl.address) return '';

    let clientHtml = '';
    if (cl.name) {
      clientHtml += `<div style="font-size: 14px; font-weight: 700; color: ${c.dark}; margin-bottom: 2px;">${this.esc(cl.name)}</div>`;
    }
    if (cl.company) {
      clientHtml += `<div style="font-size: 13px; font-weight: 500; color: ${c.body}; margin-bottom: 2px;">${this.esc(cl.company)}</div>`;
    }
    if (cl.address) {
      clientHtml += `<div style="font-size: 12px; color: ${c.muted}; margin-bottom: 2px;">${this.esc(cl.address)}</div>`;
    }
    if (cl.email) {
      clientHtml += `<div style="font-size: 12px; color: ${c.muted}; margin-bottom: 2px;">${this.esc(cl.email)}</div>`;
    }
    if (cl.phone) {
      clientHtml += `<div style="font-size: 12px; color: ${c.muted}; margin-bottom: 2px;">${this.esc(cl.phone)}</div>`;
    }
    if (cl.taxNumber) {
      clientHtml += `<div style="font-size: 11px; color: ${c.light}; margin-top: 4px;">VAT: ${this.esc(cl.taxNumber)}</div>`;
    }

    return `
      <div style="margin-bottom: 28px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${c.light}; margin-bottom: 6px;">
          BILLED TO
        </div>
        ${clientHtml}
      </div>
    `;
  },

  // ─── Items Table ───────────────────────────────────────────
  renderItemsTable(data, currency) {
    const items = (data.items || []).filter(i => i.description || i.rate > 0);
    if (!items.length) return '';
    const c = this.colors;

    let rowsHtml = '';
    items.forEach((item) => {
      const desc = this.esc(item.description || '');
      const typeLabel = item.workType && item.workType !== 'Other'
        ? `<span style="display: inline-block; font-size: 11px; color: ${c.muted}; margin-top: 2px;">(${this.esc(item.workType)})</span>`
        : '';
      const qty = item.quantity || 0;
      const rate = item.rate || 0;
      const amount = item.amount || (qty * rate);

      rowsHtml += `
        <tr>
          <td style="padding: 10px 10px 10px 0; border-bottom: 1px solid ${c.borderLight}; vertical-align: top;">
            <span style="font-size: 13px; font-weight: 600; color: ${c.dark};">${desc}</span>
            ${typeLabel ? `<br>${typeLabel}` : ''}
          </td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 500; color: ${c.body}; text-align: center; border-bottom: 1px solid ${c.borderLight}; vertical-align: top; white-space: nowrap;">${qty}</td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 500; color: ${c.body}; text-align: right; border-bottom: 1px solid ${c.borderLight}; vertical-align: top; white-space: nowrap;">${Calculations.formatCurrency(rate, currency)}</td>
          <td style="padding: 10px 0 10px 8px; font-size: 13px; font-weight: 700; color: ${c.dark}; text-align: right; border-bottom: 1px solid ${c.borderLight}; vertical-align: top; white-space: nowrap;">${Calculations.formatCurrency(amount, currency)}</td>
        </tr>
      `;
    });

    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-top: 2px solid ${c.borderDark}; border-bottom: 1px solid ${c.borderDark};">
            <th style="padding: 8px 10px 8px 0; font-size: 10px; font-weight: 700; color: ${c.dark}; text-align: left; text-transform: uppercase; letter-spacing: 0.06em;">Description</th>
            <th style="padding: 8px 8px; font-size: 10px; font-weight: 700; color: ${c.dark}; text-align: center; text-transform: uppercase; letter-spacing: 0.06em; width: 50px;">Qty</th>
            <th style="padding: 8px 8px; font-size: 10px; font-weight: 700; color: ${c.dark}; text-align: right; text-transform: uppercase; letter-spacing: 0.06em; width: 100px;">Rate</th>
            <th style="padding: 8px 0 8px 8px; font-size: 10px; font-weight: 700; color: ${c.dark}; text-align: right; text-transform: uppercase; letter-spacing: 0.06em; width: 110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  },

  // ─── Totals ────────────────────────────────────────────────
  renderTotals(data, currency) {
    const t = data.totals;
    if (!t) return '';
    const c = this.colors;

    let subRows = '';

    // Subtotal
    subRows += `
      <tr>
        <td style="padding: 4px 12px 4px 0; font-size: 12px; color: ${c.muted}; text-align: left;">Subtotal</td>
        <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${c.dark}; text-align: right;">${Calculations.formatCurrency(t.subtotal, currency)}</td>
      </tr>
    `;

    // Discount
    if (data.discount.enabled && t.discountAmount > 0) {
      const label = data.discount.type === 'percentage'
        ? `Discount (${data.discount.value}%)`
        : 'Discount';
      subRows += `
        <tr>
          <td style="padding: 4px 12px 4px 0; font-size: 12px; color: ${c.muted}; text-align: left;">${label}</td>
          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${c.red}; text-align: right;">−${Calculations.formatCurrency(t.discountAmount, currency)}</td>
        </tr>
      `;
    }

    // Tax / VAT
    if (data.tax.enabled && data.tax.rate > 0) {
      subRows += `
        <tr>
          <td style="padding: 4px 12px 4px 0; font-size: 12px; color: ${c.muted}; text-align: left;">VAT (${data.tax.rate}%)</td>
          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${c.dark}; text-align: right;">${Calculations.formatCurrency(t.taxAmount, currency)}</td>
        </tr>
      `;
    }

    // Grand Total Row
    subRows += `
      <tr style="border-top: 2px solid ${c.borderDark};">
        <td style="padding: 8px 12px 8px 0; font-size: 14px; font-weight: 700; color: ${c.dark}; text-align: left; text-transform: uppercase; letter-spacing: 0.03em;">Total Due</td>
        <td style="padding: 8px 0; font-size: 18px; font-weight: 800; color: ${c.dark}; text-align: right;">${Calculations.formatCurrency(t.total, currency)}</td>
      </tr>
    `;

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 28px; page-break-inside: avoid;">
        <table style="width: 260px; border-collapse: collapse;">
          ${subRows}
        </table>
      </div>
    `;
  },

  // ─── Footer Sections ───────────────────────────────────────
  renderFooterSections(data) {
    const c = this.colors;
    let blocks = [];

    // Payment Info
    const p = data.payment;
    if (p.method || p.details) {
      let payContent = '';
      if (p.method) {
        payContent += `<div style="font-size: 12px; font-weight: 600; color: ${c.dark}; margin-bottom: 3px;">Method: ${this.esc(p.method)}</div>`;
      }
      if (p.details) {
        payContent += `<div style="font-size: 12px; color: ${c.body}; line-height: 1.5; white-space: pre-wrap;">${this.esc(p.details)}</div>`;
      }
      
      blocks.push(`
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${c.light}; margin-bottom: 4px;">PAYMENT INFORMATION</div>
          ${payContent}
        </div>
      `);
    }

    // Notes
    if (data.notes) {
      blocks.push(`
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${c.light}; margin-bottom: 4px;">NOTES</div>
          <div style="font-size: 12px; color: ${c.body}; line-height: 1.5; white-space: pre-wrap;">${this.esc(data.notes)}</div>
        </div>
      `);
    }

    // Terms & Conditions
    if (data.terms) {
      blocks.push(`
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${c.light}; margin-bottom: 4px;">TERMS & CONDITIONS</div>
          <div style="font-size: 11px; color: ${c.muted}; line-height: 1.5; white-space: pre-wrap;">${this.esc(data.terms)}</div>
        </div>
      `);
    }

    if (!blocks.length) return '';

    return `
      <div style="border-top: 1px solid ${c.borderLight}; padding-top: 20px;">
        ${blocks.join('')}
      </div>
    `;
  },

  // ─── Bottom Footer ─────────────────────────────────────────
  renderBottomFooter(data) {
    const c = this.colors;
    return `
      <div style="margin-top: 24px; text-align: center; page-break-inside: avoid;">
        <span style="font-size: 11px; font-weight: 500; color: ${c.light};">Thank you for your business!</span>
      </div>
    `;
  },

  // ─── Helpers ───────────────────────────────────────────────
  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  },

  esc(str) {
    if (!str && str !== 0) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
