export class DimensionBar {
  static render({ leftLabel, rightLabel, leftPercent, color }) {
    return `
      <div class="dimension-bar">
        <div class="dimension-bar__labels">
          <span class="dimension-bar__left">${leftLabel} ${leftPercent}%</span>
          <span class="dimension-bar__right">${rightLabel}</span>
        </div>
        <div class="dimension-bar__track">
          <div class="dimension-bar__fill" style="width:${leftPercent}%;background:${color}"></div>
        </div>
      </div>
    `;
  }
}
