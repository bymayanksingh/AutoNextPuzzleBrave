// Chess.com Auto-Next Content Script
(function() {
  // Only run on puzzle pages
  const allowedPaths = ['/puzzles', '/puzzles/rated'];
  const currentPath = window.location.pathname;
  if (!allowedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'))) {
    return; // Exit if not on a puzzle page
  }

  let settings = { enabled: true, delay: 5 };
  let hasClicked = false;
  let toggleButton = null;

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'delay'], (result) => {
    settings.enabled = result.enabled !== undefined ? result.enabled : true;
    settings.delay = result.delay !== undefined ? result.delay : 5;
    updateToggleButton();
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.delay) settings.delay = changes.delay.newValue;
    updateToggleButton();
  });

  // Create toggle next to settings icon in bottom right
  function injectToggleIntoSettings() {
    if (document.getElementById('chess-auto-next-toggle')) return;

    // Find settings icon/button in bottom right
    function findSettingsButton() {
      // Look for buttons in bottom right area
      const allButtons = Array.from(document.querySelectorAll('button, [role="button"], a[class*="button"]'));
      
      // Filter for buttons that might be settings (gear icon, settings icon, etc.)
      const potentialSettings = allButtons.filter(btn => {
        if (!btn.offsetParent) return false;
        
        const rect = btn.getBoundingClientRect();
        const isBottomRight = rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 200;
        
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        const text = btn.textContent.toLowerCase();
        const hasIcon = btn.querySelector('svg, i, [class*="icon"]');
        const className = (btn.className || '').toLowerCase();
        
        return isBottomRight && (
          ariaLabel.includes('setting') || 
          ariaLabel.includes('gear') || 
          ariaLabel.includes('preference') ||
          text.includes('setting') ||
          className.includes('setting') ||
          className.includes('gear') ||
          (hasIcon && (className.includes('icon') || className.includes('cog')))
        );
      });

      // Return the rightmost button that's near the bottom
      if (potentialSettings.length > 0) {
        return potentialSettings.sort((a, b) => {
          const aRect = a.getBoundingClientRect();
          const bRect = b.getBoundingClientRect();
          return bRect.right - aRect.right; // Rightmost first
        })[0];
      }

      // Fallback: find any button in bottom right corner
      const bottomRightButtons = allButtons.filter(btn => {
        if (!btn.offsetParent) return false;
        const rect = btn.getBoundingClientRect();
        return rect.bottom > window.innerHeight - 150 && rect.right > window.innerWidth - 300;
      });

      if (bottomRightButtons.length > 0) {
        return bottomRightButtons.sort((a, b) => {
          const aRect = a.getBoundingClientRect();
          const bRect = b.getBoundingClientRect();
          return bRect.right - aRect.right;
        })[0];
      }

      return null;
    }

    const settingsBtn = findSettingsButton();
    let bottomPosition = '28px';
    let rightPosition = '260px';

    // Calculate positions relative to viewport size for consistency across devices
    if (settingsBtn) {
      const rect = settingsBtn.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate as percentage of viewport for true relative positioning
      const bottomEdge = viewportHeight - rect.bottom;
      const bottomPercent = ((bottomEdge + 8) / viewportHeight) * 100;
      bottomPosition = `${bottomPercent}vh`;
      
      // Calculate right position as percentage of viewport width
      const rightEdge = viewportWidth - rect.right;
      const rightPercent = ((rightEdge + 240) / viewportWidth) * 100;
      rightPosition = `${rightPercent}vw`;
    } else {
      // Fallback: use viewport-relative units
      const viewportWidth = window.innerWidth;
      const rightPercent = (260 / viewportWidth) * 100;
      rightPosition = `${rightPercent}vw`;
      bottomPosition = '2vh'; // Approximately 28px on a 1400px height screen
    }

    // Create container row with Flexbox
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'chess-auto-next-toggle';
    
    toggleContainer.style.cssText = `
      position: fixed;
      right: ${rightPosition};
      bottom: ${bottomPosition};
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      background: transparent;
      pointer-events: auto;
    `;

    toggleContainer.innerHTML = `
      <span style="font-size: 12px; color: #666; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">Auto-Next</span>
      <label class="toggle-container" style="position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; flex-shrink: 0;">
        <input type="checkbox" ${settings.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0; position: absolute;">
        <span class="toggle-slider" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${settings.enabled ? '#81b64c' : '#ccc'}; border-radius: 22px; transition: background-color 0.3s;">
          <span class="toggle-circle" style="position: absolute; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: transform 0.3s; transform: translateX(${settings.enabled ? '18px' : '0'}); box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></span>
        </span>
      </label>
    `;

    const checkbox = toggleContainer.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      settings.enabled = e.target.checked;
      chrome.storage.sync.set({ enabled: settings.enabled }, () => {
        updateToggleState();
      });
    });

    document.body.appendChild(toggleContainer);
    toggleButton = toggleContainer;

    // Update position on window resize and scroll using viewport-relative units
    const updatePosition = () => {
      if (toggleContainer && settingsBtn && settingsBtn.offsetParent) {
        const newRect = settingsBtn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate as percentage of viewport for consistency
        const rightEdge = viewportWidth - newRect.right;
        const rightPercent = ((rightEdge + 240) / viewportWidth) * 100;
        toggleContainer.style.right = `${rightPercent}vw`;
        
        const bottomEdge = viewportHeight - newRect.bottom;
        const bottomPercent = ((bottomEdge + 8) / viewportHeight) * 100;
        toggleContainer.style.bottom = `${bottomPercent}vh`;
      }
    };
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  }

  // Update toggle state
  function updateToggleState() {
    if (!toggleButton) return;
    const checkbox = toggleButton.querySelector('input[type="checkbox"]');
    const slider = toggleButton.querySelector('.toggle-slider');
    const sliderCircle = toggleButton.querySelector('.toggle-circle');
    
    if (checkbox) checkbox.checked = settings.enabled;
    if (slider) {
      slider.style.backgroundColor = settings.enabled ? '#81b64c' : '#ccc';
    }
    if (sliderCircle) {
      sliderCircle.style.transform = `translateX(${settings.enabled ? '18px' : '0'})`;
    }
  }

  // Update toggle button appearance (legacy function name)
  function updateToggleButton() {
    updateToggleState();
  }

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

  // Watch for settings menus to appear and inject toggle
  const settingsObserver = new MutationObserver(() => {
    if (!document.getElementById('chess-auto-next-toggle')) {
      injectToggleIntoSettings();
    }
  });


  // Start observing for settings button to appear
  if (document.body) {
    // Try initial injection with multiple attempts
    const tryInject = () => {
      if (!document.getElementById('chess-auto-next-toggle')) {
        injectToggleIntoSettings();
      }
    };
    
    setTimeout(tryInject, 500);
    setTimeout(tryInject, 1500);
    setTimeout(tryInject, 3000);
    
    // Watch for dynamically added buttons
    settingsObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        setTimeout(() => {
          if (!document.getElementById('chess-auto-next-toggle')) {
            injectToggleIntoSettings();
          }
        }, 500);
        settingsObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
        bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document.documentElement, { childList: true });
  }

  console.log('Chess.com Auto-Next extension loaded');
})();
