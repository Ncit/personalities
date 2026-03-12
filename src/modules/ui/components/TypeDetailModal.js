import '../../../styles/screens/type-detail-modal.css';
import { router } from '../../router/Router.js';

export class TypeDetailModal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'overlay-backdrop type-detail-backdrop';
    this.data = {};
    this.render();
  }

  getElement() { return this.el; }

  setData(data) {
    this.data = data || {};
    this.render();
  }

  render() {
    const { code, name, description, traits, gradient } = this.data;

    this.el.innerHTML = `
      <div class="type-detail-modal">
        <div class="type-detail-modal__header" style="background:${gradient || 'var(--gradient-sage)'}">
          <div class="type-detail-modal__code">${code || ''}</div>
        </div>
        <div class="type-detail-modal__body">
          <div class="type-detail-modal__name">${name || ''}</div>
          <div class="type-detail-modal__desc">${description || ''}</div>
          ${traits && traits.length ? `
            <div class="type-detail-modal__traits">
              ${traits.map(t => `<span class="type-detail-modal__trait">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) router.closeOverlay();
    });
  }
}
