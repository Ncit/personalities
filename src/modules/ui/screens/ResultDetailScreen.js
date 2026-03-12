import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

function getStateManager() { return window.stateManager; }
function getTypeData() { return window.PERSONALITY_TYPES || {}; }
function getAdvancedInsights() { return window.ADVANCED_INSIGHTS || {}; }
function getFamousPersonalities() { return window.FAMOUS_PERSONALITIES || {}; }

const INSIGHT_SECTIONS_DEFAULT = [
  { icon: 'briefcase', title: 'Карьера', key: 'careers', bg: 'rgba(124,144,130,0.06)', color: '#7C9082' },
  { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: 'rgba(212,165,116,0.06)', color: '#D4A574' },
  { icon: 'trending-up', title: 'Рост', key: 'development', bg: 'rgba(74,130,96,0.06)', color: '#4A8260' },
  { icon: 'heart', title: 'Отношения', key: 'relations', bg: 'rgba(196,122,138,0.06)', color: '#C47A8A' },
];

const INSIGHT_SECTIONS_MBTI = [
  { icon: 'briefcase', title: 'Карьера', key: 'careers', bg: 'rgba(124,144,130,0.06)', color: '#7C9082' },
  { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: 'rgba(212,165,116,0.06)', color: '#D4A574' },
  { icon: 'trending-up', title: 'Рост', key: 'development', bg: 'rgba(74,130,96,0.06)', color: '#4A8260' },
  { icon: 'shield-alert', title: 'Слабые стороны', key: 'weaknesses', bg: 'rgba(196,122,138,0.06)', color: '#C47A8A' },
];

