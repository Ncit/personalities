import { router } from '../../router/Router.js';
import { stateManager } from '../../core/StateManager.js';
import localizationManager from '../../../locales/LocalizationManager.js';

function getFrameworks() {
  return [
    { title: localizationManager.get('quizCards.mbtiTitle'), meta: localizationManager.get('quizCards.mbtiMeta'), gradient: 'linear-gradient(135deg, #7C9082 0%, #5A7A64 100%)', framework: 'mbti' },
    { title: localizationManager.get('quizCards.socionicsTitle'), meta: localizationManager.get('quizCards.socionicsMeta'), gradient: 'linear-gradient(135deg, #E8A85C 0%, #C4843A 100%)', framework: 'socionics' },
    { title: localizationManager.get('quizCards.enneagramTitle'), meta: localizationManager.get('quizCards.enneagramMeta'), gradient: 'linear-gradient(135deg, #C47A8A 0%, #A05A6A 100%)', framework: 'enneagram' },
  ];
}

function getPremiumSections() {
  return [
    {
      label: localizationManager.get('explore.premiumMbti'),
      accent: '#7C9082',
      accentDark: '#5A7A64',
      tests: [
        { icon: 'crown', title: localizationManager.get('explore.leadershipStyle'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 10 }), framework: 'leadership' },
        { icon: 'message-circle', title: localizationManager.get('explore.communicationStyle'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'communication' },
        { icon: 'zap', title: localizationManager.get('explore.stressResponse'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'stress' },
        { icon: 'graduation-cap', title: localizationManager.get('explore.learningStyle'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'learning' },
        { icon: 'heart', title: localizationManager.get('explore.relationshipDynamics'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'relationships' },
        { icon: 'palette', title: localizationManager.get('explore.creativityInnovation'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'creativity' },
        { icon: 'scale', title: localizationManager.get('explore.decisionMaking'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'decision' },
        { icon: 'users', title: localizationManager.get('explore.teamCollaboration'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'teamwork' },
        { icon: 'briefcase', title: localizationManager.get('explore.careerPreferences'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'career' },
        { icon: 'handshake', title: localizationManager.get('explore.socialInteraction'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'social' },
        { icon: 'rocket', title: localizationManager.get('explore.motivationDrive'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'motivation' },
        { icon: 'refresh-cw', title: localizationManager.get('explore.adaptabilityChange'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'adaptability' },
        { icon: 'shield', title: localizationManager.get('explore.conflictResolution'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'conflict' },
        { icon: 'check-square', title: localizationManager.get('explore.productivityStyle'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'productivity' },
        { icon: 'smile', title: localizationManager.get('explore.emotionalIntelligence'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'emotional' },
      ],
    },
    {
      label: localizationManager.get('explore.premiumSocionics'),
      accent: '#E8A85C',
      accentDark: '#C4843A',
      tests: [
        { icon: 'users', title: localizationManager.get('explore.intertypeRelations'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'socionics_intertype' },
        { icon: 'layers', title: localizationManager.get('explore.quadraValues'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'socionics_quadra' },
        { icon: 'cpu', title: localizationManager.get('explore.infoMetabolism'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'socionics_functions' },
        { icon: 'shield', title: localizationManager.get('explore.conflictology'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'socionics_conflict' },
        { icon: 'briefcase', title: localizationManager.get('explore.careerSociotype'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'socionics_career' },
        { icon: 'heart', title: localizationManager.get('explore.loveDuality'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'socionics_love' },
      ],
    },
    {
      label: localizationManager.get('explore.premiumEnneagram'),
      accent: '#C47A8A',
      accentDark: '#A05A6A',
      tests: [
        { icon: 'feather', title: localizationManager.get('explore.wingsSubtypes'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'enneagram_wings' },
        { icon: 'zap', title: localizationManager.get('explore.stressGrowth'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'enneagram_stress' },
        { icon: 'flame', title: localizationManager.get('explore.survivalInstincts'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'enneagram_instincts' },
        { icon: 'heart', title: localizationManager.get('explore.enneagramRelationships'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 7 }), framework: 'enneagram_relationships' },
        { icon: 'eye', title: localizationManager.get('explore.shadowSide'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'enneagram_shadow' },
        { icon: 'sunrise', title: localizationManager.get('explore.spiritualPath'), meta: localizationManager.get('explore.questionsMin', { questions: 20, time: 8 }), framework: 'enneagram_spiritual' },
      ],
    },
  ];
}

function renderFrameworkCard(f) {
  return `
    <div class="catalog-fw-card" data-framework="${f.framework}" style="background:${f.gradient}">
      <div class="catalog-fw-card__title">${f.title}</div>
      <div class="catalog-fw-card__meta">${f.meta}</div>
    </div>`;
}

function renderPremiumCard(test, accent) {
  return `
    <div class="catalog-premium-card" data-framework="${test.framework}" style="--card-border:${accent}30">
      <div class="catalog-premium-card__icon" style="background:${accent}15;color:${accent}">
        <i data-lucide="${test.icon}" style="width:18px;height:18px"></i>
      </div>
      <div class="catalog-premium-card__title">${test.title}</div>
      <div class="catalog-premium-card__meta">${test.meta}</div>
    </div>`;
}

function renderPremiumSection(section) {
  return `
    <div class="catalog-premium-header">
      <span class="catalog-premium-dot" style="background:${section.accent}"></span>
      <span class="catalog-premium-label" style="color:${section.accentDark}">${section.label}</span>
    </div>
    <div class="catalog-premium-grid">
      ${section.tests.map(t => renderPremiumCard(t, section.accent)).join('')}
    </div>`;
}

export class ExploreScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'explore-screen screen-content';
    this.render();
  }

  getElement() { return this.el; }
  onActivate() { this.render(); }

  render() {
    this.el.innerHTML = `
      <h1 class="page-title">${localizationManager.get('explore.title')}</h1>
      <div class="section-label">${localizationManager.get('explore.mainMethods')}</div>
      <div class="catalog-fw-cards">
        ${getFrameworks().map(renderFrameworkCard).join('')}
      </div>
      ${getPremiumSections().map(renderPremiumSection).join('')}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _bind() {
    this.el.querySelectorAll('.catalog-fw-card').forEach(card => {
      card.addEventListener('click', () => {
        router.openOverlay('quiz', { framework: card.dataset.framework });
      });
    });

    this.el.querySelectorAll('.catalog-premium-card').forEach(card => {
      card.addEventListener('click', () => {
        if (!stateManager.get('isPremium')) {
          router.openOverlay('premium-modal');
        } else {
          router.openOverlay('quiz', { framework: card.dataset.framework });
        }
      });
    });
  }
}
