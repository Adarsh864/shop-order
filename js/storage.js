// storage.js — async API client (replaces localStorage)

async function _api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch('/api' + path, opts);
  if (res.status === 401) { window.location.href = 'index.html'; return null; }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Session
async function getSession()       { return _api('GET',  '/auth/session'); }
async function clearSession()     { return _api('POST', '/auth/logout'); }

// Settings
async function getSettings()      { return _api('GET',  '/settings'); }
async function saveSettings(data) { return _api('POST', '/settings', data); }

// Items
async function getItems()              { return _api('GET',    '/items'); }
async function addItem(data)           { return _api('POST',   '/items', data); }
async function updateItem(id, data)    { return _api('PUT',    '/items/' + id, data); }
async function deleteItem(id)          { return _api('DELETE', '/items/' + id); }
async function getLowStockItems()      { return _api('GET',    '/items/low-stock'); }

// Suppliers
async function getSuppliers()          { return _api('GET',    '/suppliers'); }
async function addSupplier(data)       { return _api('POST',   '/suppliers', data); }
async function updateSupplier(id, data){ return _api('PUT',    '/suppliers/' + id, data); }
async function deleteSupplier(id)      { return _api('DELETE', '/suppliers/' + id); }

// Orders
async function getOrders()             { return _api('GET',    '/orders'); }
async function addOrder(data)          { return _api('POST',   '/orders', data); }
async function updateOrderStatus(id, status) { return _api('PUT', '/orders/' + id + '/status', { status }); }
async function deleteOrder(id)         { return _api('DELETE', '/orders/' + id); }
