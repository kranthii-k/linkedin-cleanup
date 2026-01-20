/**
 * LinkedIn Ad Blocker - Content Script (Enhanced)
 * Removes promoted posts from LinkedIn feeds
 */

// ============================================
// PART 1: Ad Detection & Removal
// ============================================

function removeAds() {
  console.log('[Ad Blocker] Scanning for ads...');
  
  let adsRemoved = 0;
  
  try {
    // Method 1: Find by "Promoted" text in ANY span
    const allSpans = document.querySelectorAll('span');
    
    allSpans.forEach((span) => {
      const text = span.textContent?. trim().toLowerCase() || '';
      
      if (text === 'promoted' || text. includes('promoted')) {
        console.log('[Ad Blocker] Found "Promoted" span:', span);
        
        // Find the post container (try multiple levels up)
        let postContainer = null;
        
        // Try closest selectors
        postContainer = span.closest('. feed-shared-update-v2') ||
                       span.closest('[data-urn]') ||
                       span.closest('.feed-shared-update') ||
                       span.closest('div[class*="feed"]');
        
        // If still not found, walk up manually
        if (!postContainer) {
          let parent = span;
          for (let i = 0; i < 15; i++) {
            parent = parent.parentElement;
            if (!parent) break;
            
            // Check if this looks like a post container
            if (parent.querySelector('button[aria-label*="React"]') ||
                parent.querySelector('button[aria-label*="Comment"]') ||
                parent.classList.toString().includes('update')) {
              postContainer = parent;
              break;
            }
          }
        }
        
        if (postContainer && ! postContainer.classList.contains('linkedin-ad-blocked')) {
          // Hide the ad with animation
          postContainer.style.transition = 'opacity 0.3s ease-out, height 0.3s ease-out';
          postContainer.style. opacity = '0';
          postContainer.style.overflow = 'hidden';
          
          setTimeout(() => {
            postContainer. style.height = '0';
            postContainer.style.margin = '0';
            postContainer.style.padding = '0';
          }, 300);
          
          setTimeout(() => {
            postContainer. style.display = 'none';
          }, 600);
          
          postContainer.classList.add('linkedin-ad-blocked');
          adsRemoved++;
          console.log('[Ad Blocker] ✅ Blocked ad:', postContainer);
        } else if (! postContainer) {
          console.warn('[Ad Blocker] ⚠️ Could not find container for:', span);
        }
      }
    });
    
    // Method 2: Find by aria-label
    const ariaElements = document.querySelectorAll('[aria-label*="romoted"]'); // Partial match
    ariaElements.forEach((element) => {
      const container = element.closest('.feed-shared-update-v2') || element.closest('[data-urn]');
      if (container && !container.classList.contains('linkedin-ad-blocked')) {
        container.style.display = 'none';
        container.classList.add('linkedin-ad-blocked');
        adsRemoved++;
        console.log('[Ad Blocker] ✅ Blocked ad (aria-label method):', container);
      }
    });
    
    console.log(`[Ad Blocker] Removed ${adsRemoved} ads from this scan`);
    
  } catch (error) {
    console.error('[Ad Blocker] Error:', error);
  }
  
  return adsRemoved;
}

// ============================================
// PART 2: Dynamic Content Monitoring
// ============================================

function startObserver() {
  console.log('[Ad Blocker] Starting mutation observer...');
  
  const observer = new MutationObserver((mutations) => {
    if (window.adBlockerTimeout) {
      clearTimeout(window.adBlockerTimeout);
    }
    
    window.adBlockerTimeout = setTimeout(() => {
      removeAds();
    }, 300);
  });
  
  const feedContainer = 
    document.querySelector('.scaffold-layout__main') ||
    document.querySelector('main') ||
    document.body;
  
  if (feedContainer) {
    observer.observe(feedContainer, {
      childList: true,
      subtree: true
    });
    
    console.log('[Ad Blocker] ✅ Observer active on:', feedContainer);
  } else {
    console.error('[Ad Blocker] ❌ Could not find feed container! ');
  }
}

// ============================================
// PART 3: Initialization
// ============================================

function init() {
  console.log('[Ad Blocker] Initializing.. .');
  
  // Initial scan
  removeAds();
  
  // Start observer after a delay to let page load
  setTimeout(() => {
    removeAds(); // Scan again
  }, 1000);
  
  setTimeout(() => {
    removeAds(); // Scan one more time
  }, 2000);
  
  // Start continuous monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
  
  console.log('[Ad Blocker] ✅ Initialization complete');
}

// ============================================
// PART 4: Run the extension
// ============================================

init();

// Manual trigger for debugging
window.removeLinkedInAds = removeAds;

// Force scan every 5 seconds (aggressive mode - for testing)
setInterval(() => {
  const blockedCount = removeAds();
  if (blockedCount > 0) {
    console.log(`[Ad Blocker] Periodic scan: removed ${blockedCount} ads`);
  }
}, 5000);