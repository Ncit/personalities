export class TraitBar {
  static render(letter, percent, color = 'var(--color-primary)') {
    return `
      <div class="trait-bar">
        <span class="trait-bar__letter">${letter}</span>
        <div class="trait-bar__track">
          <div class="trait-bar__fill" style="width:${percent}%;background:${color}"></div>
        </div>
        <span class="trait-bar__percent">${percent}%</span>
      </div>
    `;
  }
}
