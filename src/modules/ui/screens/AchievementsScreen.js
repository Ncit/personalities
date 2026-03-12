function getStateManager() { return window.stateManager; }

const ACHIEVEMENTS = [
  { key: 'firstSteps', icon: 'ach_firstSteps', title: 'Первые шаги', description: 'Пройдите первый тест' },
  { key: 'onFire', icon: 'ach_onFire', title: 'В ударе', description: '3+ теста за неделю' },
  { key: 'highAccuracy', icon: 'ach_highAccuracy', title: 'Высокая точность', description: '85%+ показатель уверенности' },
  { key: 'explorer', icon: 'ach_explorer', title: 'Исследователь', description: 'Откройте 5 разных типов' },
  { key: 'collector', icon: 'ach_collector', title: 'Коллекционер', description: 'Пройдите тесты 3 разных систем' },
  { key: 'marathon', icon: 'ach_marathon', title: 'Марафонец', description: 'Пройдите 10 тестов' },
  { key: 'stable', icon: 'ach_stable', title: 'Стабильность', description: 'Один тип 3 раза подряд' },
  { key: 'perfectionist', icon: 'ach_perfectionist', title: 'Перфекционист', description: '95%+ показатель уверенности' },
  { key: 'earlyBird', icon: 'ach_earlyBird', title: 'Ранняя пташка', description: 'Пройдите тест до 7 утра' },
  { key: 'nightOwl', icon: 'ach_nightOwl', title: 'Ночная сова', description: 'Пройдите тест после полуночи' },
  { key: 'weekStreak', icon: 'ach_weekStreak', title: 'Неделя роста', description: 'Заходите 7 дней подряд' },
  { key: 'curious', icon: 'ach_curious', title: 'Любознательный', description: 'Откройте все разделы помощи' },
  { key: 'specialist', icon: 'ach_specialist', title: 'Специалист', description: 'Пройдите все премиум тесты' },
  { key: 'master', icon: 'ach_master', title: 'Мастер', description: 'Пройдите все доступные тесты' },
];

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
    const earned = ACHIEVEMENTS.filter(a => achievements[a.key]).length;

    this.el.innerHTML = `
      <h1 class="page-title">Достижения</h1>
      <div class="achievements-progress" style="text-align:center;margin-bottom:16px;font-size:13px;color:#8A8A8A">
        Получено ${earned} из ${ACHIEVEMENTS.length}
      </div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => {
          const isEarned = !!achievements[a.key];
          return `
          <div class="achievement-card ${isEarned ? '' : 'achievement-card--locked'}">
            <div class="achievement-card__icon-wrap">
              <img src="/images/achievements/${a.icon}.png" style="width:40px;height:40px;object-fit:cover;border-radius:8px">
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
