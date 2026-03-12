import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';
import { LoggerManager } from '../../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('QuizScreen');

// QuizEngine and StateManager are initialized in script.js and exposed on window
function getQuizEngine() { return window.quizEngine; }
function getStateManager() { return window.stateManager; }

const FRAMEWORK_NAMES = {
  mbti: 'MBTI',
  socionics: 'Соционика',
  enneagram: 'Эннеаграмма',
  leadership: 'Стиль лидерства',
  communication: 'Стиль общения',
  stress: 'Реакция на стресс',
  learning: 'Стиль обучения',
  relationships: 'Динамика отношений',
  creativity: 'Креативность',
  decision: 'Принятие решений',
  teamwork: 'Командная работа',
  career: 'Карьера',
  social: 'Социальное взаимодействие',
  motivation: 'Мотивация',
  adaptability: 'Адаптивность',
  conflict: 'Разрешение конфликтов',
  productivity: 'Продуктивность',
  emotional: 'Эмоциональный интеллект',
};

export class QuizScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'quiz-screen';
    this.showExitDialog = false;
    this.framework = 'mbti';
  }

  getElement() { return this.el; }

  async setData(data) {
    if (data?.framework) this.framework = data.framework;
    const sm = getStateManager();
    if (sm) sm.setQuizType(this.framework);
    const qe = getQuizEngine();
    if (qe) {
      qe.resetQuiz();
      await qe.startQuiz();
    }
    this.render();
  }

  render() {
    const qe = getQuizEngine();
    if (!qe) {
      this.el.innerHTML = '<div class="loading-screen"><div class="spinner"></div><span>Загрузка теста...</span></div>';
      return;
    }

    const current = qe.getCurrentQuestion();
    const total = qe.questions ? qe.questions.length : 0;
    const questionIndex = qe.currentQuestionIndex || 0;
    const progress = total > 0 ? ((questionIndex + 1) / total) * 100 : 0;
    const isAdaptive = qe.isAdaptiveMode;
    const isLast = questionIndex === total - 1;
    const hasSelection = qe.selectedOption !== null && qe.selectedOption !== undefined;

    this.el.innerHTML = `
      <div class="quiz-card">
        <div class="status-bar"></div>
        <div class="quiz-header">
          <button class="quiz-header__close" id="quiz-close">
            <i data-lucide="x" style="width:24px;height:24px"></i>
          </button>
          <span class="quiz-header__title">${FRAMEWORK_NAMES[this.framework] || this.framework.toUpperCase()}</span>
          <span class="quiz-header__counter">${questionIndex + 1}/${total}</span>
        </div>
        <div class="quiz-progress">
          <div class="quiz-progress__fill" style="width:${progress}%"></div>
        </div>
        ${this._dimensionBars(qe)}
        <div class="quiz-content">
          <div class="quiz-question">${current?.question || current?.text || 'Загрузка...'}</div>
          <div class="quiz-options">
            ${(current?.options || []).map((opt, i) => {
              const optionIndex = i + 1;
              const isSelected = qe.selectedOption === optionIndex;
              return `
              <button class="answer-option ${isSelected ? 'answer-option--selected' : ''}" data-option="${optionIndex}">
                <i data-lucide="check" style="width:18px;height:18px;flex-shrink:0;opacity:${isSelected ? '1' : '0'}"></i>
                ${opt.text || opt}
              </button>`;
            }).join('')}
          </div>
        </div>
        <div class="quiz-nav">
          <button class="btn-secondary" id="quiz-prev" ${questionIndex === 0 ? 'disabled' : ''}>
            <i data-lucide="arrow-left" style="width:16px;height:16px"></i> Назад
          </button>
          <button class="btn-primary" id="quiz-next" ${!hasSelection ? 'disabled' : ''}>
            ${isLast ? 'Результаты' : 'Далее'} <i data-lucide="arrow-right" style="width:16px;height:16px"></i>
          </button>
        </div>
        ${getStateManager()?.isDevelopment() ? `
          <button class="dev-finish-btn" id="dev-finish">
            <i data-lucide="zap" style="width:14px;height:14px"></i> Заполнить случайно
          </button>
        ` : ''}
      </div>
      ${this.showExitDialog ? this._exitDialog() : ''}
    `;

    this._bind();
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _dimensionBars(qe) {
    const questionIndex = qe.currentQuestionIndex || 0;
    const questions = qe.questions || [];
    const total = questions.length;

    let dims;
    if (this.framework === 'socionics') {
      dims = [
        { label: 'Л/Э', key: 'LE', color: 'var(--color-dim-ei, #7C9082)' },
        { label: 'И/С', key: 'IN', color: 'var(--color-dim-sn, #E8A85C)' },
        { label: 'Э/И', key: 'EI', color: 'var(--color-dim-tf, #C47A8A)' },
        { label: 'Р/Ир', key: 'RJ', color: 'var(--color-dim-jp, #8B7EC8)' },
      ];
    } else if (this.framework === 'enneagram') {
      dims = [
        { label: 'Сердце', key: 'HC', color: '#C47A8A' },
        { label: 'Голова', key: 'HD', color: '#7C9082' },
        { label: 'Тело', key: 'BD', color: '#E8A85C' },
      ];
    } else {
      dims = [
        { label: 'E/I', key: 'EI', color: 'var(--color-dim-ei, #7C9082)' },
        { label: 'S/N', key: 'SN', color: 'var(--color-dim-sn, #E8A85C)' },
        { label: 'T/F', key: 'TF', color: 'var(--color-dim-tf, #C47A8A)' },
        { label: 'J/P', key: 'JP', color: 'var(--color-dim-jp, #8B7EC8)' },
      ];
    }

    // Calculate progress per dimension based on answered questions
    const dimCounts = {};
    const dimTotals = {};
    dims.forEach(d => { dimCounts[d.key] = 0; dimTotals[d.key] = 0; });

    questions.forEach((q, i) => {
      const dim = this.framework === 'enneagram' ? this._enneagramDimGroup(q.dimension) : q.dimension;
      if (dim in dimTotals) {
        dimTotals[dim]++;
        if (i < questionIndex) dimCounts[dim]++;
      }
    });

    return `<div class="quiz-adaptive">
      ${dims.map(d => {
        const pct = dimTotals[d.key] > 0 ? Math.round((dimCounts[d.key] / dimTotals[d.key]) * 100) : 0;
        return `
        <div class="quiz-adaptive__bar">
          <div class="quiz-adaptive__track"><div class="quiz-adaptive__fill" style="width:${pct}%;background:${d.color}"></div></div>
          <span class="quiz-adaptive__label">${d.label}</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  _enneagramDimGroup(dim) {
    if (dim === 'HC' || dim === 'H1') return 'HC';
    if (dim === 'HD' || dim === 'D1') return 'HD';
    if (dim === 'BD' || dim === 'B1') return 'BD';
    return dim;
  }

  _exitDialog() {
    return `
      <div class="exit-dialog" id="exit-dialog">
        <div class="exit-dialog__card">
          <div class="exit-dialog__icon">
            <i data-lucide="door-open" style="width:32px;height:32px"></i>
          </div>
          <div class="exit-dialog__title">Выйти из теста?</div>
          <div class="exit-dialog__text">Ваш прогресс будет потерян. Вы можете пройти тест снова в любое время.</div>
          <div class="exit-dialog__actions">
            <button class="btn-danger" id="exit-confirm">Выйти</button>
            <button class="btn-secondary" id="exit-cancel">Продолжить</button>
          </div>
        </div>
      </div>
    `;
  }

  _bind() {
    const qe = getQuizEngine();
    const sm = getStateManager();

    this.el.querySelector('#quiz-close')?.addEventListener('click', () => {
      this.showExitDialog = true;
      this.render();
    });

    this.el.querySelector('#exit-cancel')?.addEventListener('click', () => {
      this.showExitDialog = false;
      this.render();
    });
    this.el.querySelector('#exit-confirm')?.addEventListener('click', () => {
      if (qe) qe.resetQuiz();
      router.closeOverlay();
    });
    this.el.querySelector('#exit-dialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'exit-dialog') {
        this.showExitDialog = false;
        this.render();
      }
    });

    this.el.querySelectorAll('.answer-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (qe) qe.selectOption(parseInt(btn.dataset.option));
        this.render();
      });
    });

    this.el.querySelector('#quiz-prev')?.addEventListener('click', () => {
      if (qe) qe.previousQuestion();
      this.render();
    });

    this.el.querySelector('#dev-finish')?.addEventListener('click', async () => {
      if (!qe) return;
      const results = await qe.fillRandomAnswers();
      if (results) {
        this._handleCompletion(results);
      }
    });

    this.el.querySelector('#quiz-next')?.addEventListener('click', async () => {
      if (!qe) return;

      const result = await qe.nextQuestion();

      const lastResults = sm ? sm.get('lastResults') : null;
      if (sm && sm.get('currentScreen') === 'results' && lastResults) {
        this._handleCompletion(lastResults);
      } else {
        this.render();
      }
    });
  }

  _handleCompletion(results) {
    const dims = results.dimensionBreakdown || {};
    let typeName = results.personalityType;

    // Resolve type name from framework-specific type data
    if (this.framework === 'mbti') {
      const typeData = window.PERSONALITY_TYPES?.[results.personalityType];
      typeName = typeData?.title || typeData?.name || results.personalityType;
    } else if (this.framework === 'socionics') {
      typeName = results.typeName || results.personalityType;
    } else if (this.framework === 'enneagram') {
      typeName = results.typeName || results.personalityType;
    }

    const entry = resultsStore.addResult({
      framework: this.framework,
      typeCode: results.personalityType,
      typeName,
      dimensions: results.dimensions || dims,
      confidence: results.adaptiveAnalytics?.confidenceScores || null,
    });
    const sm = getStateManager();
    if (sm) sm.checkAchievements(resultsStore);
    router.closeOverlay();
    router.openOverlay('result-detail', { resultId: entry.id });
  }
}
