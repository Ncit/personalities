import localizationManager from '../../../locales/LocalizationManager.js';

function getStateManager() { return window.stateManager; }

function getAchievements() {
  return [
    { key: 'firstSteps', icon: 'ach_firstSteps', title: localizationManager.get('achievements.firstSteps'), description: localizationManager.get('achievements.firstStepsDesc') },
    { key: 'onFire', icon: 'ach_onFire', title: localizationManager.get('achievements.onFire'), description: localizationManager.get('achievements.onFireDesc') },
    { key: 'highAccuracy', icon: 'ach_highAccuracy', title: localizationManager.get('achievements.highAccuracy'), description: localizationManager.get('achievements.highAccuracyDesc') },
    { key: 'explorer', icon: 'ach_explorer', title: localizationManager.get('achievements.explorer'), description: localizationManager.get('achievements.explorerDesc') },
    { key: 'collector', icon: 'ach_collector', title: localizationManager.get('achievements.collector'), description: localizationManager.get('achievements.collectorDesc') },
    { key: 'marathon', icon: 'ach_marathon', title: localizationManager.get('achievements.marathon'), description: localizationManager.get('achievements.marathonDesc') },
    { key: 'stable', icon: 'ach_stable', title: localizationManager.get('achievements.stable'), description: localizationManager.get('achievements.stableDesc') },
    { key: 'perfectionist', icon: 'ach_perfectionist', title: localizationManager.get('achievements.perfectionist'), description: localizationManager.get('achievements.perfectionistDesc') },
    { key: 'earlyBird', icon: 'ach_earlyBird', title: localizationManager.get('achievements.earlyBird'), description: localizationManager.get('achievements.earlyBirdDesc') },
    { key: 'nightOwl', icon: 'ach_nightOwl', title: localizationManager.get('achievements.nightOwl'), description: localizationManager.get('achievements.nightOwlDesc') },
    { key: 'weekStreak', icon: 'ach_weekStreak', title: localizationManager.get('achievements.weekStreak'), description: localizationManager.get('achievements.weekStreakDesc') },
    { key: 'curious', icon: 'ach_curious', title: localizationManager.get('achievements.curious'), description: localizationManager.get('achievements.curiousDesc') },
    { key: 'specialist', icon: 'ach_specialist', title: localizationManager.get('achievements.specialist'), description: localizationManager.get('achievements.specialistDesc') },
    { key: 'master', icon: 'ach_master', title: localizationManager.get('achievements.master'), description: localizationManager.get('achievements.masterDesc') },
  ];
}

export class AchievementsScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'achievements-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    const sm = getStateManager();
    const achievements = sm ? (sm.get('achievements') || {}) : {};
    const allAchievements = getAchievements();
    const earned = allAchievements.filter(a => achievements[a.key]).length;

    this.el.innerHTML = `
      <h1 class="page-title">${localizationManager.get('achievements.title')}</h1>
      <div class="achievements-progress" style="text-align:center;margin-bottom:16px;font-size:13px;color:#8A8A8A">
        ${localizationManager.get('achievements.progress', { earned, total: allAchievements.length })}
      </div>
      <div class="achievements-grid">
        ${allAchievements.map(a => {
          const isEarned = !!achievements[a.key];
          return `
          <div class="achievement-card ${isEarned ? '' : 'achievement-card--locked'}">
            <div class="achievement-card__icon-wrap">
              <img src="images/achievements/${a.icon}.png" style="width:40px;height:40px;object-fit:cover;border-radius:8px">
            </div>
            <div class="achievement-card__text">
              <div class="achievement-card__title">${a.title}</div>
              <div class="achievement-card__desc">${a.description}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }
}