const SOCIONICS_INSIGHTS = {
  'ИЛЭ': { careers: ['Учёный', 'Программист', 'Предприниматель', 'Изобретатель'], strengths: ['Генерация идей', 'Видение возможностей', 'Креативность', 'Быстрая адаптация'], development: ['Развивать внимание к деталям', 'Учиться практичности', 'Доводить дела до конца'], relations: ['Дуал: СЭИ (Дюма)', 'Активация: ЭСЭ (Гюго)', 'Конфликт: ЭСИ (Драйзер)'] },
  'СЭИ': { careers: ['Дизайнер', 'Повар', 'Терапевт', 'Флорист'], strengths: ['Создание уюта', 'Забота о близких', 'Чувство прекрасного', 'Гармония'], development: ['Учиться стратегическому мышлению', 'Развивать аналитику', 'Ставить долгосрочные цели'], relations: ['Дуал: ИЛЭ (Дон Кихот)', 'Активация: ЛИЭ (Джек Лондон)', 'Конфликт: ЛИИ (Робеспьер)'] },
  'ЭСЭ': { careers: ['PR-менеджер', 'Учитель', 'Организатор мероприятий', 'Менеджер по продажам'], strengths: ['Энергичность', 'Общительность', 'Оптимизм', 'Эмоциональный заряд'], development: ['Развивать логическое мышление', 'Учиться дистанции', 'Контролировать эмоции'], relations: ['Дуал: ЛИИ (Робеспьер)', 'Активация: СЭИ (Дюма)', 'Конфликт: СЛИ (Габен)'] },
  'ЛИИ': { careers: ['Математик', 'Аналитик', 'Философ', 'Программист'], strengths: ['Системное мышление', 'Логический анализ', 'Структурирование', 'Объективность'], development: ['Развивать коммуникацию', 'Учиться эмоциональности', 'Быть гибче в отношениях'], relations: ['Дуал: ЭСЭ (Гюго)', 'Активация: ИЛЭ (Дон Кихот)', 'Конфликт: ИЭЭ (Гексли)'] },
  'ЭИЭ': { careers: ['Актёр', 'Психолог', 'Журналист', 'Режиссёр'], strengths: ['Эмоциональная глубина', 'Вдохновение других', 'Драматический талант', 'Эмпатия'], development: ['Развивать практичность', 'Учиться спокойствию', 'Контролировать драматизм'], relations: ['Дуал: ЛСИ (Максим Горький)', 'Активация: СЛЭ (Жуков)', 'Конфликт: СЛИ (Габен)'] },
  'ЛСИ': { careers: ['Военный', 'Юрист', 'Администратор', 'Инспектор'], strengths: ['Организованность', 'Надёжность', 'Дисциплина', 'Системный подход'], development: ['Развивать гибкость', 'Учиться принимать перемены', 'Быть открытее к новому'], relations: ['Дуал: ЭИЭ (Гамлет)', 'Активация: ИЭИ (Есенин)', 'Конфликт: ИЭЭ (Гексли)'] },
  'СЛЭ': { careers: ['Предприниматель', 'Спортсмен', 'Управленец', 'Кризис-менеджер'], strengths: ['Воля к победе', 'Решительность', 'Лидерство', 'Практичность'], development: ['Развивать дипломатичность', 'Учиться слушать других', 'Быть терпеливее'], relations: ['Дуал: ИЭИ (Есенин)', 'Активация: ЭИЭ (Гамлет)', 'Конфликт: ЭИИ (Достоевский)'] },
  'ИЭИ': { careers: ['Поэт', 'Музыкант', 'Консультант', 'Психолог'], strengths: ['Интуиция времени', 'Романтичность', 'Чуткость', 'Предвидение'], development: ['Развивать волю', 'Учиться настойчивости', 'Быть практичнее'], relations: ['Дуал: СЛЭ (Жуков)', 'Активация: ЛСИ (Максим Горький)', 'Конфликт: ЛСЭ (Штирлиц)'] },
  'СЭЭ': { careers: ['Политик', 'Актёр', 'Менеджер по продажам', 'Шоумен'], strengths: ['Харизма', 'Влияние на людей', 'Энергичность', 'Находчивость'], development: ['Развивать терпение', 'Учиться планированию', 'Углублять знания'], relations: ['Дуал: ИЛИ (Бальзак)', 'Активация: ЛИЭ (Джек Лондон)', 'Конфликт: ЛИИ (Робеспьер)'] },
  'ИЛИ': { careers: ['Аналитик', 'Финансист', 'Критик', 'Исследователь'], strengths: ['Глубокий анализ', 'Предвидение рисков', 'Скептицизм', 'Осторожность'], development: ['Развивать оптимизм', 'Учиться действовать', 'Быть решительнее'], relations: ['Дуал: СЭЭ (Наполеон)', 'Активация: ЭСИ (Драйзер)', 'Конфликт: ЭСЭ (Гюго)'] },
  'ЛИЭ': { careers: ['Бизнесмен', 'Инженер', 'Стратег', 'Менеджер проекта'], strengths: ['Деловая хватка', 'Стратегия', 'Эффективность', 'Целеустремлённость'], development: ['Развивать эмпатию', 'Учиться расслабляться', 'Заботиться о здоровье'], relations: ['Дуал: ЭСИ (Драйзер)', 'Активация: СЭЭ (Наполеон)', 'Конфликт: СЭИ (Дюма)'] },
  'ЭСИ': { careers: ['Врач', 'Соцработник', 'Учитель', 'Юрист'], strengths: ['Нравственность', 'Верность', 'Забота', 'Чувство долга'], development: ['Развивать гибкость', 'Учиться прощать', 'Быть объективнее'], relations: ['Дуал: ЛИЭ (Джек Лондон)', 'Активация: ИЛИ (Бальзак)', 'Конфликт: ИЛЭ (Дон Кихот)'] },
  'ЛСЭ': { careers: ['Управленец', 'Логист', 'Военный', 'Фермер'], strengths: ['Трудолюбие', 'Организация', 'Практичность', 'Ответственность'], development: ['Развивать воображение', 'Учиться мечтать', 'Быть гибче'], relations: ['Дуал: ЭИИ (Достоевский)', 'Активация: ИЭЭ (Гексли)', 'Конфликт: ИЭИ (Есенин)'] },
  'ЭИИ': { careers: ['Психолог', 'Писатель', 'Педагог', 'Консультант'], strengths: ['Глубокая эмпатия', 'Миротворчество', 'Мудрость', 'Понимание людей'], development: ['Развивать волю', 'Учиться отстаивать себя', 'Быть практичнее'], relations: ['Дуал: ЛСЭ (Штирлиц)', 'Активация: СЛЭ (Жуков)', 'Конфликт: СЛЭ (Жуков)'] },
  'ИЭЭ': { careers: ['Журналист', 'HR-менеджер', 'Тренер', 'Консультант'], strengths: ['Понимание людей', 'Оптимизм', 'Раскрытие потенциала', 'Креативность'], development: ['Развивать дисциплину', 'Учиться системности', 'Быть последовательнее'], relations: ['Дуал: СЛИ (Габен)', 'Активация: ЛСИ (Максим Горький)', 'Конфликт: ЛСИ (Максим Горький)'] },
  'СЛИ': { careers: ['Ремесленник', 'Инженер', 'Спортсмен', 'Технолог'], strengths: ['Мастерство', 'Спокойствие', 'Практичность', 'Надёжность'], development: ['Развивать общительность', 'Учиться выражать чувства', 'Быть активнее'], relations: ['Дуал: ИЭЭ (Гексли)', 'Активация: ЭИИ (Достоевский)', 'Конфликт: ЭИЭ (Гамлет)'] },
};

