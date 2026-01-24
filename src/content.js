// Chess.com Auto-Next Content Script
(function() {
  let settings = { enabled: true, delay: 800 };
  let hasClicked = false;

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.delay = result.delay !== undefined ? result.delay : 800;
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.delay) settings.delay = changes.delay.newValue;
  });

  // Function to find and click the Next/Continue button
  function clickNextButton() {
    if (!settings.enabled || hasClicked) return;

    // Common selectors for Chess.com puzzle buttons
    const selectors = [
      'button[aria-label="Next"]',
      'button[aria-label="Continue"]',
      'a[aria-label="Next"]',
      'a[aria-label="Continue"]',
      '.puzzle-next-button',
      '[data-cy="next-puzzle"]'
    ];

    let button = null;

    // Try standard querySelector with valid selectors
    for (const selector of selectors) {
      try {
        button = document.querySelector(selector);
        if (button && button.offsetParent !== null) {
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Fallback: search by text content and aria-label (case-insensitive)
    if (!button || button.offsetParent === null) {
      const buttons = document.querySelectorAll('button, a[role="button"], a.button');
      button = Array.from(buttons).find(btn => {
        const text = btn.textContent.trim().toLowerCase();
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        const className = (btn.className || '').toLowerCase();
        
        // Check for "next" or "continue" in text or aria-label
        const hasNext = text.includes('next') || ariaLabel.includes('next');
        const hasContinue = (text.includes('continue') && !text.includes('continue solving')) || 
                           (ariaLabel.includes('continue') && !ariaLabel.includes('continue solving'));
        const hasNextClass = className.includes('next');
        
        return (hasNext || hasContinue || hasNextClass) && btn.offsetParent !== null;
      });
    }

    if (button && button.offsetParent !== null) {
      hasClicked = true;
      console.log('Chess.com Auto-Next: Clicking button after', settings.delay, 'ms');
      
      setTimeout(() => {
        button.click();
        // Reset after a delay to allow for next puzzle
        setTimeout(() => { hasClicked = false; }, 2000);
      }, settings.delay);
      
      return true;
    }
    
    return false;
  }

  // Watch for puzzle completion indicators
  const observer = new MutationObserver((mutations) => {
    // Look for success/completion messages or result screens
    const indicators = [
      '.puzzle-complete',
      '.puzzle-success',
      '[class*="result"]',
      '[class*="success"]',
      '[class*="complete"]',
      'button[aria-label="Next"]'
    ];

    for (const indicator of indicators) {
      if (document.querySelector(indicator)) {
        clickNextButton();
        break;
      }
    }

    // Check if any mutation added a "Next" button
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('next') || text.includes('continue')) {
              clickNextButton();
            }
          }
        });
      }
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });

  console.log('Chess.com Auto-Next extension loaded');
})();
