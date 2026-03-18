// Init
document.addEventListener('DOMContentLoaded', () => {
  const loaded = loadFromLocalStorage();
  if (!loaded || AppState.levels.length === 0) {
    if (typeof loadSampleData === 'function') loadSampleData();
  }
  // Initialize the sheet with current AppState before showing build tab
  renderSheet();
  showTab('build');
});
