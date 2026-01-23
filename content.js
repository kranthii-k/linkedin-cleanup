// /**
//  * LinkedIn Ad Blocker - Content Script (Instant Removal)
//  * Removes promoted posts from LinkedIn feeds
//  */

// // ============================================
// // PART 1: Ad Detection & Removal
// // ============================================

// function removeAds() {
//   console.log('[Ad Blocker] Scanning for ads...');
  
//   let adsRemoved = 0;
  
//   try {
//     // METHOD 1: Target the exact class LinkedIn uses for promoted posts
//     const promotedSpans = document.querySelectorAll('.update-components-actor__sub-description');
    
//     console.log(`[Ad Blocker] Found ${promotedSpans.length} sub-description elements`);
    
//     promotedSpans.forEach((span) => {
//       const text = span.textContent?.trim().toLowerCase() || '';
      
//       if (text.includes('promoted')) {
//         console.log('[Ad Blocker] Found promoted post! ', span);
        
//         // Walk up to find the main post container
//         let postContainer = span.closest('div.feed-shared-update-v2');
        
//         // If not found, try alternative container
//         if (!postContainer) {
//           postContainer = span.closest('div[class*="feed-shared-update"]');
//         }
        
//         // If still not found, walk up manually
//         if (!postContainer) {
//           let parent = span;
//           for (let i = 0; i < 20; i++) {
//             parent = parent.parentElement;
//             if (!parent) break;
            
//             // Look for the feed update container
//             if (parent.classList.contains('feed-shared-update-v2') ||
//                 parent.classList.contains('feed-shared-update')) {
//               postContainer = parent;
//               break;
//             }
            
//             // Check if it has social activity
//             try {
//               if (parent.querySelector('.feed-shared-social-activity')) {
//                 postContainer = parent;
//                 break;
//               }
//             } catch (e) {
//               // Ignore querySelector errors
//             }
//           }
//         }
        
//         if (postContainer && !postContainer.classList.contains('linkedin-ad-blocked')) {
//           // INSTANT REMOVAL - No animation
//           postContainer.style.display = 'none';
//           postContainer.classList.add('linkedin-ad-blocked');
//           adsRemoved++;
//           console.log('[Ad Blocker] Blocked promoted post:', postContainer);
//         } else if (!postContainer) {
//           console.warn('[Ad Blocker] Could not find container. Trying alternative...', span);
          
//           // Alternative: Hide the entire fie-impression-container
//           const impressionContainer = span.closest('.fie-impression-container');
//           if (impressionContainer && !impressionContainer.classList.contains('linkedin-ad-blocked')) {
//             impressionContainer.style.display = 'none';
//             impressionContainer.classList.add('linkedin-ad-blocked');
//             adsRemoved++;
//             console.log('[Ad Blocker] Blocked via impression container');
//           }
//         }
//       }
//     });
    
//     // METHOD 2: Backup - search all text content
//     if (adsRemoved === 0) {
//       console.log('[Ad Blocker] Method 1 found nothing, trying backup method...');
      
//       const allSpans = document.querySelectorAll('span');
//       allSpans.forEach((span) => {
//         const text = span.textContent?.trim();
//         if (text === 'Promoted') {
//           const container = span.closest('.feed-shared-update-v2') || 
//                            span.closest('.fie-impression-container');
          
//           if (container && !container.classList.contains('linkedin-ad-blocked')) {
//             container.style.display = 'none';
//             container.classList.add('linkedin-ad-blocked');
//             adsRemoved++;
//             console.log('[Ad Blocker] Blocked via backup method');
//           }
//         }
//       });
//     }
    
//     console.log(`[Ad Blocker] Removed ${adsRemoved} ads from this scan`);
    
//   } catch (error) {
//     console.error('[Ad Blocker] Error:', error.message);
//   }
  
//   return adsRemoved;
// }

// // ============================================
// // PART 2: Dynamic Content Monitoring
// // ============================================

// function startObserver() {
//   console.log('[Ad Blocker] Starting mutation observer...');
  
//   const observer = new MutationObserver((mutations) => {
//     if (window.adBlockerTimeout) {
//       clearTimeout(window.adBlockerTimeout);
//     }
    
//     // INSTANT DETECTION - Reduced delay from 500ms to 50ms
//     window.adBlockerTimeout = setTimeout(() => {
//       removeAds();
//     }, 50);
//   });
  
//   const feedContainer = 
//     document.querySelector('.scaffold-layout__main') ||
//     document.querySelector('main') ||
//     document.body;
  
//   if (feedContainer) {
//     observer.observe(feedContainer, {
//       childList: true,
//       subtree: true
//     });
    
//     console.log('[Ad Blocker] Observer active on:', feedContainer);
//   } else {
//     console.error('[Ad Blocker] Could not find feed container!');
//   }
// }

// // ============================================
// // PART 3: Initialization
// // ============================================

// function init() {
//   console.log('[Ad Blocker] Initializing...');
  
//   // IMMEDIATE first scan
//   removeAds();
  
//   // Quick follow-up scans
//   setTimeout(() => {
//     console.log('[Ad Blocker] Quick scan (100ms)');
//     removeAds();
//   }, 100);
  
//   setTimeout(() => {
//     console.log('[Ad Blocker] Secondary scan (500ms)');
//     removeAds();
//   }, 500);
  
//   setTimeout(() => {
//     console.log('[Ad Blocker] Tertiary scan (1000ms)');
//     removeAds();
//   }, 1000);
  
//   // Start continuous monitoring
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       startObserver();
//       removeAds();
//     });
//   } else {
//     startObserver();
//   }
  
//   console.log('[Ad Blocker] Initialization complete');
// }

