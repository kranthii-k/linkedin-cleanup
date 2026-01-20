/**
 * LinkedIn Ad Blocker - Content Script (Fixed)
 * Removes promoted posts from LinkedIn feeds
 */

// ============================================
// PART 1: Ad Detection & Removal
// ============================================

function removeAds() {
  console.log('[Ad Blocker] Scanning for ads...');
  
  let adsRemoved = 0;
  
  try {
    // METHOD 1: Target the exact class LinkedIn uses for promoted posts
    const promotedSpans = document.querySelectorAll('.update-components-actor__sub-description');
    
    console.log(`[Ad Blocker] Found ${promotedSpans.length} sub-description elements`);
    
    promotedSpans.forEach((span) => {
      const text = span.textContent?.trim().toLowerCase() || '';
      
      if (text.includes('promoted')) {
        console.log('[Ad Blocker] Found promoted post! ', span);
        
        // Walk up to find the main post container
        let postContainer = span.closest('div.feed-shared-update-v2');
        
        // If not found, try alternative container
        if (!postContainer) {
          postContainer = span.closest('div[class*="feed-shared-update"]');
        }
        
        // If still not found, walk up manually
        if (!postContainer) {
          let parent = span;
          for (let i = 0; i < 20; i++) {
            parent = parent.parentElement;
            if (! parent) break;
            
            // Look for the feed update container
            if (parent.classList.contains('feed-shared-update-v2') ||
                parent.classList.contains('feed-shared-update') ||
                parent.querySelector('.feed-shared-social-activity')) {
              postContainer = parent;
              break;
            }
          }
        }
        
        if (postContainer && !postContainer.classList.contains('linkedin-ad-blocked')) {
          // Hide with smooth animation
          postContainer.style.transition = 'opacity 0.5s ease-out, max-height 0.5s ease-out';
          postContainer.style.opacity = '0';
          postContainer.style.overflow = 'hidden';
          postContainer.style.maxHeight = postContainer.offsetHeight + 'px';
          
          setTimeout(() => {
            postContainer.style.maxHeight = '0';
            postContainer.style.margin = '0';
            postContainer.style.padding = '0';
          }, 100);
          
          setTimeout(() => {
            postContainer.style.display = 'none';
          }, 600);
          
          postContainer.classList.add('linkedin-ad-blocked');
          adsRemoved++;
          console.log('[Ad Blocker] Blocked promoted post:', postContainer);
        } else if (! postContainer) {
          console.warn('[Ad Blocker] Could not find container. Trying alternative...', span);
          
          // Alternative:  Hide the entire fie-impression-container
          const impressionContainer = span.closest('.fie-impression-container');
          if (impressionContainer && !impressionContainer.classList.contains('linkedin-ad-blocked')) {
            impressionContainer.style.display = 'none';
            impressionContainer.classList.add('linkedin-ad-blocked');
            adsRemoved++;
            console.log('[Ad Blocker] Blocked via impression container');
          }
        }
      }
    });
    
    // METHOD 2: Backup - search all text content
    if (adsRemoved === 0) {
      console.log('[Ad Blocker] Method 1 found nothing, trying backup method...');
      
      const allSpans = document.querySelectorAll('span');
      allSpans.forEach((span) => {
        const text = span.textContent?.trim();
        if (text === 'Promoted') {
          const container = span.closest('.feed-shared-update-v2') || 
                           span.closest('.fie-impression-container');
          
          if (container && !container.classList.contains('linkedin-ad-blocked')) {
            container.style.display = 'none';
            container.classList. add('linkedin-ad-blocked');
            adsRemoved++;
            console.log('[Ad Blocker] Blocked via backup method');
          }
        }
      });
    }
    
    console.log(`[Ad Blocker]  Removed ${adsRemoved} ads from this scan`);
    
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
    }, 500);
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
    
    console.log('[Ad Blocker] Observer active on:', feedContainer);
  } else {
    console.error('[Ad Blocker] Could not find feed container! ');
  }
}

// ============================================
// PART 3: Initialization
// ============================================

function init() {
  console.log('[Ad Blocker] Initializing.. .');
  
  // Multiple scans to catch delayed content
  setTimeout(() => {
    console.log('[Ad Blocker] Initial scan (500ms)');
    removeAds();
  }, 500);
  
  setTimeout(() => {
    console.log('[Ad Blocker] Secondary scan (1500ms)');
    removeAds();
  }, 1500);
  
  setTimeout(() => {
    console.log('[Ad Blocker] Tertiary scan (3000ms)');
    removeAds();
  }, 3000);
  
  // Start continuous monitoring
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startObserver();
      removeAds();
    });
  } else {
    startObserver();
  }
  
  console.log('[Ad Blocker] Initialization complete');
}

// ============================================
// PART 4: Run the extension
// ============================================

init();

// Manual trigger for debugging
window.removeLinkedInAds = removeAds;

// Aggressive mode:  Scan every 3 seconds
setInterval(() => {
  const count = removeAds();
  if (count > 0) {
    console.log(`[Ad Blocker] Periodic scan removed ${count} ads`);
  }
}, 3000);

// URL change detection (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('[Ad Blocker]  URL changed, re-scanning...');
    setTimeout(() => removeAds(), 1000);
  }
}).observe(document, {subtree: true, childList: true});

console.log('[Ad Blocker] Ready to block ads!');