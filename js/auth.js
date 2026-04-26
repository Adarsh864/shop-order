// auth.js — server-session auth

async function requireLogin() {
  try {
    const session = await fetch('/api/auth/session').then(r => r.json());
    if (!session || !session.loggedIn) { window.location.href = 'index.html'; return false; }
    return true;
  } catch {
    window.location.href = 'index.html';
    return false;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'index.html';
}
