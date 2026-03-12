import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

export class HeroCard {
  static render() {
    const mbtiResult = resultsStore.getLatestByFramework('mbti');
    const badge = mbtiResult ? 'Пройти снова' : 'Тест MBTI';
    const title = mbtiResult
      ? 'Пройти тест MBTI снова'
      : '60 вопросов для определения вашего типа';
    const subtitle = mbtiResult
      ? 'Узнайте, изменился ли ваш тип'
      : '15 мин · Бесплатно · Поделитесь результатами';

    return `
      <div class="hero-card" id="hero-card">
        <div class="hero-card__badge">${badge}</div>
        <div class="hero-card__title">${title}</div>
        <div class="hero-card__subtitle">${subtitle}</div>
      </div>
    `;
  }

  static bind(container) {
    container.querySelector('#hero-card')?.addEventListener('click', () => {
      router.openOverlay('quiz', { framework: 'mbti' });
    });
  }
}
