import { router } from '../../router/Router.js';
import localizationManager from '../../../locales/LocalizationManager.js';

function getFrameworkData() {
  return {
    jung: {
      title: localizationManager.get('frameworkInfo.jungTitle'),
      icon: 'eye',
      accent: '#6B7EC8',
      gradient: 'linear-gradient(135deg, #6B7EC8 0%, #4A5AA0 100%)',
      description: localizationManager.get('frameworkInfo.jungDesc'),
      dimensions: [
        { pair: 'Se / Si', name: localizationManager.get('frameworkInfo.jungSeSi'), desc: localizationManager.get('frameworkInfo.jungSeSiDesc') },
        { pair: 'Ne / Ni', name: localizationManager.get('frameworkInfo.jungNeNi'), desc: localizationManager.get('frameworkInfo.jungNeNiDesc') },
        { pair: 'Te / Ti', name: localizationManager.get('frameworkInfo.jungTeTi'), desc: localizationManager.get('frameworkInfo.jungTeTiDesc') },
        { pair: 'Fe / Fi', name: localizationManager.get('frameworkInfo.jungFeFi'), desc: localizationManager.get('frameworkInfo.jungFeFiDesc') },
      ],
      types: 8,
      questions: null,
      time: null,
      comingSoon: true,
    },
    mbti: {
      title: localizationManager.get('frameworkInfo.mbtiTitle'),
      icon: 'brain',
      accent: '#7C9082',
      gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)',
      description: localizationManager.get('frameworkInfo.mbtiDesc'),
      dimensions: [
        { pair: 'E / I', name: localizationManager.get('frameworkInfo.mbtiEI'), desc: localizationManager.get('frameworkInfo.mbtiEIDesc') },
        { pair: 'S / N', name: localizationManager.get('frameworkInfo.mbtiSN'), desc: localizationManager.get('frameworkInfo.mbtiSNDesc') },
        { pair: 'T / F', name: localizationManager.get('frameworkInfo.mbtiTF'), desc: localizationManager.get('frameworkInfo.mbtiTFDesc') },
        { pair: 'J / P', name: localizationManager.get('frameworkInfo.mbtiJP'), desc: localizationManager.get('frameworkInfo.mbtiJPDesc') },
      ],
      types: 16,
      questions: 60,
      time: localizationManager.get('frameworkInfo.mbtiTime'),
    },
    socionics: {
      title: localizationManager.get('frameworkInfo.socionicsTitle'),
      icon: 'sparkles',
      accent: '#E8A85C',
      gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)',
      description: localizationManager.get('frameworkInfo.socionicsDesc'),
      dimensions: [
        { pair: localizationManager.get('frameworkInfo.socLE'), name: localizationManager.get('frameworkInfo.socLE'), desc: localizationManager.get('frameworkInfo.socLEDesc') },
        { pair: localizationManager.get('frameworkInfo.socIN'), name: localizationManager.get('frameworkInfo.socIN'), desc: localizationManager.get('frameworkInfo.socINDesc') },
        { pair: localizationManager.get('frameworkInfo.socEI'), name: localizationManager.get('frameworkInfo.socEI'), desc: localizationManager.get('frameworkInfo.socEIDesc') },
        { pair: localizationManager.get('frameworkInfo.socRJ'), name: localizationManager.get('frameworkInfo.socRJ'), desc: localizationManager.get('frameworkInfo.socRJDesc') },
      ],
      types: 16,
      questions: 48,
      time: localizationManager.get('frameworkInfo.socionicsTime'),
    },
    enneagram: {
      title: localizationManager.get('frameworkInfo.enneagramTitle'),
      icon: 'heart',
      accent: '#C47A8A',
      gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)',
      description: localizationManager.get('frameworkInfo.enneagramDesc'),
      dimensions: [
        { pair: '2, 3, 4', name: localizationManager.get('frameworkInfo.enn234'), desc: localizationManager.get('frameworkInfo.enn234Desc') },
        { pair: '5, 6, 7', name: localizationManager.get('frameworkInfo.enn567'), desc: localizationManager.get('frameworkInfo.enn567Desc') },
        { pair: '8, 9, 1', name: localizationManager.get('frameworkInfo.enn891'), desc: localizationManager.get('frameworkInfo.enn891Desc') },
      ],
      types: 9,
      questions: 36,
      time: localizationManager.get('frameworkInfo.enneagramTime'),
    },
  };
}

export class FrameworkInfoScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'framework-info-screen';
    this.framework = null;
  }

  getElement() { return this.el; }

  setData(data) {
    this.framework = data?.framework;
    this.render();
  }

  render() {
    const fw = getFrameworkData()[this.framework];
    if (!fw) return;

    this.el.innerHTML = `
      <div class="framework-info__scroll">
        <div class="framework-info__handle"></div>
        <div class="framework-info__hero" style="background:${fw.gradient}">
          <i data-lucide="${fw.icon}" style="width:32px;height:32px;color:#fff"></i>
          <div class="framework-info__title">${fw.title}</div>
          <div class="framework-info__stats">
            ${fw.types} ${fw.comingSoon ? localizationManager.get('frameworkInfo.functions') : localizationManager.get('frameworkInfo.types')}${fw.questions ? ` · ${fw.questions} ${localizationManager.get('frameworkInfo.questions')}` : ''}${fw.time ? ` · ${fw.time}` : ''}
          </div>
        </div>
        <div class="framework-info__body">
          <p class="framework-info__desc">${fw.description}</p>
          <div class="framework-info__section-label">${localizationManager.get('frameworkInfo.dimensions')}</div>
          <div class="framework-info__dimensions">
            ${fw.dimensions.map(d => `
              <div class="framework-info__dim">
                <div class="framework-info__dim-pair" style="color:${fw.accent}">${d.pair}</div>
                <div class="framework-info__dim-name">${d.name}</div>
                <div class="framework-info__dim-desc">${d.desc}</div>
              </div>
            `).join('')}
          </div>
          ${fw.comingSoon
            ? `<button class="btn-secondary framework-info__cta" disabled>${localizationManager.get('frameworkInfo.comingSoon')}</button>`
            : `<button class="btn-primary framework-info__cta" id="fw-start">${localizationManager.get('frameworkInfo.startTest')}</button>`
          }
        </div>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });

    this.el.querySelector('#fw-start')?.addEventListener('click', () => {
      router.closeOverlay();
      router.openOverlay('quiz', { framework: this.framework });
    });

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }
}
