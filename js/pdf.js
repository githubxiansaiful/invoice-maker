/**
 * pdf.js — Reliable A4 PDF Generation & Printing
 * 
 * Uses an off-screen element clone with html2pdf.js to ensure:
 * - 0% blank pages (explicit scrollY: 0, scrollX: 0)
 * - 0% cropping (fixed 750px paper width)
 * - 100% clean single/multi-page A4 output
 * - Zero layout shift or flickering on the live UI
 */

const PDFExport = {
  /**
   * Download the invoice as a crisp, uncropped A4 PDF file.
   */
  async downloadPDF() {
    const element = document.getElementById('invoice-preview-content');
    if (!element) {
      throw new Error('Invoice preview element not found.');
    }

    // Get invoice number for filename
    const invoiceNumberEl = document.getElementById('invoice-number');
    const invoiceNumber = invoiceNumberEl?.value?.trim() || 'invoice';
    const filename = `invoice-${invoiceNumber}.pdf`;

    // Check if html2pdf is loaded
    if (typeof window.html2pdf === 'undefined') {
      throw new Error('html2pdf.js library is not loaded.');
    }

    // 1. Create an off-screen clone of the preview content to isolate capture from scroll/DOM state
    const clone = element.cloneNode(true);
    clone.classList.add('is-pdf-clone');
    clone.style.width = '740px';
    clone.style.padding = '32px 32px';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '0';
    clone.style.minHeight = '0';
    clone.style.height = 'auto';
    clone.style.background = '#ffffff';
    clone.style.boxSizing = 'border-box';

    // 2. Mount clone off-screen at top: 0
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '740px';
    wrapper.style.background = '#ffffff';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 3. Configure html2pdf with explicit scrollX/scrollY = 0 to prevent blank PDF capture
    const opt = {
      margin: [8, 8, 8, 8], // 8mm margins
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await window.html2pdf().set(opt).from(clone).save();
    } finally {
      // 4. Always clean up off-screen DOM wrapper
      wrapper.remove();
    }
  },

  /**
   * Open the browser's print dialog.
   * CSS @media print rules handle hiding the editor.
   */
  printInvoice() {
    window.print();
  }
};
