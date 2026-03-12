export class AchievementCard {
  static render({ icon, title, description, earned }) {
    return `
      <div class="achievement-card ${earned ? '' : 'achievement-card--locked'}">
        <div class="achievement-card__icon-wrap">
          <i data-lucide="${icon}" style="width:22px;height:22px"></i>
        </div>
        <div class="achievement-card__text">
          <div class="achievement-card__title">${title}</div>
          <div class="achievement-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
