// Standalone Tabs Switcher: lightweight, independent of app.js
(function () {
  function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }

  function switchTo(targetId) {
    if (!targetId) return;
    // hide all sections under main
    document.querySelectorAll('main > div > div[id*="-section"]').forEach(section => {
      section.classList.add('hidden');
    });
    const target = document.getElementById(targetId);
    if (target) target.classList.remove('hidden');

    // update active link styling
    document.querySelectorAll('.tab-link').forEach(link => {
      link.classList.remove('bg-blue-700', 'font-semibold');
      link.classList.add('hover:bg-blue-700', 'font-medium');
    });
    const active = document.querySelector(`.tab-link[data-target="${targetId}"]`);
    if (active) {
      active.classList.add('bg-blue-700', 'font-semibold');
      active.classList.remove('hover:bg-blue-700', 'font-medium');
    }

    // close mobile sidebar
    closeSidebar();
  }

  function init() {
    // init
    // Use delegated event handling on the sidebar nav so clicks always get handled
    // even if elements are added/changed or scripts run in a different order.
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    sidebarNav.addEventListener('click', (e) => {
      const targetLink = e.target && e.target.closest ? e.target.closest('.tab-link') : null;
      if (!targetLink) return;

      e.preventDefault();
      const target = targetLink.dataset && targetLink.dataset.target ? targetLink.dataset.target : null;
      // clicked (delegated): target
      if (target) {
        switchTo(target);
        // switched to: target
      }
    });

    // open default (first) tab by finding any element with data-target
    const first = document.querySelector('.tab-link[data-target]');
    if (first && first.dataset && first.dataset.target) {
      switchTo(first.dataset.target);
    } else {
      switchTo('dashboard-section');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
