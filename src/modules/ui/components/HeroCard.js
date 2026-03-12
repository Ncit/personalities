import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

export class HeroCard {
  static render() {
    const mbtiResult = resultsStore.getLatestByFramework('mbti');
    const badge = mbtiResult ? 'Retake Quiz' : 'MBTI Quiz';
    const title = mbtiResult
      ? 'Retake the MBTI Quiz'
      : 'Discover Your\nPersonality Type';
    const subtitle = mbtiResult
      ? 'See if your type has changed'
      : '60 questions · 15 min · Free';

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
