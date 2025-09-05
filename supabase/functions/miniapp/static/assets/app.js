// Mini App JavaScript
(function() {
  'use strict';

  // Initialize Telegram WebApp
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    console.log('Telegram WebApp initialized');
  }

  // Get DOM elements
  const userNameEl = document.getElementById('userName');
  const themeEl = document.getElementById('theme');
  const miniUrlEl = document.getElementById('miniUrl');
  const statusEl = document.getElementById('status');
  const versionBtn = document.getElementById('btn-version');
  const verifyBtn = document.getElementById('btn-verify');

  // Update UI with Telegram data
  function updateUI() {
    if (tg) {
      // Update user info
      const user = tg.initDataUnsafe?.user;
      if (user) {
        userNameEl.textContent = user.first_name || user.username || 'Unknown';
      }

      // Update theme
      themeEl.textContent = tg.colorScheme || 'unknown';

      // Update mini app URL
      miniUrlEl.textContent = window.location.origin + '/miniapp/';
    }
  }

  // Status helper
  function setStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = 'muted';
    if (type === 'success') {
      statusEl.className = 'muted success';
    } else if (type === 'error') {
      statusEl.className = 'muted error';
    }
  }

  // Version check
  async function checkVersion() {
    try {
      versionBtn.disabled = true;
      versionBtn.textContent = 'Checking...';
      setStatus('Checking version...');

      const response = await fetch('/miniapp/version');
      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ Version check successful: ${data.name} at ${new Date(data.ts).toLocaleString()}`, 'success');
      } else {
        setStatus(`❌ Version check failed: ${response.status}`, 'error');
      }
    } catch (error) {
      setStatus(`❌ Version check error: ${error.message}`, 'error');
    } finally {
      versionBtn.disabled = false;
      versionBtn.textContent = 'Check /miniapp/version';
    }
  }

  // Verify initData
  async function verifyInitData() {
    try {
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';
      setStatus('Verifying initData...');

      const initData = tg?.initData || '';
      if (!initData) {
        setStatus('❌ No initData available (not in Telegram)', 'error');
        return;
      }

      const response = await fetch('/verify-initdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(`✅ InitData verification successful: User ${data.user?.id || 'unknown'}`, 'success');
      } else {
        const error = await response.text();
        setStatus(`❌ InitData verification failed: ${error}`, 'error');
      }
    } catch (error) {
      setStatus(`❌ Verification error: ${error.message}`, 'error');
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify initData';
    }
  }

  // Event listeners
  versionBtn.addEventListener('click', checkVersion);
  verifyBtn.addEventListener('click', verifyInitData);

  // Initialize
  updateUI();
  setStatus('Mini App loaded. Click buttons to test functionality.');

  console.log('Mini App JavaScript loaded');
})();