import '../../../styles/screens/profile.css';
import { StatCard } from '../components/StatCard.js';
import { AchievementCard } from '../components/AchievementCard.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { router } from '../../router/Router.js';

function getStateManager() { return window.stateManager; }

const ACHIEVEMENTS = [
  { key: 'firstSteps', icon: 'footprints', title: 'First Steps', description: 'Complete your first quiz' },
  { key: 'onFire', icon: 'flame', title: 'On Fire', description: '3+ quizzes in one week' },
  { key: 'highAccuracy', icon: 'target', title: 'High Accuracy', description: '85%+ confidence score' },
  { key: 'explorer', icon: 'compass', title: 'Explorer', description: 'Discover 5 different types' },
  { key: 'specialist', icon: 'award', title: 'Specialist', description: 'Complete all premium quizzes' },
  { key: 'master', icon: 'trophy', title: 'Master', description: 'Complete all available tests' },
];

export class ProfileScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'profile-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const sm = getStateManager();
    const isPremium = sm ? sm.get('isPremium') : false;
    const achievements = sm ? (sm.get('achievements') || {}) : {};
    const mbti = resultsStore.getLatestByFramework('mbti');
    const testCount = resultsStore.getCount();
    const accuracy = resultsStore.getAverageConfidence();

    const vkUser = this._getVkUser();

    this.el.innerHTML = `
      <h1 class="page-title">Profile</h1>
      <div class="user-card">
        <div class="user-card__avatar">
          ${vkUser?.photo_100
            ? `<img src="${vkUser.photo_100}" alt="">`
            : '<i data-lucide="user" style="width:24px;height:24px"></i>'
          }
        </div>
        <div>
          <div class="user-card__name">${vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : 'Guest'}</div>
          ${mbti ? `<div class="user-card__type">${mbti.typeCode} · ${mbti.typeName}</div>` : ''}
        </div>
      </div>
      <div class="stats-row">
        ${StatCard.render({ label: 'Tests Taken', value: testCount.toString() })}
        ${StatCard.render({ label: 'Accuracy', value: accuracy != null ? `${accuracy}%` : '—' })}
      </div>
      <div class="achievements-section">
        <div class="achievements-section__title">Achievements</div>
        ${ACHIEVEMENTS.map(a => AchievementCard.render({
          ...a,
          earned: !!achievements[a.key],
        })).join('')}
      </div>
      ${!isPremium ? this._premiumCta() : ''}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _getVkUser() {
    try {
      const data = localStorage.getItem('vk_user_auth');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  _premiumCta() {
    return `
      <div class="premium-cta" id="premium-cta">
        <div class="premium-cta__title">Go Premium</div>
        <div class="premium-cta__subtitle">Unlock all quizzes & insights</div>
        <button class="btn-gold">280 ₽</button>
      </div>
    `;
  }

  _bind() {
    this.el.querySelector('#premium-cta')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });
  }
}
