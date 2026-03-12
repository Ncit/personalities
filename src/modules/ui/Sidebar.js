import { router } from '../router/Router.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Главная', icon: 'layout-dashboard' },
  { id: 'explore', label: 'Каталог', icon: 'compass' },
  { id: 'results', label: 'Результаты', icon: 'chart-bar' },
  { id: 'profile', label: 'Профиль', icon: 'user' },
];

const FOOTER_SECTIONS = [
  {
    title: 'Помощь',
    links: [
      { label: 'Как пройти тест', topic: 'how-to-test' },
      { label: 'Понимание результатов', topic: 'understanding-results' },
      { label: 'Премиум функции', topic: 'premium-features' },
      { label: 'Вопросы и ответы', topic: 'faq' },
    ],
  },
  {
    title: 'О проекте',
    links: [
      { label: 'О типах личности', topic: 'about-personality' },
      { label: 'Конфиденциальность', topic: 'privacy' },
      { label: 'Условия использования', topic: 'terms' },
      { label: 'Публичная оферта', topic: 'offer' },
      { label: 'Контакты', topic: 'contacts' },
    ],
  },
];

const FOOTER_EMAIL = 'personalitiesresearch@mail.ru';

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
        ${FOOTER_SECTIONS.map((section, si) => `
          <div class="sidebar__footer-section">
            <span class="sidebar__footer-title">${section.title}</span>
            ${section.links.map((link, li) => `<a class="sidebar__footer-link" href="#" data-section="${si}" data-link="${li}">${link.label}</a>`).join('')}
          </div>
        `).join('')}
        <a class="sidebar__footer-email" href="mailto:${FOOTER_EMAIL}">${FOOTER_EMAIL}</a>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (btn) router.navigateTab(btn.dataset.tab);

      const footerLink = e.target.closest('.sidebar__footer-link');
      if (footerLink) {
        e.preventDefault();
        const si = parseInt(footerLink.dataset.section);
        const li = parseInt(footerLink.dataset.link);
        const topic = FOOTER_SECTIONS[si]?.links[li]?.topic;
        if (topic) router.openOverlay('help', { topic });
      }
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
