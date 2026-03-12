export class AchievementCard {
  static render({ icon, title, description, earned }) {
    return `
      <div class="achievement-card ${earned ? '' : 'achievement-card--locked'}">
        <div class="achievement-card__icon-wrap">
          <i data-lucide="${icon}" style="width:20px;height:20px"></i>
        </div>
        <div>
          <div class="achievement-card__title">${title}</div>
          <div class="achievement-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
