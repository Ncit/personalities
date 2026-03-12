import { router } from '../../router/Router.js';

const FRAMEWORK_DATA = {
  mbti: {
    title: 'MBTI — 16 типов личности',
    icon: 'brain',
    accent: '#7C9082',
    gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)',
    description: 'Типология Майерс-Бриггс (MBTI) — одна из самых популярных систем классификации личности. Основана на теории психологических типов Карла Юнга.',
    dimensions: [
      { pair: 'E / I', name: 'Экстраверсия — Интроверсия', desc: 'Откуда вы черпаете энергию' },
      { pair: 'S / N', name: 'Сенсорика — Интуиция', desc: 'Как вы воспринимаете информацию' },
      { pair: 'T / F', name: 'Мышление — Чувство', desc: 'Как вы принимаете решения' },
      { pair: 'J / P', name: 'Суждение — Восприятие', desc: 'Как вы организуете жизнь' },
    ],
    types: 16,
    questions: 60,
    time: '15 мин',
  },
  socionics: {
    title: 'Соционика',
    icon: 'sparkles',
    accent: '#E8A85C',
    gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)',
    description: 'Соционика изучает 16 социотипов и их взаимодействия. Помогает понять совместимость, интертипные отношения и информационный метаболизм.',
    dimensions: [
      { pair: 'Логика / Этика', name: 'Рациональность', desc: 'Логический или этический подход' },
      { pair: 'Интуиция / Сенсорика', name: 'Восприятие', desc: 'Абстрактное или конкретное мышление' },
      { pair: 'Экстраверсия / Интроверсия', name: 'Энергия', desc: 'Направление внимания' },
      { pair: 'Рац. / Иррац.', name: 'Решения', desc: 'Способ принятия решений' },
    ],
    types: 16,
    questions: 48,
    time: '12 мин',
  },
  enneagram: {
    title: 'Эннеаграмма',
    icon: 'heart',
    accent: '#C47A8A',
    gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)',
    description: 'Эннеаграмма описывает 9 базовых типов личности, каждый с уникальной мотивацией, страхами и путями развития. Включает систему крыльев и линий интеграции.',
    dimensions: [
      { pair: '2, 3, 4', name: 'Центр чувств', desc: 'Эмоциональный интеллект' },
      { pair: '5, 6, 7', name: 'Центр мышления', desc: 'Интеллектуальный анализ' },
      { pair: '8, 9, 1', name: 'Центр действий', desc: 'Инстинктивные реакции' },
    ],
    types: 9,
    questions: 36,
    time: '10 мин',
  },
};

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
    const fw = FRAMEWORK_DATA[this.framework];
    if (!fw) return;

    this.el.innerHTML = `
      <div class="framework-info__scroll">
        <div class="framework-info__handle"></div>
        <div class="framework-info__hero" style="background:${fw.gradient}">
          <i data-lucide="${fw.icon}" style="width:32px;height:32px;color:#fff"></i>
          <div class="framework-info__title">${fw.title}</div>
          <div class="framework-info__stats">
            ${fw.types} типов · ${fw.questions} вопросов · ${fw.time}
          </div>
        </div>
        <div class="framework-info__body">
          <p class="framework-info__desc">${fw.description}</p>
          <div class="framework-info__section-label">Измерения</div>
          <div class="framework-info__dimensions">
            ${fw.dimensions.map(d => `
              <div class="framework-info__dim">
                <div class="framework-info__dim-pair" style="color:${fw.accent}">${d.pair}</div>
                <div class="framework-info__dim-name">${d.name}</div>
                <div class="framework-info__dim-desc">${d.desc}</div>
              </div>
            `).join('')}
          </div>
          <button class="btn-primary framework-info__cta" id="fw-start">Начать тест</button>
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
