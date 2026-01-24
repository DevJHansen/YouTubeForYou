// Check if we're on the YouTube homepage
function isHomePage() {
  const path = window.location.pathname;
  return path === '/' || path === '/index' || path === '/feed/subscriptions' === false && path === '/';
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
        <svg viewBox="0 0 90 20" class="yt-focus-youtube-logo">
          <g>
            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
            <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
          </g>
          <g>
            <path d="M34.6024 19.4526C33.6896 19.4526 32.9021 19.2157 32.2399 18.7419C31.5777 18.2681 31.0808 17.5765 30.7494 16.6672C30.4179 15.7578 30.2522 14.6419 30.2522 13.3194C30.2522 11.9969 30.4203 10.8834 30.7565 9.97893C31.0926 9.07449 31.5942 8.38546 32.261 7.91168C32.9279 7.4379 33.7177 7.20101 34.6306 7.20101C35.5765 7.20101 36.3778 7.4379 37.0353 7.91168C37.6927 8.38546 38.1895 9.07449 38.5257 9.97893C38.8618 10.8834 39.0299 11.9969 39.0299 13.3194C39.0299 14.6419 38.8618 15.7578 38.5257 16.6672C38.1895 17.5765 37.6904 18.2681 37.0282 18.7419C36.366 19.2157 35.5765 19.4526 34.6024 19.4526ZM34.6024 17.0752C35.1297 17.0752 35.5459 16.8288 35.8513 16.336C36.1566 15.8432 36.3093 15.0387 36.3093 13.9228C36.3093 13.2395 36.2472 12.6612 36.123 12.1881C35.9988 11.7149 35.8182 11.3588 35.5812 11.1195C35.3443 10.8803 35.0483 10.7607 34.6931 10.7607C34.1658 10.7607 33.7496 11.0095 33.4442 11.5071C33.1389 12.0047 32.9862 12.8068 32.9862 13.9132C32.9862 14.5965 33.0484 15.1724 33.1726 15.6408C33.2968 16.1092 33.4773 16.4653 33.7143 16.7093C33.9513 16.9533 34.2449 17.0752 34.6024 17.0752ZM41.0569 19.1498V7.36838H43.2941L43.5058 9.07449H43.6024C43.9339 8.43993 44.368 7.94873 44.9048 7.60091C45.4416 7.25309 46.0502 7.07918 46.7305 7.07918C47.5767 7.07918 48.2486 7.35097 48.7463 7.89455C49.244 8.43813 49.4928 9.22147 49.4928 10.2446V19.1498H46.7888V10.9SEL4C46.7888 10.4753 46.6979 10.1706 46.5163 9.98187C46.3346 9.79312 46.0846 9.69875 45.7663 9.69875C45.3146 9.69875 44.9228 9.88266 44.5913 10.2505C44.2598 10.6183 44.0941 11.0918 44.0941 11.671V19.1498H41.0569ZM52.1594 19.1498V10.2446H50.6083V7.36838H52.1594V6.4331C52.1594 5.1106 52.4979 4.10006 53.175 3.40132C53.852 2.70259 54.8157 2.35322 56.0659 2.35322C56.4494 2.35322 56.8068 2.38289 57.1383 2.44222C57.4697 2.50155 57.7428 2.57571 57.9573 2.66468L57.4757 5.26655C57.3373 5.21696 57.1775 5.17467 56.9963 5.13967C56.8151 5.10467 56.6363 5.08717 56.4599 5.08717C55.995 5.08717 55.6564 5.21943 55.4443 5.48394C55.2322 5.74846 55.1261 6.15355 55.1261 6.69923V7.36838H57.5306V10.2446H55.1261V19.1498H52.1594Z" fill="currentColor"></path>
          </g>
        </svg>
      </div>
      <h1 class="yt-focus-title">YouTube, for you.</h1>
      <p class="yt-focus-subtitle">No algorithm. Just intention.</p>
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
