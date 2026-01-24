// Check if we're on the YouTube homepage
function isHomePage() {
  const path = window.location.pathname;
  return (
    path === '/' ||
    path === '/index' ||
    ((path === '/feed/subscriptions') === false && path === '/')
  );
}

function shouldBlock() {
  const path = window.location.pathname;
  // Block only the main homepage (not search results, watch pages, etc.)
  return path === '/' || path === '';
}

// Create the focus mode overlay
function createOverlay() {
  // Check if overlay already exists
  if (document.getElementById('yt-focus-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'yt-focus-overlay';

  overlay.innerHTML = `
    <div class="yt-focus-container">
      <div class="yt-focus-logo">
        <svg viewBox="0 0 128 128" class="yt-focus-foryou-logo">
          <circle cx="64" cy="64" r="58" fill="none" stroke="#FF0000" stroke-width="6"/>
          <circle cx="64" cy="64" r="46" fill="#FF0000"/>
          <path d="M52 42 L52 86 L88 64 Z" fill="white"/>
        </svg>
      </div>
      <h1 class="yt-focus-title">YouTube, for you.</h1>
      <p class="yt-focus-subtitle">Skip the algorithm and stay focused.</p>
      <form class="yt-focus-search-form" id="yt-focus-search-form">
        <input
          type="text"
          class="yt-focus-search-input"
          id="yt-focus-search-input"
          placeholder="What did you come here to watch?"
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="yt-focus-search-button">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z"/>
          </svg>
        </button>
      </form>
      <button class="yt-focus-show-page" id="yt-focus-show-page">
        Show homepage anyway
      </button>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  // Handle search form submission
  const form = document.getElementById('yt-focus-search-form');
  const input = document.getElementById('yt-focus-search-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }
  });

  // Handle show page button
  const showPageBtn = document.getElementById('yt-focus-show-page');
  showPageBtn.addEventListener('click', () => {
    overlay.classList.add('yt-focus-hidden');
    document.body.style.overflow = '';
    // Store in session that user wants to see the page
    sessionStorage.setItem('yt-focus-show-homepage', 'true');
  });

  // Focus the input
  setTimeout(() => {
    input.focus();
  }, 100);
}

// Remove overlay
function removeOverlay() {
  const overlay = document.getElementById('yt-focus-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Main logic
function checkAndBlock() {
  // If user chose to show homepage this session, don't block
  if (sessionStorage.getItem('yt-focus-show-homepage') === 'true') {
    // Reset when navigating away from homepage
    if (!shouldBlock()) {
      sessionStorage.removeItem('yt-focus-show-homepage');
    }
    removeOverlay();
    return;
  }

  if (shouldBlock()) {
    createOverlay();
  } else {
    removeOverlay();
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndBlock);
} else {
  checkAndBlock();
}

// Watch for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkAndBlock();
  }
}).observe(document, { subtree: true, childList: true });

// Also listen for popstate events
window.addEventListener('popstate', checkAndBlock);
