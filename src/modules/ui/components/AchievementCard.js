export class AchievementCard {
  static render({ icon, title, description, earned }) {
    return `
      <div class="achievement-card ${earned ? '' : 'achievement-card--locked'}">
        <div class="achievement-card__icon-wrap">
          <img src="images/achievements/${icon}.png" style="width:40px;height:40px;object-fit:cover;border-radius:8px">
        </div>
        <div class="achievement-card__text">
          <div class="achievement-card__title">${title}</div>
          <div class="achievement-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