const ENNEAGRAM_INSIGHTS = {
  '1': { careers: ['Юрист', 'Редактор', 'Аудитор', 'Преподаватель'], strengths: ['Принципиальность', 'Честность', 'Организованность', 'Стремление к идеалу'], development: ['Принимать несовершенство', 'Учиться расслабляться', 'Развивать терпимость'], relations: ['Совместимы: Тип 7, Тип 2', 'Рост через: Тип 4', 'Сложно: Тип 8'] },
  '2': { careers: ['Врач', 'Психолог', 'Учитель', 'Волонтёр'], strengths: ['Щедрость', 'Эмпатия', 'Забота', 'Умение поддержать'], development: ['Учиться говорить нет', 'Заботиться о себе', 'Признавать свои потребности'], relations: ['Совместимы: Тип 4, Тип 8', 'Рост через: Тип 4', 'Сложно: Тип 5'] },
  '3': { careers: ['Менеджер', 'Маркетолог', 'Предприниматель', 'Тренер'], strengths: ['Амбициозность', 'Эффективность', 'Адаптивность', 'Мотивация'], development: ['Быть искренним', 'Ценить процесс', 'Принимать уязвимость'], relations: ['Совместимы: Тип 6, Тип 9', 'Рост через: Тип 6', 'Сложно: Тип 4'] },
  '4': { careers: ['Художник', 'Писатель', 'Дизайнер', 'Терапевт'], strengths: ['Творческость', 'Глубина чувств', 'Аутентичность', 'Интуиция'], development: ['Развивать дисциплину', 'Ценить обычное', 'Не идеализировать'], relations: ['Совместимы: Тип 1, Тип 9', 'Рост через: Тип 1', 'Сложно: Тип 3'] },
  '5': { careers: ['Аналитик', 'Исследователь', 'Учёный', 'Программист'], strengths: ['Глубокий анализ', 'Независимость', 'Объективность', 'Экспертиза'], development: ['Делиться чувствами', 'Доверять другим', 'Быть в моменте'], relations: ['Совместимы: Тип 8, Тип 2', 'Рост через: Тип 8', 'Сложно: Тип 7'] },
  '6': { careers: ['Юрист', 'Аналитик рисков', 'Охранник', 'Менеджер проекта'], strengths: ['Верность', 'Ответственность', 'Предусмотрительность', 'Командный дух'], development: ['Доверять себе', 'Уменьшить тревожность', 'Рисковать чаще'], relations: ['Совместимы: Тип 9, Тип 3', 'Рост через: Тип 9', 'Сложно: Тип 8'] },
  '7': { careers: ['Путешественник', 'Маркетолог', 'Ведущий', 'Предприниматель'], strengths: ['Оптимизм', 'Энтузиазм', 'Разносторонность', 'Креативность'], development: ['Учиться сосредоточенности', 'Принимать боль', 'Доводить до конца'], relations: ['Совместимы: Тип 1, Тип 5', 'Рост через: Тип 5', 'Сложно: Тип 6'] },
  '8': { careers: ['Руководитель', 'Предприниматель', 'Адвокат', 'Военный'], strengths: ['Лидерство', 'Решительность', 'Защита слабых', 'Сила воли'], development: ['Показывать уязвимость', 'Слушать других', 'Проявлять мягкость'], relations: ['Совместимы: Тип 2, Тип 9', 'Рост через: Тип 2', 'Сложно: Тип 6'] },
  '9': { careers: ['Медиатор', 'Консультант', 'Дипломат', 'Терапевт'], strengths: ['Миролюбие', 'Принятие', 'Гармония', 'Терпение'], development: ['Отстаивать себя', 'Принимать конфликт', 'Действовать решительно'], relations: ['Совместимы: Тип 3, Тип 6', 'Рост через: Тип 3', 'Сложно: Тип 8'] },
};

