// Chess.com Auto-Next Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const delayInput = document.getElementById('delayInput');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load current settings
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    enableToggle.checked = result.enabled !== undefined ? result.enabled : true;
    delayInput.value = result.delay !== undefined ? result.delay : 800;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const enabled = enableToggle.checked;
    const delay = parseInt(delayInput.value, 10);

    // Validate delay
    if (isNaN(delay) || delay < 0) {
      showStatus('Please enter a valid delay value', false);
      return;
    }

    // Save to storage
    chrome.storage.sync.set({ enabled, delay }, () => {
      showStatus('Settings saved!', true);
    });
  });

  // Show status message
  function showStatus(message, isSuccess) {
    status.textContent = message;
    status.className = 'status show' + (isSuccess ? ' success' : '');
    
    setTimeout(() => {
      status.classList.remove('show');
    }, 2000);
  }

  // Allow Enter key to save
  delayInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });
});
