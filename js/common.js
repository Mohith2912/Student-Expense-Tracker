(function () {
  const themeToggle = () => {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const nextTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', nextTheme);
      toggleBtn.textContent = nextTheme === 'dark' ? '☀️ Theme' : '🌙 Theme';
    });
  };

  document.addEventListener('DOMContentLoaded', themeToggle);
})();