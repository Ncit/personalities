export class TypeCard {
  static render({ code, name, description, gradient }) {
    return `
      <div class="type-card" data-type-code="${code}">
        <div class="type-card__header" style="background:${gradient || 'var(--gradient-sage)'}">
          <div class="type-card__code">${code}</div>
        </div>
        <div class="type-card__body">
          <div class="type-card__name">${name}</div>
          <div class="type-card__desc">${description}</div>
        </div>
      </div>
    `;
  }
}
