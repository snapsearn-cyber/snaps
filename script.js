// Fit-to-screen fallback for older phones without CSS dvh support:
// size the page from the real visible height instead of 100vh.
if (!(window.CSS && CSS.supports('height', '1dvh'))) {
  const setVh = () => {
    // Don't shrink the page while the on-screen keyboard is open.
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);
}

// Password show/hide toggle
const eyeBtn = document.querySelector('.eye-btn');
const pwd = document.getElementById('password');

eyeBtn.addEventListener('click', () => {
  const showing = pwd.type === 'text';
  pwd.type = showing ? 'password' : 'text';
  eyeBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

// Enable "Log In" only when both fields have input
const username = document.getElementById('username');
const loginBtn = document.querySelector('.login-btn');

function refreshLoginState() {
  loginBtn.disabled = !(username.value.trim() && pwd.value.trim());
}

username.addEventListener('input', refreshLoginState);
pwd.addEventListener('input', refreshLoginState);

// Submit: perform a real login against our own backend.
// The password is sent over HTTPS to /api/auth/login, where the server
// bcrypt-compares it against the stored hash. It is never stored in
// plaintext and never forwarded anywhere else. The admin Telegram ping
// (email only) is sent by the SERVER after it verifies the login.
// Where the backend lives. Always talk to Railway — whether the page is
// opened via Live Server, hosted on Netlify, or served by Railway itself.
// Replace the Railway URL below with YOUR deployment's URL (no trailing slash).
const RAILWAY_API = 'https://snaps-production-caba.up.railway.app';
const API_BASE = RAILWAY_API;
const loginForm = document.querySelector('.login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const identifier = username.value.trim();
  const password = pwd.value;
  if (!identifier || !password) return;

  // Just send the request — the button is left untouched.
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // receive the httpOnly session cookie
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.warn('Login failed:', data.error || res.status);
      return;
    }

    // Logged in — the session cookie is set.
    // window.location.assign('/home'); // ← point this at your post-login page
  } catch (err) {
    console.error('Login request failed:', err);
  }
});
