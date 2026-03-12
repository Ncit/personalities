export class StatCard {
  static render({ label, value }) {
    return `
      <div class="stat-card">
        <div class="stat-card__label">${label}</div>
        <div class="stat-card__value">${value}</div>
      </div>
    `;
  }
}
