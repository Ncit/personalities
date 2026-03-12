import { router } from '../router/Router.js';

const TABS = [
  { id: 'home', label: 'ГЛАВНАЯ', icon: 'layout-dashboard' },
  { id: 'explore', label: 'КАТАЛОГ', icon: 'compass' },
  { id: 'results', label: 'РЕЗУЛЬТАТЫ', icon: 'chart-bar' },
  { id: 'profile', label: 'ПРОФИЛЬ', icon: 'user' },
];

export class TabBar {
  constructor(container) {
    this.container = container;
    this.render();
    router.subscribe(() => this.updateActive());
  }

  render() {
    this.container.innerHTML = TABS.map(tab => `
      <button class="tab-item ${router.getState().tab === tab.id ? 'tab-item--active' : ''}"
              data-tab="${tab.id}">
        <i data-lucide="${tab.icon}" class="tab-item__icon"></i>
        <span class="tab-item__label">${tab.label}</span>
      </button>
    `).join('');

    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-item');
      if (btn) router.navigateTab(btn.dataset.tab);
    });

    if (window.lucide) window.lucide.createIcons({ nodes: [this.container] });
  }

  updateActive() {
    const { tab, overlay } = router.getState();
    this.container.style.display = overlay ? 'none' : 'flex';

    this.container.querySelectorAll('.tab-item').forEach(btn => {
      btn.classList.toggle('tab-item--active', btn.dataset.tab === tab);
    });
  }
}
