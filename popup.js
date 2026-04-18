const DEFAULTS = {
  blockHomepage: true,
  hideShorts: true,
  hideComments: true,
  hideRecommended: true,
  puzzleBypass: true,
};

const LOCKED_KEYS = ['blockHomepage', 'puzzleBypass'];

async function init() {
  const data = await chrome.storage.sync.get(DEFAULTS);
  const inputs = {};
  for (const key of Object.keys(DEFAULTS)) {
    inputs[key] = document.getElementById(key);
    inputs[key].checked = !!data[key];
  }

  const puzzleRow = document.getElementById('puzzleBypassRow');
  const blockHomepageRow = document.getElementById('blockHomepageRow');
  const lockNotice = document.getElementById('lockNotice');
  let puzzleActive = false;

  function syncPuzzleAvailability() {
    const blockEnabled = inputs.blockHomepage.checked;
    const locked = puzzleActive;
    inputs.blockHomepage.disabled = locked;
    blockHomepageRow.classList.toggle('disabled', locked);
    inputs.puzzleBypass.disabled = locked || !blockEnabled;
    puzzleRow.classList.toggle('disabled', locked || !blockEnabled);
    lockNotice.hidden = !locked;
    if (!blockEnabled && inputs.puzzleBypass.checked && !locked) {
      inputs.puzzleBypass.checked = false;
      chrome.storage.sync.set({ puzzleBypass: false });
    }
  }

  const localData = await chrome.storage.local.get({ puzzleActive: false });
  puzzleActive = !!localData.puzzleActive;
  syncPuzzleAvailability();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.puzzleActive) {
      puzzleActive = !!changes.puzzleActive.newValue;
      syncPuzzleAvailability();
    }
  });

  for (const key of Object.keys(DEFAULTS)) {
    inputs[key].addEventListener('change', () => {
      if (LOCKED_KEYS.includes(key) && puzzleActive) {
        inputs[key].checked = !inputs[key].checked;
        return;
      }
      chrome.storage.sync.set({ [key]: inputs[key].checked });
      if (key === 'blockHomepage') syncPuzzleAvailability();
    });
  }
}

init();
