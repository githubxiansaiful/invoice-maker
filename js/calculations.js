// calculations.js - Invoice calculation engine

const Calculations = {
  // Calculate a single line item amount
  calculateItemAmount(quantity, rate) {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return q * r;
  },
  
  // Calculate subtotal from all items
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + this.calculateItemAmount(item.quantity, item.rate), 0);
  },
  
  // Calculate discount amount
  // discountType: 'percentage' or 'fixed'
  calculateDiscount(subtotal, discountValue, discountType) {
    const value = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return subtotal * (value / 100);
    }
    return value; // fixed discount
  },
  
  // Calculate tax amount
  calculateTax(amountAfterDiscount, taxRate) {
    const rate = parseFloat(taxRate) || 0;
    return amountAfterDiscount * (rate / 100);
  },
  
  // Calculate grand total
  calculateTotal(subtotal, discountAmount, taxAmount) {
    return subtotal - discountAmount + taxAmount;
  },
  
  // Format currency
  formatCurrency(amount, currencyCode) {
    const numAmount = parseFloat(amount) || 0;
    
    const formatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    try {
      // Determine locale based on currency to get proper formatting
      let locale = 'en-US';
      if (currencyCode === 'EUR') locale = 'de-DE';
      else if (currencyCode === 'GBP') locale = 'en-GB';
      else if (currencyCode === 'BDT') locale = 'en-IN'; // closest to BDT formatting for thousands

      return new Intl.NumberFormat(locale, formatOptions).format(numAmount);
    } catch (e) {
      // Fallback
      const symbol = this.getCurrencySymbol(currencyCode);
      return `${symbol}${numAmount.toFixed(2)}`;
    }
  },
  
  // Get currency symbol
  getCurrencySymbol(currencyCode) {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'BDT': '৳'
    };
    return symbols[currencyCode] || currencyCode;
  },
  
  // Generate invoice number
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number (100-999)
    return `INV-${year}-${randomNum}`;
  }
};
