# 🧾 Invoice Maker — Fast & Free Invoice Generator for Freelancers

[![Live Demo](https://img.shields.io/badge/Live_Demo-quickinvoice--maker.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://quickinvoice-maker.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla_Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A clean, modern, zero-backend invoice generator tailored for freelance developers, designers, and contractors. Create professional, minimalist invoices with live real-time preview and export pixel-perfect, uncropped A4 PDFs in one click.

🔗 **Live Application**: [quickinvoice-maker.vercel.app](https://quickinvoice-maker.vercel.app)

---

## 🌟 Key Features

- **⚡ Real-Time Live Preview**: See your invoice update instantly as you type with calculated totals, formatted currencies, and structured layout.
- **📄 Pixel-Perfect A4 PDF Export**: Downloads clean, uncropped, single or multi-page A4 PDFs powered by `html2pdf.js` with zero blank-page glitches.
- **📱 100% Fully Responsive on All Devices**:
  - **Desktop / Laptop (> 900px)**: Side-by-side split screen with independent scrolling for form and live document.
  - **Tablet & Mobile (≤ 900px)**: Seamless segmented tab switcher (`Edit Form` ↔ `Live Preview`) with quick view buttons and total amount badges.
  - **Small Phones (320px - 480px)**: Touch-optimized controls, auto-zoom prevention for iOS Safari, and responsive tables.
- **💾 100% Client-Side Privacy**: All business info, saved client profiles, and active invoice drafts are stored strictly in your browser's `localStorage`. No account, no login, and no backend data collection.
- **👥 Client Management System**: Save recurring clients, switch between them from a dropdown, update details, or delete saved profiles with one click.
- **💼 Business Profile Auto-Save**: Save your sender info (name, address, tax ID, email, website) once and auto-populate future invoices automatically.
- **🔢 Flexible Work Items**: Add unlimited line items with customizable work types (*Web Dev, UI/UX, Bug Fix, Maintenance, API, Consultation*), quantity, rate, and units (*Fixed Price, Hour, Day, Task, Project*).
- **🏷️ Discount & Tax Calculation Engine**: Toggle fixed amount or percentage discounts, and apply customizable VAT / Tax rates calculated after discounts.
- **🌍 Multi-Currency Formatting**: Full support for `EUR (€)`, `USD ($)`, `GBP (£)`, and `BDT (৳)` with localized number formatting.
- **🖨️ Native Print Ready**: Integrated print stylesheet (`@media print`) hides editor tools and prints the invoice directly to standard A4 paper.

---

## 📸 Screenshots & Layout

### Desktop Split View
> Clean two-column workspace with editable form on the left and live document preview on the right.

### Mobile & Tablet Experience
> Smart segmented navigation bar allowing users to effortlessly switch between form editing and document preview without infinite scrolling.

---

## 🏗️ Project Architecture & File Structure

```text
invoice-maker/
├── index.html              # Core HTML5 layout, form sections, and preview container
├── css/
│   └── style.css           # Vanilla CSS design system, responsive breakpoints, and print styles
├── js/
│   ├── app.js              # Application controller, state management, and event orchestration
│   ├── calculations.js     # Mathematical engine (subtotals, discounts, tax, currency format)
│   ├── validation.js       # Form validation logic, inline feedback, and toast notifications
│   ├── preview.js          # Minimalist document preview renderer
│   └── pdf.js              # A4 PDF exporter using off-screen DOM cloning & html2pdf.js
└── README.md               # Project documentation
```

### Module Responsibilities

| Module | Description |
| :--- | :--- |
| `app.js` | Manages form state, work item DOM additions/deletions, client persistence in `localStorage`, and mobile tab switching. |
| `calculations.js` | Pure mathematical utility functions for item amounts, subtotal, discount, tax, total, and localized currency formatting. |
| `validation.js` | Validates required fields before PDF generation and handles animated toast alerts and field error states. |
| `preview.js` | Generates a clean, borderless document preview with responsive container classes and inline styles for PDF fidelity. |
| `pdf.js` | Creates an off-screen clone with `.is-pdf-clone` to render lossless 740px A4 documents with `html2canvas` + `jsPDF`. |

---

## 🚀 Getting Started (Run Locally)

Since **Invoice Maker** is built entirely with standard web technologies (HTML, CSS, and modern JavaScript), there are **no build steps or node dependencies** required to run it.

### Option 1: Double-Click or Open File
Clone the repository and open `index.html` directly in any web browser:
```bash
git clone https://github.com/xiansaiful/invoice-maker.git
cd invoice-maker
# Open index.html in your default browser
```

### Option 2: Run with a Local Development Server

#### Using VS Code:
Install the **Live Server** extension, right-click `index.html`, and choose **"Open with Live Server"**.

#### Using Node.js (`npx serve`):
```bash
npx serve .
```

#### Using Python:
```bash
# Python 3
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.

---

## 📱 Responsive Breakpoints & Device Support

The layout has been meticulously engineered and tested across various screen sizes and resolutions:

| Device Category | Viewport Width | Layout Behavior |
| :--- | :--- | :--- |
| **Large Desktop / 4K** | `> 1280px` | 2-column split view (44% editor / 56% preview), 5-column work items grid. |
| **Laptops & Tablets Landscape** | `901px - 1280px` | 2-column split view with symmetric 2-column work items grid. |
| **Tablets Portrait** | `641px - 900px` | Segmented mobile tab bar (`Edit Form` / `Live Preview`), full-width panels. |
| **Mobile Phones** | `381px - 640px` | Compact header with shortened action labels, iOS font-size zoom prevention, responsive horizontal table scroll, full-width toast banners. |
| **Ultra-Narrow Devices** | `≤ 380px` | Ultra-compact header padding, stacked action modals, tight spacing scales. |

---

## 🛡️ Privacy & Data Security

- **Zero Data Collection**: No cookies, analytics trackers, or remote telemetry.
- **Local Storage Only**: Your personal details and saved client list never leave your machine.
- **Offline Capable**: Once loaded, invoices can be generated completely offline.

---

## 🤝 Contributing

Contributions, feedback, and feature suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

Crafted with care by [Xian Saiful](https://github.com/xiansaiful). Live at [quickinvoice-maker.vercel.app](https://quickinvoice-maker.vercel.app).
