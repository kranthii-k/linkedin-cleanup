/**
 * LinkedIn Ad Blocker - Content Script
 * Removes promoted posts from LinkedIn feeds
 */

// ============================================
// PART 1: Ad Detection & Removal
// ============================================

/**
 * Finds and hides all promoted posts on the page
 * 
 * WHY: This is our core functionality
 * WHAT:  Searches DOM for "Promoted" text and hides parent container
 */
function removeAds() {
  console.log('[Ad Blocker] Scanning for ads...');
  
  let adsRemoved = 0;
  
  // STEP 1: Find all potential promoted indicators
  // WHY: LinkedIn uses <span> elements to show "Promoted" label
  const spanElements = document.querySelectorAll(
    'span.feed-shared-actor__sub-description, ' +  // Main promoted label
    'span[aria-label*="Promoted"], ' +              // Accessibility label
    'span. feed-shared-text'                         // Alternative text container
  );
  
  console.log(`[Ad Blocker] Found ${spanElements.length} potential ad indicators`);
  
  // STEP 2: Check each element for "Promoted" text
  spanElements.forEach((element) => {
    // Get text content (visible text)
    const textContent = element.textContent?. trim().toLowerCase() || '';
    
    // Get aria-label (for screen readers - LinkedIn sometimes uses this)
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    
    // STEP 3: Is this actually an ad?
    const isPromoted = textContent.includes('promoted') || 
                       ariaLabel.includes('promoted');
    
    if (isPromoted) {
      // STEP 4: Find the parent post container
      // WHY: We don't want to hide just the "Promoted" label,
      //      we want to hide the ENTIRE post
      
      // Try multiple selectors because LinkedIn changes their HTML
      const postContainer = 
        element.closest('.feed-shared-update-v2') ||      // Current class
        element.closest('[data-urn]') ||                   // Posts have data-urn attribute
        element.closest('div.feed-shared-update-v2__content') || // Alternative
        element.closest('.feed-shared-update');            // Fallback for older versions
      
      if (postContainer) {
        // STEP 5: Hide the post
        // WHY: We use display: none instead of removing the element
        //      because it's safer and reversible
        postContainer.style.display = 'none';
        
        // Optional: Add a class for debugging
        postContainer.classList.add('linkedin-ad-blocked');
        
        adsRemoved++;
        console.log('[Ad Blocker] ✅ Blocked ad:', postContainer);
      } else {
        console.warn('[Ad Blocker] ⚠️ Found "Promoted" but couldn\'t find container:', element);
      }
    }
  });
  
  console.log(`[Ad Blocker] Removed ${adsRemoved} ads from this scan`);
}

// ============================================
// PART 2: Dynamic Content Monitoring
// ============================================

/**
 * Monitors the page for dynamically loaded content
 * 
 * WHY: LinkedIn loads posts as you scroll (infinite scroll)
 *      We need to catch new ads as they appear
 * 
 * WHAT: Uses MutationObserver API to watch for DOM changes
 */
function startObserver() {
  console.log('[Ad Blocker] Starting mutation observer...');
  
  // Create the observer
  // WHY: MutationObserver is better than setInterval because:
  //      - Only runs when the page actually changes
  //      - More efficient (doesn't waste CPU)
  //      - Event-driven instead of polling
  const observer = new MutationObserver((mutations) => {
    // DEBOUNCING: Prevent excessive function calls
    // WHY: When you scroll, LinkedIn adds MANY elements rapidly
    //      We don't want to run removeAds() 50 times per second
    
    if (window.adBlockerTimeout) {
      clearTimeout(window.adBlockerTimeout);
    }
    
    // Wait 300ms after the last change before scanning
    // WHY: LinkedIn might add multiple posts at once
    //      We wait for the "dust to settle" then scan once
    window.adBlockerTimeout = setTimeout(() => {
      removeAds();
    }, 300);
  });
  
  // STEP 2: Define what to observe
  // Find the main feed container
  const feedContainer = 
    document.querySelector('.scaffold-layout__main') || // Main content area
    document.querySelector('main') ||                    // Fallback
    document.body;                                       // Ultimate fallback
  
  if (feedContainer) {
    // STEP 3: Start observing
    observer.observe(feedContainer, {
      childList: true,   // Watch for added/removed elements
      subtree: true      // Watch all descendants, not just direct children
    });
    
    console.log('[Ad Blocker] ✅ Observer active on:', feedContainer);
  } else {
    console.error('[Ad Blocker] ❌ Could not find feed container! ');
  }
}

// ============================================
// PART 3: Initialization
// ============================================

/**
 * Initialize the ad blocker
 * 
 * WHY: We need to handle different page load states
 *      Sometimes the script runs before the page is ready
 */
function init() {
  console.log('[Ad Blocker] Initializing.. .');
  
  // STEP 1: Remove any ads already on the page
  removeAds();
  
  // STEP 2: Start monitoring for new ads
  if (document.readyState === 'loading') {
    // Page is still loading, wait for it
    // WHY: DOM might not be ready yet
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    // Page is already loaded, start immediately
    startObserver();
  }
  
  console.log('[Ad Blocker] ✅ Initialization complete');
}

// ============================================
// PART 4: Run the extension
// ============================================

// Start everything! 
init();

// Optional: Expose a manual trigger for debugging
// Usage: Open console and type:  window.removeLinkedInAds()
window.removeLinkedInAds = removeAds;