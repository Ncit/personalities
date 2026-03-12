import { router } from '../../router/Router.js';

const FRAMEWORKS = [
  {
    key: 'mbti',
    badge: 'MBTI',
    title: '16 типов личности\nи ваше место среди них',
    gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)',
  },
  {
    key: 'socionics',
    badge: 'Соционика',
    title: '16 социотипов\nи интертипные связи',
    gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)',
  },
  {
    key: 'enneagram',
    badge: 'Эннеаграмма',
    title: '9 типов личности\nи крылья характера',
    gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)',
  },
];

export class HeroCard {
  static render() {
    const cards = FRAMEWORKS.map((fw, i) => {
      return `
        <div class="hero-card" data-framework="${fw.key}" style="background:${fw.gradient}">
          <div class="hero-card__badge">${fw.badge}</div>
          <div class="hero-card__title">${fw.title}</div>
        </div>
      `;
    }).join('');

    const dots = FRAMEWORKS.map((_, i) =>
      `<span class="hero-slider__dot ${i === 0 ? 'hero-slider__dot--active' : ''}" data-slide="${i}"></span>`
    ).join('');

    return `
      <div class="hero-slider">
        <div class="hero-slider__track">${cards}</div>
        <div class="hero-slider__dots">${dots}</div>
      </div>
    `;
  }

  static bind(container) {
    const track = container.querySelector('.hero-slider__track');
    const dots = container.querySelectorAll('.hero-slider__dot');
    if (!track) return;

    // Update dots on scroll
    track.addEventListener('scroll', () => {
      const cardWidth = track.firstElementChild?.offsetWidth || 300;
      const idx = Math.round(track.scrollLeft / (cardWidth + 12));
      dots.forEach((d, i) => d.classList.toggle('hero-slider__dot--active', i === idx));
    });

    // Dot click scrolls to card
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.slide);
        const cardWidth = track.firstElementChild?.offsetWidth || 300;
        track.scrollTo({ left: idx * (cardWidth + 12), behavior: 'smooth' });
      });
    });

    // Card click opens framework info overlay
    container.querySelectorAll('.hero-card[data-framework]').forEach(card => {
      card.addEventListener('click', () => {
        router.openOverlay('framework-info', { framework: card.dataset.framework });
      });
    });
  }
}
