import '../../../styles/screens/home.css';
import { HeroCard } from '../components/HeroCard.js';
import { BentoGrid } from '../components/BentoGrid.js';
import { resultsStore } from '../../results/ResultsStore.js';

export class HomeScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'home-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }

  onActivate() { this.render(); }

  render() {
    const hasResults = resultsStore.getCount() > 0;

    const greeting = this._getGreeting();

    this.el.innerHTML = `
      <h1 class="page-title">${greeting}</h1>
      <p class="page-subtitle">Исследуйте свою личность через разные методики</p>
      ${HeroCard.render()}
      ${BentoGrid.render(hasResults)}
      ${hasResults ? this._shareCard() : ''}
    `;

    HeroCard.bind(this.el);
    BentoGrid.bind(this.el);

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });

    this.el.querySelector('#share-btn')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'Мой тип личности', url: window.location.href });
      }
    });
  }

  _getGreeting() {
    const hour = new Date().getHours();
    let timeOfDay = 'Добрый вечер';
    if (hour < 12) timeOfDay = 'Доброе утро';
    else if (hour < 18) timeOfDay = 'Добрый день';

    const userName = window.stateManager?.getState?.()?.userName;
    return userName ? `${timeOfDay}, ${userName}` : timeOfDay;
  }

  _shareCard() {
    return `
      <div class="card share-card">
        <div class="share-card__info">
          <div class="share-card__title">Поделиться типом</div>
          <div class="share-card__subtitle">Покажите друзьям свой результат</div>
        </div>
        <button class="btn-primary" id="share-btn">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Поделиться
        </button>
      </div>
    `;
  }
}
