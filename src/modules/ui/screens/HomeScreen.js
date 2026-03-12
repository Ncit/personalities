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

    this.el.innerHTML = `
      <h1 class="page-title">Discover Yourself</h1>
      <p class="page-subtitle">Your personality journey starts here</p>
      ${HeroCard.render()}
      ${BentoGrid.render()}
      ${hasResults ? this._shareCard() : ''}
    `;

    HeroCard.bind(this.el);
    BentoGrid.bind(this.el);

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });

    this.el.querySelector('#share-btn')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'My Personality Type', url: window.location.href });
      }
    });
  }

  _shareCard() {
    return `
      <div class="card share-card">
        <div class="share-card__info">
          <div class="share-card__title">Share Your Type</div>
          <div class="share-card__subtitle">Show friends your personality</div>
        </div>
        <button class="btn-primary" id="share-btn">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Share
        </button>
      </div>
    `;
  }
}