export class ResultDetailScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'result-detail-screen';
    this.resultId = null;
  }

  getElement() { return this.el; }

  setData(data) {
    this.resultId = data?.resultId;
    this.render();
  }

  render() {
    const result = this.resultId
      ? resultsStore.getAll().find(r => r.id === this.resultId)
      : null;

    if (!result) {
      this.el.innerHTML = '<div class="loading-screen"><div class="spinner"></div></div>';
      return;
    }

    const sm = getStateManager();
    const isPremium = sm ? sm.get('isPremium') : false;

    this.el.className = `result-detail-screen result-detail-screen--${result.framework}`;

    this.el.innerHTML = `
      <div class="status-bar"></div>
      <div class="result-detail__content">
        <button class="result-detail__back" id="result-back">
          <i data-lucide="arrow-left" style="width:18px;height:18px"></i> К результатам
        </button>
        ${this._renderHero(result, isPremium)}
        ${this._renderDimensions(result)}
        ${isPremium ? this._renderFamous(result) : ''}
        ${this._renderActions()}
      </div>
    `;

    this._bind(result);
    if (window.lucide) window.lucide.createIcons({ nodes: [this.el] });
  }

  _renderHero(result, isPremium) {
    const displayName = this._getDisplayName(result);
    const heroDesc = this._getHeroDesc(result);
    return `
      <div class="result-hero">
        <div class="result-hero__code">${result.typeCode}</div>
        <div class="result-hero__name">${displayName}</div>
        <div class="result-hero__desc">${heroDesc}</div>
        ${isPremium ? `<span class="result-hero__badge"><i data-lucide="crown" style="width:12px;height:12px"></i> Premium</span>` : ''}
      </div>
    `;
  }

  _renderDimensions(result) {
    const dims = result.dimensions || {};
    const bars = this._getDimensionBars(result.framework, dims);
    return `
      <div class="result-dimensions">
        <div class="result-dimensions__title">Ваши предпочтения</div>
        ${bars.map(d => this._renderDimBar(d)).join('')}
      </div>
    `;
  }

  _renderDimBar({ leftLabel, rightLabel, leftPercent }) {
    const rightPercent = 100 - leftPercent;
    const leftActive = leftPercent >= 50;
    return `
      <div class="dim-row">
        <div class="dim-row__labels">
          <span class="dim-row__label${leftActive ? ' dim-row__label--active' : ''}">${leftLabel}</span>
          <span class="dim-row__label${!leftActive ? ' dim-row__label--active' : ''}">${rightLabel}</span>
        </div>
        <div class="dim-row__bar">
          <div class="dim-row__fill" style="width:${leftPercent}%"></div>
        </div>
      </div>
    `;
  }

  _getInsightsData(result) {
    if (result.framework === 'socionics') return SOCIONICS_INSIGHTS[result.typeCode] || {};
    if (result.framework === 'enneagram') {
      const num = result.typeCode.replace(/\D/g, '');
      return ENNEAGRAM_INSIGHTS[num] || {};
    }
    return getAdvancedInsights()[result.typeCode] || {};
  }

  _renderInsights(result) {
    const typeInsights = this._getInsightsData(result);
    const sections = result.framework === 'mbti' ? INSIGHT_SECTIONS_MBTI : INSIGHT_SECTIONS_DEFAULT;
    return `
      <div class="result-insights">
        <div class="result-insights__title">Глубокий анализ</div>
        <div class="insights-carousel">
          ${sections.map(ins => {
            const items = typeInsights[ins.key] || [];
            const desc = items.length > 0 ? items.join(', ') : 'Нет данных';
            return `
              <div class="insight-card" style="background:${ins.bg}">
                <div class="insight-card__icon" style="color:${ins.color}">
                  <i data-lucide="${ins.icon}" style="width:20px;height:20px"></i>
                </div>
                <div class="insight-card__title">${ins.title}</div>
                <div class="insight-card__desc">${desc}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  _renderFamous(result) {
    const typeFamous = getFamousPersonalities()[result.typeCode] || [];
    if (typeFamous.length === 0) return '';
    return `
      <div class="result-famous">
        <div class="result-famous__title">Известные ${result.typeCode}</div>
        <div class="famous-list">
          ${typeFamous.slice(0, 3).map(p => `
            <div class="famous-card">
              <div class="famous-card__avatar"${p.image ? ` style="background-image:url(${p.image});background-size:cover"` : ''}></div>
              <div class="famous-card__info">
                <div class="famous-card__name">${p.name}</div>
                <div class="famous-card__role">${p.role || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderPremiumTeaser() {
    return `
      <div class="premium-teaser" id="premium-teaser">
        <div class="premium-teaser__icon-wrap">
          <i data-lucide="lock" style="width:20px;height:20px"></i>
        </div>
        <div class="premium-teaser__info">
          <span class="badge badge--gold premium-teaser__badge">Premium</span>
          <div class="premium-teaser__title">Открыть глубокий анализ</div>
          <div class="premium-teaser__desc">Расширенный анализ, известные совпадения и другое</div>
        </div>
        <i data-lucide="chevron-right" style="width:18px;height:18px;color:#C5C0B8"></i>
      </div>
    `;
  }

  _renderActions() {
    return `
      <div class="result-actions">
        <button class="btn-primary" id="result-share">
          <i data-lucide="share-2" style="width:16px;height:16px"></i> Поделиться
        </button>
        <button class="btn-secondary" id="result-retake">
          <i data-lucide="refresh-cw" style="width:16px;height:16px"></i> Пройти снова
        </button>
      </div>
    `;
  }

  _getDimensionBars(framework, dims) {
    if (framework === 'socionics') {
      return [
        { leftLabel: 'Логика (Л)', rightLabel: 'Этика (Э)', leftPercent: dims.L || 50 },
        { leftLabel: 'Интуиция (И)', rightLabel: 'Сенсорика (С)', leftPercent: dims.I || 50 },
        { leftLabel: 'Экстраверсия (Э)', rightLabel: 'Интроверсия (И)', leftPercent: dims.Ex || 50 },
        { leftLabel: 'Рациональность (Р)', rightLabel: 'Иррациональность (Ир)', leftPercent: dims.R || 50 },
      ];
    }
    if (framework === 'enneagram') {
      return [
        { leftLabel: 'Центр Сердца', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HC || 0) * 3)) },
        { leftLabel: 'Центр Головы', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HD || 0) * 3)) },
        { leftLabel: 'Центр Тела', rightLabel: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.BD || 0) * 3)) },
      ];
    }
    return [
      { leftLabel: 'Экстраверсия (E)', rightLabel: 'Интроверсия (I)', leftPercent: dims.E || 50 },
      { leftLabel: 'Сенсорика (S)', rightLabel: 'Интуиция (N)', leftPercent: dims.S || 50 },
      { leftLabel: 'Мышление (T)', rightLabel: 'Чувство (F)', leftPercent: dims.T || 50 },
      { leftLabel: 'Суждение (J)', rightLabel: 'Восприятие (P)', leftPercent: dims.J || 50 },
    ];
  }

  _getDisplayName(result) {
    if (result.framework === 'socionics' || result.framework === 'enneagram') {
      return result.typeName || result.typeCode;
    }
    const typeData = getTypeData()[result.typeCode] || {};
    return typeData.title || typeData.name || result.typeName || result.typeCode;
  }

  _getHeroDesc(result) {
    if (result.framework === 'socionics' || result.framework === 'enneagram') {
      return result.typeName ? `Тип личности ${result.typeCode}` : '';
    }
    const typeData = getTypeData()[result.typeCode] || {};
    return typeData.description || typeData.subtitle || `Тип личности ${result.typeCode}`;
  }

  _bind(result) {
    this.el.querySelector('#result-back')?.addEventListener('click', () => {
      router.closeOverlay();
      router.navigateTab('results');
    });

    this.el.querySelector('#premium-teaser')?.addEventListener('click', () => {
      router.openOverlay('premium-modal');
    });

    this.el.querySelector('#result-share')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: `Я — ${result.typeCode} (${result.typeName})`,
          url: window.location.href
        });
      }
    });

    this.el.querySelector('#result-retake')?.addEventListener('click', () => {
      router.closeOverlay();
      router.openOverlay('quiz', { framework: result.framework });
    });
  }
}
