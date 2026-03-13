import { router } from '../../router/Router.js';
import localizationManager from '../../../locales/LocalizationManager.js';

function getHelpContent() {
  return {
    'how-to-test': {
      title: localizationManager.get('help.howToTest.title'),
      content: localizationManager.get('help.howToTest.content'),
    },
    'understanding-results': {
      title: localizationManager.get('help.understandingResults.title'),
      content: localizationManager.get('help.understandingResults.content'),
    },
    'premium-features': {
      title: localizationManager.get('help.premiumFeatures.title'),
      content: localizationManager.get('help.premiumFeatures.content'),
    },
    'faq': {
      title: localizationManager.get('help.faq.title'),
      content: localizationManager.get('help.faq.content'),
    },
    'about-personality': {
      title: localizationManager.get('help.aboutPersonality.title'),
      content: localizationManager.get('help.aboutPersonality.content'),
    },
    'privacy': {
      title: localizationManager.get('help.privacy.title'),
      content: localizationManager.get('help.privacy.content'),
    },
    'terms': {
      title: localizationManager.get('help.terms.title'),
      content: localizationManager.get('help.terms.content'),
    },
    'offer': {
      title: localizationManager.get('help.offer.title'),
      content: localizationManager.get('help.offer.content'),
    },
    'contacts': {
      title: localizationManager.get('help.contacts.title'),
      content: localizationManager.get('help.contacts.content'),
    },
  };
}

export class HelpModal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'overlay-backdrop help-modal-backdrop';
    this.topic = null;
  }

  getElement() { return this.el; }

  setData(data) {
    this.topic = data?.topic || null;
    this.render();
  }

  render() {
    const help = getHelpContent()[this.topic];
    if (!help) {
      this.el.innerHTML = '';
      return;
    }

    this.el.innerHTML = `
      <div class="help-modal">
        <div class="help-modal__header">
          <span class="help-modal__title">${help.title}</span>
          <button class="help-modal__close" id="help-close">
            <i data-lucide="x" style="width:20px;height:20px"></i>
          </button>
        </div>
        <div class="help-modal__body">
          ${help.content}
        </div>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });
    this.el.querySelector('#help-close')?.addEventListener('click', () => {
      router.closeOverlay();
    });
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }
}
