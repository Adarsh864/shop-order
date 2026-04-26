// app.js — shared navbar, toasts, utilities

async function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let shopName = 'Shop';
  try {
    const s = await fetch('/api/auth/session').then(r => r.json());
    if (s && s.shopName) shopName = s.shopName;
  } catch {}

  const current = window.location.pathname.split('/').pop();
  const links = [
    { href: 'dashboard.html',      label: 'Dashboard' },
    { href: 'inventory.html',      label: 'Inventory' },
    { href: 'purchase-order.html', label: 'Purchase Order' },
    { href: 'order-history.html',  label: 'Order History' },
    { href: 'suppliers.html',      label: 'Suppliers' },
    { href: 'settings.html',       label: 'Settings' },
  ];

  nav.innerHTML = `
    <div class="nav-brand">${shopName}</div>
    <button class="nav-toggle" id="navToggle">&#9776;</button>
    <ul class="nav-links" id="navLinks">
      ${links.map(l => `
        <li><a href="${l.href}" class="${current === l.href ? 'active' : ''}">${l.label}</a></li>
      `).join('')}
      <li><button class="btn btn-sm btn-danger" onclick="logout()">Logout</button></li>
    </ul>
  `;

  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

let LOW_STOCK_THRESHOLD = 4;

function getStatusLabel(item) {
  if (item.stock === 0) return { label: 'Out of stock', cls: 'badge-danger' };
  if (item.stock < LOW_STOCK_THRESHOLD) return { label: 'Low stock', cls: 'badge-warning' };
  return { label: 'In stock', cls: 'badge-success' };
}

function formatCurrency(val, cur) {
  return (cur || '₹') + Number(val).toFixed(2);
}

function confirmDialog(msg) { return window.confirm(msg); }

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
