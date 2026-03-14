import { router } from '../router/Router.js';
import localizationManager from '../../locales/LocalizationManager.js';

function getTabs() {
  return [
    { id: 'home', label: localizationManager.get('nav.home'), icon: 'layout-dashboard' },
    { id: 'explore', label: localizationManager.get('nav.catalog'), icon: 'compass' },
    { id: 'results', label: localizationManager.get('nav.results'), icon: 'chart-bar' },
    { id: 'achievements', label: localizationManager.get('nav.achievements'), icon: 'trophy' },
    { id: 'profile', label: localizationManager.get('nav.profile'), icon: 'user' },
  ];
}

export class TabBar {
  constructor(container) {
    this.container = container;
    this.render();
    router.subscribe(() => this.updateActive());
    window.addEventListener('localeChanged', () => this.render());
  }

  render() {
    this.container.innerHTML = getTabs().map(tab => `
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
