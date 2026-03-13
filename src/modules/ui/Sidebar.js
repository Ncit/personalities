import { router } from '../router/Router.js';
import localizationManager from '../../locales/LocalizationManager.js';

function getNavItems() {
  return [
    { id: 'home', label: localizationManager.get('nav.homeSidebar'), icon: 'layout-dashboard' },
    { id: 'explore', label: localizationManager.get('nav.catalogSidebar'), icon: 'compass' },
    { id: 'results', label: localizationManager.get('nav.resultsSidebar'), icon: 'chart-bar' },
    { id: 'profile', label: localizationManager.get('nav.profileSidebar'), icon: 'user' },
  ];
}

function getFooterSections() {
  return [
    {
      title: localizationManager.get('footer.helpTitle'),
      links: [
        { label: localizationManager.get('footer.howToTest'), topic: 'how-to-test' },
        { label: localizationManager.get('footer.understandingResults'), topic: 'understanding-results' },
        { label: localizationManager.get('footer.premiumFeatures'), topic: 'premium-features' },
        { label: localizationManager.get('footer.faq'), topic: 'faq' },
      ],
    },
    {
      title: localizationManager.get('footer.aboutTitle'),
      links: [
        { label: localizationManager.get('footer.aboutPersonality'), topic: 'about-personality' },
        { label: localizationManager.get('footer.privacy'), topic: 'privacy' },
        { label: localizationManager.get('footer.terms'), topic: 'terms' },
        { label: localizationManager.get('footer.offer'), topic: 'offer' },
        { label: localizationManager.get('footer.contacts'), topic: 'contacts' },
      ],
    },
  ];
}

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
          ${getNavItems().map(item => `
            <button class="nav-item ${item.id === currentTab ? 'nav-item--active' : ''}" data-tab="${item.id}">
              <i data-lucide="${item.icon}" style="width:20px;height:20px"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </nav>
      </div>
      <div class="sidebar__footer">
        ${getFooterSections().map((section, si) => `
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
        const topic = getFooterSections()[si]?.links[li]?.topic;
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
