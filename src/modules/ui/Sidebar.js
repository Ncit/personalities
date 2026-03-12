import { router } from '../router/Router.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'layout-dashboard' },
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'results', label: 'Results', icon: 'chart-bar' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

const FOOTER_LINKS = [
  'Help & FAQ',
  'About Personality Types',
  'Privacy Policy',
  'Terms of Use',
  'Contact Us',
];

export class Sidebar {
  constructor() {
    this.el = document.createElement('aside');
    this.el.id = 'sidebar';
    this.el.className = 'sidebar';
    this.render();
    router.subscribe(() => this.updateActive());
  }

  getElement() { return this.el; }

  render() {
    const currentTab = router.getState().tab;

    this.el.innerHTML = `
      <div class="sidebar__top">
        <div class="sidebar__logo">
          <span class="sidebar__logo-text">Personalities</span>
        </div>
        <nav class="sidebar__nav">
          ${NAV_ITEMS.map(item => `
            <button class="nav-item ${item.id === currentTab ? 'nav-item--active' : ''}" data-tab="${item.id}">
              <i data-lucide="${item.icon}" style="width:20px;height:20px"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </nav>
      </div>
      <div class="sidebar__footer">
        <div class="sidebar__footer-links">
          ${FOOTER_LINKS.map(link => `<a class="sidebar__footer-link">${link}</a>`).join('')}
        </div>
        <span class="sidebar__copyright">© 2025 Personalities</span>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (btn) router.navigateTab(btn.dataset.tab);
    });

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  updateActive() {
    const { tab, overlay } = router.getState();
    this.el.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('nav-item--active', btn.dataset.tab === tab);
    });
  }
}