// // ============================================
// // PART 4: Run the extension
// // ============================================

// init();

// // Manual trigger for debugging
// window.removeLinkedInAds = removeAds;

// // Aggressive mode: Scan every 1 second (increased from 3s for faster detection)
// setInterval(() => {
//   const count = removeAds();
//   if (count > 0) {
//     console.log(`[Ad Blocker]Periodic scan removed ${count} ads`);
//   }
// }, 1000);

// // URL change detection (for SPA navigation)
// let lastUrl = location.href;
// new MutationObserver(() => {
//   const url = location.href;
//   if (url !== lastUrl) {
//     lastUrl = url;
//     console.log('[Ad Blocker] URL changed, re-scanning...');
//     setTimeout(() => removeAds(), 100); // Instant re-scan on navigation
//   }
// }).observe(document, {subtree: true, childList: true});

// console.log('[Ad Blocker] Ready to block ads instantly!');



/**
 * LinkedIn Ad Blocker - ULTRA-FAST VERSION
 * Removes promoted posts INSTANTLY
 */





// PART 0: CSS Pre-emptive Blocking (FASTEST)
// Faster than the prev approach - hide promoted posts via CSS before they render!

(function injectCSS() {
  const style = document.createElement('style');
  style.id = 'linkedin-ad-blocker-styles';
  style.textContent = `
    /* Hide promoted posts instantly via CSS */
    .feed-shared-update-v2:has(span:contains("Promoted")) {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Backup: Hide any element with "Promoted" sub-description */
    .update-components-actor__sub-description {
      display: none !important;
    }
    
    /* Show only non-promoted content */
    .feed-shared-update-v2:not(:has(span:contains("Promoted"))) {
      display: block !important;
    }
  `;
  
  // Inject as early as possible
  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(style);
    });
  }
})();

// ============================================
// PART 1: Ad Detection & Removal (JS Fallback)
// ============================================

function removeAds() {
  let adsRemoved = 0;
  
  try {
    // Ultra-fast: Get ALL elements at once
    const promotedSpans = document.querySelectorAll('.update-components-actor__sub-description');
    
    promotedSpans.forEach((span) => {
      const text = span.textContent?.trim().toLowerCase() || '';
      
      if (text.includes('promoted')) {
        // Find container FAST - try closest first
        let postContainer = 
          span.closest('.feed-shared-update-v2') ||
          span.closest('.feed-shared-update') ||
          span.closest('[data-urn]');
        
        // Manual walk up (only if needed)
        if (!postContainer) {
          let parent = span;
          for (let i = 0; i < 15; i++) {
            parent = parent?.parentElement;
            if (!parent) break;
            
            if (parent.classList.contains('feed-shared-update-v2') ||
                parent.classList.contains('feed-shared-update')) {
              postContainer = parent;
              break;
            }
          }
        }
        
        // INSTANT REMOVAL
        if (postContainer && !postContainer.classList.contains('ad-blocked')) {
          postContainer.style.display = 'none';
          postContainer.classList.add('ad-blocked');
          adsRemoved++;
        }
      }
    });
    
    // Backup: Direct span search
    if (adsRemoved === 0) {
      document.querySelectorAll('span').forEach((span) => {
        if (span.textContent?.trim() === 'Promoted') {
          const container = span.closest('.feed-shared-update-v2');
          if (container && !container.classList.contains('ad-blocked')) {
            container.style.display = 'none';
            container.classList.add('ad-blocked');
            adsRemoved++;
          }
        }
      });
    }
    
    if (adsRemoved > 0) {
      console.log(`[Ad Blocker] Removed ${adsRemoved} ads`);
    }
    
  } catch (error) {
    console.error('[Ad Blocker] Error:', error.message);
  }
  
  return adsRemoved;
}

// ============================================
// PART 2: Ultra-Fast Observer
// ============================================

function startObserver() {
  const observer = new MutationObserver(() => {
    // NO DELAY - Execute immediately
    removeAds();
  });
  
  const feedContainer = 
    document.querySelector('.scaffold-layout__main') ||
    document.querySelector('main') ||
    document.body;
  
  if (feedContainer) {
    observer.observe(feedContainer, {
      childList: true,
      subtree: true,
      attributes: true,              // Watch attribute changes
      attributeFilter: ['class']     // Specifically watch class changes
    });
    
    console.log('[Ad Blocker] Ultra-fast observer active');
  }
}

// ============================================
// PART 3: Initialization
// ============================================

function init() {
  console.log('[Ad Blocker] ULTRA-FAST MODE');
  
  // IMMEDIATE execution
  removeAds();
  
  // Rapid follow-up scans
  setTimeout(removeAds, 0);    // Next tick
  setTimeout(removeAds, 50);   // 50ms
  setTimeout(removeAds, 100);  // 100ms
  setTimeout(removeAds, 250);  // 250ms
  setTimeout(removeAds, 500);  // 500ms
  
  // Start observer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
}

// ============================================
// PART 4: Maximum Aggressiveness
// ============================================

init();

// Manual trigger
window.removeLinkedInAds = removeAds;

// ULTRA-AGGRESSIVE: Scan every 500ms
setInterval(removeAds, 500);

// Instant URL change detection
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    removeAds(); // No timeout - instant
    setTimeout(removeAds, 0);
    setTimeout(removeAds, 100);
  }
}).observe(document, {subtree: true, childList: true});

// Emergency backup: requestAnimationFrame loop (MAXIMUM SPEED)
function ultraFastScan() {
  removeAds();
  requestAnimationFrame(ultraFastScan);
}
// Uncomment below for EXTREME mode (high CPU usage)
// ultraFastScan();

console.log('[Ad Blocker] ULTRA-FAST MODE ACTIVE');