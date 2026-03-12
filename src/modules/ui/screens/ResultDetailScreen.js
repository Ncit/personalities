import { router } from '../../router/Router.js';
import { resultsStore } from '../../results/ResultsStore.js';

function getStateManager() { return window.stateManager; }
function getTypeData() { return window.PERSONALITY_TYPES || {}; }
function getAdvancedInsights() { return window.ADVANCED_INSIGHTS || {}; }
function getFamousPersonalities() { return window.FAMOUS_PERSONALITIES || {}; }

const ICONS = {
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  trending: '<polyline points="23 6 13.5 17 8.5 12 1 22"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a1 1 0 0 0 0 1.83l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a1 1 0 0 0 0-1.83Z"></path><path d="m2.6 15.91 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"></path><path d="m2.6 11.09 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"></path>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h6.5l6.74-6.76Z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>'
};

const INSIGHT_SECTIONS_MBTI = [
  { icon: 'briefcase', title: 'Карьера', key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'shield', title: 'Слабые стороны', key: 'weaknesses', bg: '#E6498010', color: '#E64980' },
  { icon: 'trending', title: 'Рост', key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'message', title: 'Коммуникация', key: 'communication', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'flame', title: 'Под стрессом', key: 'stress', bg: '#FF692210', color: '#FF6922' },
];

const INSIGHT_SECTIONS_SOCIONICS = [
  { icon: 'briefcase', title: 'Карьера', key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'trending', title: 'Рост', key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'heart', title: 'Отношения', key: 'relations', bg: '#E6498010', color: '#E64980' },
  { icon: 'layers', title: 'Квадра', key: 'quadra', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'cpu', title: 'Функции', key: 'functions', bg: '#FF692210', color: '#FF6922' },
];

const INSIGHT_SECTIONS_ENNEAGRAM = [
  { icon: 'briefcase', title: 'Карьера', key: 'careers', bg: '#5C7CFA10', color: '#5C7CFA' },
  { icon: 'zap', title: 'Сильные стороны', key: 'strengths', bg: '#40C05710', color: '#40C057' },
  { icon: 'trending', title: 'Рост', key: 'development', bg: '#FAB00510', color: '#FAB005' },
  { icon: 'heart', title: 'Отношения', key: 'relations', bg: '#E6498010', color: '#E64980' },
  { icon: 'feather', title: 'Крылья', key: 'wings', bg: '#9775FA10', color: '#9775FA' },
  { icon: 'alert', title: 'Страхи и желания', key: 'fears', bg: '#FF692210', color: '#FF6922' },
];

const MBTI_EXTRA = {
  ISTJ: { communication: ['Прямой и конкретный', 'Предпочитает факты', 'Лаконичный стиль'], stress: ['Перегрузка обязанностями', 'Хаос и беспорядок', 'Непредсказуемые перемены'] },
  ISFJ: { communication: ['Тактичный и мягкий', 'Внимательный слушатель', 'Избегает конфликтов'], stress: ['Критика близких', 'Нарушение стабильности', 'Необходимость говорить нет'] },
  INFJ: { communication: ['Глубокий и вдумчивый', 'Метафоры и образы', 'Предпочитает один на один'], stress: ['Поверхностное общение', 'Конфликт ценностей', 'Слишком много общения'] },
  INTJ: { communication: ['Стратегический и прямой', 'Логичная аргументация', 'Минимум эмоций'], stress: ['Некомпетентность окружающих', 'Потеря контроля', 'Эмоциональные ситуации'] },
  ISTP: { communication: ['Краткий и по делу', 'Практичные решения', 'Действия вместо слов'], stress: ['Жёсткие правила', 'Эмоциональное давление', 'Рутина без свободы'] },
  ISFP: { communication: ['Тихий и искренний', 'Через творчество', 'Избегает споров'], stress: ['Давление решать быстро', 'Критика личности', 'Нарушение гармонии'] },
  INFP: { communication: ['Эмпатичный и глубокий', 'Через истории и ценности', 'Избегает грубости'], stress: ['Несправедливость', 'Ложь и фальшь', 'Утрата смысла'] },
  INTP: { communication: ['Аналитичный и точный', 'Любит дискуссии', 'Детальный и логичный'], stress: ['Эмоциональные требования', 'Давление на скорость', 'Нелогичные правила'] },
  ESTP: { communication: ['Энергичный и прямой', 'Юмор и харизма', 'Действие важнее слов'], stress: ['Бездействие', 'Скука и рутина', 'Слишком много теории'] },
  ESFP: { communication: ['Живой и выразительный', 'Позитивный настрой', 'Любит аудиторию'], stress: ['Изоляция', 'Строгие ограничения', 'Негативная атмосфера'] },
  ENFP: { communication: ['Вдохновляющий и живой', 'Идеи и возможности', 'Эмоциональная связь'], stress: ['Рутина и ограничения', 'Отвержение', 'Подавление креативности'] },
  ENTP: { communication: ['Провокационный и остроумный', 'Любит дебаты', 'Фонтан идей'], stress: ['Запрет на инновации', 'Догматизм', 'Медленные процессы'] },
  ESTJ: { communication: ['Чёткий и организованный', 'Прямые указания', 'Ценит результат'], stress: ['Нарушение правил', 'Лень окружающих', 'Потеря авторитета'] },
  ESFJ: { communication: ['Тёплый и заботливый', 'Гармония в группе', 'Активный слушатель'], stress: ['Неблагодарность', 'Конфликты в коллективе', 'Ощущение ненужности'] },
  ENFJ: { communication: ['Харизматичный и эмпатичный', 'Мотивирует других', 'Видит потенциал людей'], stress: ['Разочарование в людях', 'Конфликт ценностей', 'Невозможность помочь'] },
  ENTJ: { communication: ['Командный и решительный', 'Стратегическое видение', 'Ценит компетентность'], stress: ['Неэффективность', 'Эмоциональные сцены', 'Потеря влияния'] },
};

const SOCIONICS_INSIGHTS = {
  'ИЛЭ': { careers: ['Учёный', 'Программист', 'Предприниматель', 'Изобретатель'], strengths: ['Генерация идей', 'Видение возможностей', 'Креативность', 'Быстрая адаптация'], development: ['Развивать внимание к деталям', 'Учиться практичности', 'Доводить дела до конца'], relations: ['Дуал: СЭИ (Дюма)', 'Активация: ЭСЭ (Гюго)', 'Конфликт: ЭСИ (Драйзер)'], quadra: ['Альфа', 'Ценности: демократия, поиск нового', 'Стихия: воздух и идеи'], functions: ['Базовая: интуиция возможностей', 'Творческая: структурная логика', 'Болевая: этика отношений'] },
  'СЭИ': { careers: ['Дизайнер', 'Повар', 'Терапевт', 'Флорист'], strengths: ['Создание уюта', 'Забота о близких', 'Чувство прекрасного', 'Гармония'], development: ['Учиться стратегическому мышлению', 'Развивать аналитику', 'Ставить долгосрочные цели'], relations: ['Дуал: ИЛЭ (Дон Кихот)', 'Активация: ЛИЭ (Джек Лондон)', 'Конфликт: ЛИИ (Робеспьер)'], quadra: ['Альфа', 'Ценности: комфорт, позитив', 'Стихия: уют и радость'], functions: ['Базовая: сенсорика ощущений', 'Творческая: этика эмоций', 'Болевая: структурная логика'] },
  'ЭСЭ': { careers: ['PR-менеджер', 'Учитель', 'Организатор мероприятий', 'Менеджер по продажам'], strengths: ['Энергичность', 'Общительность', 'Оптимизм', 'Эмоциональный заряд'], development: ['Развивать логическое мышление', 'Учиться дистанции', 'Контролировать эмоции'], relations: ['Дуал: ЛИИ (Робеспьер)', 'Активация: СЭИ (Дюма)', 'Конфликт: СЛИ (Габен)'], quadra: ['Альфа', 'Ценности: веселье, общение', 'Стихия: энергия и праздник'], functions: ['Базовая: этика эмоций', 'Творческая: сенсорика ощущений', 'Болевая: интуиция времени'] },
  'ЛИИ': { careers: ['Математик', 'Аналитик', 'Философ', 'Программист'], strengths: ['Системное мышление', 'Логический анализ', 'Структурирование', 'Объективность'], development: ['Развивать коммуникацию', 'Учиться эмоциональности', 'Быть гибче в отношениях'], relations: ['Дуал: ЭСЭ (Гюго)', 'Активация: ИЛЭ (Дон Кихот)', 'Конфликт: ИЭЭ (Гексли)'], quadra: ['Альфа', 'Ценности: истина и система', 'Стихия: структура и ясность'], functions: ['Базовая: структурная логика', 'Творческая: интуиция возможностей', 'Болевая: сенсорика ощущений'] },
  'ЭИЭ': { careers: ['Актёр', 'Психолог', 'Журналист', 'Режиссёр'], strengths: ['Эмоциональная глубина', 'Вдохновение других', 'Драматический талант', 'Эмпатия'], development: ['Развивать практичность', 'Учиться спокойствию', 'Контролировать драматизм'], relations: ['Дуал: ЛСИ (Максим Горький)', 'Активация: СЛЭ (Жуков)', 'Конфликт: СЛИ (Габен)'], quadra: ['Бета', 'Ценности: иерархия, страсть', 'Стихия: огонь и воля'], functions: ['Базовая: этика эмоций', 'Творческая: интуиция времени', 'Болевая: деловая логика'] },
  'ЛСИ': { careers: ['Военный', 'Юрист', 'Администратор', 'Инспектор'], strengths: ['Организованность', 'Надёжность', 'Дисциплина', 'Системный подход'], development: ['Развивать гибкость', 'Учиться принимать перемены', 'Быть открытее к новому'], relations: ['Дуал: ЭИЭ (Гамлет)', 'Активация: ИЭИ (Есенин)', 'Конфликт: ИЭЭ (Гексли)'], quadra: ['Бета', 'Ценности: порядок, система', 'Стихия: структура и власть'], functions: ['Базовая: структурная логика', 'Творческая: волевая сенсорика', 'Болевая: интуиция возможностей'] },
  'СЛЭ': { careers: ['Предприниматель', 'Спортсмен', 'Управленец', 'Кризис-менеджер'], strengths: ['Воля к победе', 'Решительность', 'Лидерство', 'Практичность'], development: ['Развивать дипломатичность', 'Учиться слушать других', 'Быть терпеливее'], relations: ['Дуал: ИЭИ (Есенин)', 'Активация: ЭИЭ (Гамлет)', 'Конфликт: ЭИИ (Достоевский)'], quadra: ['Бета', 'Ценности: сила, действие', 'Стихия: воля и натиск'], functions: ['Базовая: волевая сенсорика', 'Творческая: структурная логика', 'Болевая: этика отношений'] },
  'ИЭИ': { careers: ['Поэт', 'Музыкант', 'Консультант', 'Психолог'], strengths: ['Интуиция времени', 'Романтичность', 'Чуткость', 'Предвидение'], development: ['Развивать волю', 'Учиться настойчивости', 'Быть практичнее'], relations: ['Дуал: СЛЭ (Жуков)', 'Активация: ЛСИ (Максим Горький)', 'Конфликт: ЛСЭ (Штирлиц)'], quadra: ['Бета', 'Ценности: глубина, время', 'Стихия: мечты и предчувствия'], functions: ['Базовая: интуиция времени', 'Творческая: этика эмоций', 'Болевая: деловая логика'] },
  'СЭЭ': { careers: ['Политик', 'Актёр', 'Менеджер по продажам', 'Шоумен'], strengths: ['Харизма', 'Влияние на людей', 'Энергичность', 'Находчивость'], development: ['Развивать терпение', 'Учиться планированию', 'Углублять знания'], relations: ['Дуал: ИЛИ (Бальзак)', 'Активация: ЛИЭ (Джек Лондон)', 'Конфликт: ЛИИ (Робеспьер)'], quadra: ['Гамма', 'Ценности: успех, прагматизм', 'Стихия: амбиции и влияние'], functions: ['Базовая: волевая сенсорика', 'Творческая: этика отношений', 'Болевая: структурная логика'] },
  'ИЛИ': { careers: ['Аналитик', 'Финансист', 'Критик', 'Исследователь'], strengths: ['Глубокий анализ', 'Предвидение рисков', 'Скептицизм', 'Осторожность'], development: ['Развивать оптимизм', 'Учиться действовать', 'Быть решительнее'], relations: ['Дуал: СЭЭ (Наполеон)', 'Активация: ЭСИ (Драйзер)', 'Конфликт: ЭСЭ (Гюго)'], quadra: ['Гамма', 'Ценности: реализм, глубина', 'Стихия: анализ и прогноз'], functions: ['Базовая: интуиция времени', 'Творческая: деловая логика', 'Болевая: этика эмоций'] },
  'ЛИЭ': { careers: ['Бизнесмен', 'Инженер', 'Стратег', 'Менеджер проекта'], strengths: ['Деловая хватка', 'Стратегия', 'Эффективность', 'Целеустремлённость'], development: ['Развивать эмпатию', 'Учиться расслабляться', 'Заботиться о здоровье'], relations: ['Дуал: ЭСИ (Драйзер)', 'Активация: СЭЭ (Наполеон)', 'Конфликт: СЭИ (Дюма)'], quadra: ['Гамма', 'Ценности: прибыль, результат', 'Стихия: дело и стратегия'], functions: ['Базовая: деловая логика', 'Творческая: интуиция возможностей', 'Болевая: волевая сенсорика'] },
  'ЭСИ': { careers: ['Врач', 'Соцработник', 'Учитель', 'Юрист'], strengths: ['Нравственность', 'Верность', 'Забота', 'Чувство долга'], development: ['Развивать гибкость', 'Учиться прощать', 'Быть объективнее'], relations: ['Дуал: ЛИЭ (Джек Лондон)', 'Активация: ИЛИ (Бальзак)', 'Конфликт: ИЛЭ (Дон Кихот)'], quadra: ['Гамма', 'Ценности: мораль, верность', 'Стихия: долг и забота'], functions: ['Базовая: этика отношений', 'Творческая: волевая сенсорика', 'Болевая: интуиция возможностей'] },
  'ЛСЭ': { careers: ['Управленец', 'Логист', 'Военный', 'Фермер'], strengths: ['Трудолюбие', 'Организация', 'Практичность', 'Ответственность'], development: ['Развивать воображение', 'Учиться мечтать', 'Быть гибче'], relations: ['Дуал: ЭИИ (Достоевский)', 'Активация: ИЭЭ (Гексли)', 'Конфликт: ИЭИ (Есенин)'], quadra: ['Дельта', 'Ценности: труд, порядок', 'Стихия: дело и практика'], functions: ['Базовая: деловая логика', 'Творческая: сенсорика ощущений', 'Болевая: этика эмоций'] },
  'ЭИИ': { careers: ['Психолог', 'Писатель', 'Педагог', 'Консультант'], strengths: ['Глубокая эмпатия', 'Миротворчество', 'Мудрость', 'Понимание людей'], development: ['Развивать волю', 'Учиться отстаивать себя', 'Быть практичнее'], relations: ['Дуал: ЛСЭ (Штирлиц)', 'Активация: СЛИ (Габен)', 'Конфликт: СЛЭ (Жуков)'], quadra: ['Дельта', 'Ценности: гуманизм, гармония', 'Стихия: мудрость и мир'], functions: ['Базовая: этика отношений', 'Творческая: интуиция времени', 'Болевая: волевая сенсорика'] },
  'ИЭЭ': { careers: ['Журналист', 'HR-менеджер', 'Тренер', 'Консультант'], strengths: ['Понимание людей', 'Оптимизм', 'Раскрытие потенциала', 'Креативность'], development: ['Развивать дисциплину', 'Учиться системности', 'Быть последовательнее'], relations: ['Дуал: СЛИ (Габен)', 'Активация: ЛСЭ (Штирлиц)', 'Конфликт: ЛСИ (Максим Горький)'], quadra: ['Дельта', 'Ценности: потенциал, идеи', 'Стихия: вдохновение и люди'], functions: ['Базовая: интуиция возможностей', 'Творческая: этика отношений', 'Болевая: сенсорика ощущений'] },
  'СЛИ': { careers: ['Ремесленник', 'Инженер', 'Спортсмен', 'Технолог'], strengths: ['Мастерство', 'Спокойствие', 'Практичность', 'Надёжность'], development: ['Развивать общительность', 'Учиться выражать чувства', 'Быть активнее'], relations: ['Дуал: ИЭЭ (Гексли)', 'Активация: ЭИИ (Достоевский)', 'Конфликт: ЭИЭ (Гамлет)'], quadra: ['Дельта', 'Ценности: мастерство, покой', 'Стихия: ремесло и комфорт'], functions: ['Базовая: сенсорика ощущений', 'Творческая: деловая логика', 'Болевая: этика эмоций'] },
};

const ENNEAGRAM_INSIGHTS = {
  '1': { careers: ['Юрист', 'Редактор', 'Аудитор', 'Преподаватель'], strengths: ['Принципиальность', 'Честность', 'Организованность', 'Стремление к идеалу'], development: ['Принимать несовершенство', 'Учиться расслабляться', 'Развивать терпимость'], relations: ['Совместимы: Тип 7, Тип 2', 'Рост через: Тип 7', 'Сложно: Тип 8'], wings: ['1w9 — Идеалист: спокойный, сдержанный перфекционист', '1w2 — Адвокат: страстный борец за справедливость'], fears: ['Страх: быть испорченным, неправильным', 'Желание: быть хорошим и правильным', 'Стресс → Тип 4: драматизм'] },
  '2': { careers: ['Врач', 'Психолог', 'Учитель', 'Волонтёр'], strengths: ['Щедрость', 'Эмпатия', 'Забота', 'Умение поддержать'], development: ['Учиться говорить нет', 'Заботиться о себе', 'Признавать свои потребности'], relations: ['Совместимы: Тип 4, Тип 8', 'Рост через: Тип 4', 'Сложно: Тип 5'], wings: ['2w1 — Слуга: альтруистичный, принципиальный помощник', '2w3 — Хозяин: обаятельный, амбициозный покровитель'], fears: ['Страх: быть нелюбимым и ненужным', 'Желание: чувствовать себя любимым', 'Стресс → Тип 8: агрессивность'] },
  '3': { careers: ['Менеджер', 'Маркетолог', 'Предприниматель', 'Тренер'], strengths: ['Амбициозность', 'Эффективность', 'Адаптивность', 'Мотивация'], development: ['Быть искренним', 'Ценить процесс', 'Принимать уязвимость'], relations: ['Совместимы: Тип 6, Тип 9', 'Рост через: Тип 6', 'Сложно: Тип 4'], wings: ['3w2 — Звезда: обаятельный, общительный лидер', '3w4 — Профессионал: утончённый, глубокий эксперт'], fears: ['Страх: быть никчёмным, неуспешным', 'Желание: быть ценным и успешным', 'Стресс → Тип 9: апатия'] },
  '4': { careers: ['Художник', 'Писатель', 'Дизайнер', 'Терапевт'], strengths: ['Творческость', 'Глубина чувств', 'Аутентичность', 'Интуиция'], development: ['Развивать дисциплину', 'Ценить обычное', 'Не идеализировать'], relations: ['Совместимы: Тип 1, Тип 9', 'Рост через: Тип 1', 'Сложно: Тип 3'], wings: ['4w3 — Аристократ: амбициозный, выразительный творец', '4w5 — Богемист: глубокий, замкнутый мыслитель'], fears: ['Страх: не иметь идентичности', 'Желание: быть уникальным и настоящим', 'Стресс → Тип 2: навязчивость'] },
  '5': { careers: ['Аналитик', 'Исследователь', 'Учёный', 'Программист'], strengths: ['Глубокий анализ', 'Независимость', 'Объективность', 'Экспертиза'], development: ['Делиться чувствами', 'Доверять другим', 'Быть в моменте'], relations: ['Совместимы: Тип 8, Тип 2', 'Рост через: Тип 8', 'Сложно: Тип 7'], wings: ['5w4 — Иконоборец: творческий, оригинальный мыслитель', '5w6 — Решатель проблем: практичный, лояльный аналитик'], fears: ['Страх: быть беспомощным, некомпетентным', 'Желание: быть компетентным и знающим', 'Стресс → Тип 7: рассеянность'] },
  '6': { careers: ['Юрист', 'Аналитик рисков', 'Охранник', 'Менеджер проекта'], strengths: ['Верность', 'Ответственность', 'Предусмотрительность', 'Командный дух'], development: ['Доверять себе', 'Уменьшить тревожность', 'Рисковать чаще'], relations: ['Совместимы: Тип 9, Тип 3', 'Рост через: Тип 9', 'Сложно: Тип 8'], wings: ['6w5 — Защитник: осторожный, аналитичный стратег', '6w7 — Приятель: общительный, оптимистичный товарищ'], fears: ['Страх: остаться без поддержки и защиты', 'Желание: иметь безопасность и опору', 'Стресс → Тип 3: обман'] },
  '7': { careers: ['Путешественник', 'Маркетолог', 'Ведущий', 'Предприниматель'], strengths: ['Оптимизм', 'Энтузиазм', 'Разносторонность', 'Креативность'], development: ['Учиться сосредоточенности', 'Принимать боль', 'Доводить до конца'], relations: ['Совместимы: Тип 1, Тип 5', 'Рост через: Тип 5', 'Сложно: Тип 6'], wings: ['7w6 — Массовик-затейник: весёлый, верный организатор', '7w8 — Реалист: решительный, прямолинейный искатель'], fears: ['Страх: быть лишённым, в ловушке боли', 'Желание: быть счастливым и удовлетворённым', 'Стресс → Тип 1: критичность'] },
  '8': { careers: ['Руководитель', 'Предприниматель', 'Адвокат', 'Военный'], strengths: ['Лидерство', 'Решительность', 'Защита слабых', 'Сила воли'], development: ['Показывать уязвимость', 'Слушать других', 'Проявлять мягкость'], relations: ['Совместимы: Тип 2, Тип 9', 'Рост через: Тип 2', 'Сложно: Тип 6'], wings: ['8w7 — Независимый: энергичный, дерзкий лидер', '8w9 — Медведь: спокойный, мощный защитник'], fears: ['Страх: быть контролируемым, уязвимым', 'Желание: защитить себя и свою свободу', 'Стресс → Тип 5: изоляция'] },
  '9': { careers: ['Медиатор', 'Консультант', 'Дипломат', 'Терапевт'], strengths: ['Миролюбие', 'Принятие', 'Гармония', 'Терпение'], development: ['Отстаивать себя', 'Принимать конфликт', 'Действовать решительно'], relations: ['Совместимы: Тип 3, Тип 6', 'Рост через: Тип 3', 'Сложно: Тип 8'], wings: ['9w8 — Арбитр: уверенный, решительный миротворец', '9w1 — Мечтатель: идеалистичный, спокойный созерцатель'], fears: ['Страх: потеря и разделение, конфликт', 'Желание: внутренний мир и гармония', 'Стресс → Тип 6: тревожность'] },
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg> К результатам
        </button>
        ${this._renderHero(result, isPremium)}
        ${this._renderDimensions(result)}
        ${isPremium ? this._renderAnalytics(result) : ''}
        ${isPremium ? this._renderInsights(result) : this._renderPremiumTeaser()}
        ${this._renderFamous(result)}
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
        ${isPremium ? `<span class="result-hero__badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"></path><path d="M3 20h18"></path></svg> Премиум</span>` : ''}
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

  _getFrameworkTheme(framework) {
    if (framework === 'socionics') return {
      colors: ['#E8A85C', '#C4843A', '#D4A574', '#B8894E'],
      primary: '#E8A85C', primaryRgb: '232,168,92',
      strengths: ['Логическое', 'Интуитивное', 'Коммуникативное', 'Организаторское'],
    };
    if (framework === 'enneagram') return {
      colors: ['#C47A8A', '#A05A6A', '#C49A7A'],
      primary: '#C47A8A', primaryRgb: '196,122,138',
      strengths: ['Эмоциональное', 'Интеллектуальное', 'Инстинктивное'],
    };
    return {
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      primary: '#7C9082', primaryRgb: '124,144,130',
      strengths: ['Аналитический', 'Креативный', 'Социальный', 'Организованный'],
    };
  }

  _renderAnalytics(result) {
    const dims = result.dimensions || {};
    const bars = this._getDimensionBars(result.framework, dims);
    const values = bars.map(b => b.leftPercent);
    const leftLabels = bars.map(b => b.shortLeft || b.leftLabel);
    const rightLabels = bars.map(b => b.shortRight ?? b.rightLabel);
    const labels = bars.map(b => {
      const sl = b.shortLeft || b.leftLabel;
      const sr = b.shortRight ?? b.rightLabel;
      return sr ? `${sl}/${sr}` : sl;
    });
    const theme = this._getFrameworkTheme(result.framework);
    const colors = theme.colors;

    // 1. Radar chart
    const cx = 120, cy = 120, r = 90;
    const n = values.length;
    const angleStep = (2 * Math.PI) / n;
    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(s =>
      `<circle cx="${cx}" cy="${cy}" r="${r * s}" fill="none" stroke="#E8E4DF" stroke-width="1"/>`
    ).join('');
    const axes = labels.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="#E8E4DF" stroke-width="1"/>`;
    }).join('');
    const axisLabels = labels.map((lbl, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<text x="${cx + (r + 18) * Math.cos(angle)}" y="${cy + (r + 18) * Math.sin(angle)}" text-anchor="middle" dominant-baseline="middle" font-size="${n <= 3 ? 11 : 10}" fill="#8A8A8A" font-family="Inter,sans-serif">${lbl}</text>`;
    }).join('');
    const pts = values.map((v, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${cx + (r * v / 100) * Math.cos(angle)},${cy + (r * v / 100) * Math.sin(angle)}`;
    }).join(' ');
    const radarDots = values.map((v, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `<circle cx="${cx + (r * v / 100) * Math.cos(angle)}" cy="${cy + (r * v / 100) * Math.sin(angle)}" r="4" fill="#fff" stroke="${theme.primary}" stroke-width="2"/>`;
    }).join('');
    const radarSvg = `<svg viewBox="0 0 240 240" width="100%" style="max-width:240px">${gridCircles}${axes}<polygon points="${pts}" fill="rgba(${theme.primaryRgb},0.2)" stroke="${theme.primary}" stroke-width="2"/>${radarDots}${axisLabels}</svg>`;

    // 2. Bar chart (Сравнение измерений)
    const barW = 40, barGap = 20, barMaxH = 100;
    const svgW = n * (barW + barGap) - barGap + 40;
    const baseY = barMaxH + 30;
    const barsSvg = values.map((v, i) => {
      const x = 20 + i * (barW + barGap);
      const h = (v / 100) * barMaxH;
      return `<rect x="${x}" y="${baseY - h}" width="${barW}" height="${h}" rx="6" fill="${colors[i % colors.length]}"/>
        <text x="${x + barW / 2}" y="${baseY - h - 8}" text-anchor="middle" font-size="12" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${Math.round(v)}%</text>
        <text x="${x + barW / 2}" y="${baseY + 16}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${leftLabels[i]}</text>`;
    }).join('');
    const chartSvg = `<svg viewBox="0 0 ${svgW} ${baseY + 30}" width="100%">${barsSvg}</svg>`;

    // 3. Balance chart (Баланс личности)
    const balRowH = 28, balGap = 8, balBarW = 120, balX = 90, balRightX = balX + balBarW + 8;
    const balSvgH = n * (balRowH + balGap) + 10;
    const balSvgW = balRightX + 70;
    const balRows = values.map((v, i) => {
      const y = 10 + i * (balRowH + balGap);
      const leftW = (v / 100) * balBarW;
      const rightW = balBarW - leftW;
      const midX = balX + leftW;
      const rightText = rightLabels[i] ? `${rightLabels[i]} ${100 - Math.round(v)}%` : '';
      return `
        <text x="${balX - 6}" y="${y + 16}" text-anchor="end" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${leftLabels[i]} ${Math.round(v)}%</text>
        <rect x="${balX}" y="${y}" width="${leftW}" height="${balRowH}" rx="4" fill="${colors[i % colors.length]}"/>
        <rect x="${midX}" y="${y}" width="${rightW}" height="${balRowH}" rx="4" fill="#E8E4DF"/>
        <circle cx="${midX}" cy="${y + balRowH / 2}" r="6" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2"/>
        <text x="${balRightX}" y="${y + 16}" text-anchor="start" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">${rightText}</text>`;
    }).join('');
    const balanceSvg = `<svg viewBox="0 0 ${balSvgW} ${balSvgH}" width="100%">${balRows}</svg>`;

    // 4. Pie chart (Распределение предпочтений)
    const pieCx = 70, pieCy = 70, pieR = 60;
    const total = values.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;
    const pieSlices = values.map((v, i) => {
      const sliceAngle = (v / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const x1 = pieCx + pieR * Math.cos(startAngle);
      const y1 = pieCy + pieR * Math.sin(startAngle);
      const x2 = pieCx + pieR * Math.cos(endAngle);
      const y2 = pieCy + pieR * Math.sin(endAngle);
      const large = sliceAngle > Math.PI ? 1 : 0;
      const d = `M${pieCx},${pieCy} L${x1},${y1} A${pieR},${pieR} 0 ${large} 1 ${x2},${y2} Z`;
      startAngle = endAngle;
      return `<path d="${d}" fill="${colors[i % colors.length]}"/>`;
    }).join('');
    const pieH = Math.max(140, n * 22 + 30);
    const pieLegX = 150;
    const pieLegend = leftLabels.map((lbl, i) => {
      const ly = 20 + i * 22;
      return `<rect x="${pieLegX}" y="${ly}" width="10" height="10" rx="2" fill="${colors[i % colors.length]}"/>
        <text x="${pieLegX + 16}" y="${ly + 9}" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${lbl}: ${Math.round(values[i])}%</text>`;
    }).join('');
    const pieSvg = `<svg viewBox="0 0 280 ${pieH}" width="100%">${pieSlices}${pieLegend}</svg>`;

    // 5. Framework-specific extra chart
    let extraChart = '';
    if (result.framework === 'socionics') {
      // Socionics: Cognitive functions stack
      const funcs = this._getSocionicsFunctions(result.typeCode);
      const fBarMaxW = 100, fBarH = 20, fLabelW = 160, fRowGap = 10;
      const fSvgH = funcs.length * (fBarH + fRowGap) + 10;
      const fSvgW = fLabelW + fBarMaxW + 50;
      const funcRows = funcs.map((f, i) => {
        const y = 10 + i * (fBarH + fRowGap);
        const w = (f.strength / 100) * fBarMaxW;
        return `
          <text x="${fLabelW - 8}" y="${y + 15}" text-anchor="end" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${f.label}</text>
          <rect x="${fLabelW}" y="${y}" width="${fBarMaxW}" height="${fBarH}" rx="4" fill="#F0EDE8"/>
          <rect x="${fLabelW}" y="${y}" width="${w}" height="${fBarH}" rx="4" fill="${colors[i % colors.length]}"/>
          <text x="${fLabelW + fBarMaxW + 8}" y="${y + 15}" font-size="11" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${f.strength}%</text>`;
      }).join('');
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">Стек функций</div>
          <svg viewBox="0 0 ${fSvgW} ${fSvgH}" width="100%">${funcRows}</svg>
        </div>`;
    } else if (result.framework === 'enneagram') {
      // Enneagram: Triadic centers visualization
      const centers = [
        { label: 'Сердце', value: Math.max(10, Math.min(90, 50 + (dims.HC ?? 0) * 3)), color: colors[0] },
        { label: 'Голова', value: Math.max(10, Math.min(90, 50 + (dims.HD ?? 0) * 3)), color: colors[1] },
        { label: 'Тело', value: Math.max(10, Math.min(90, 50 + (dims.BD ?? 0) * 3)), color: colors[2] },
      ];
      const triR = 60, triCx = 130, triCy = 110;
      const triPts = centers.map((c, i) => {
        const angle = i * (2 * Math.PI / 3) - Math.PI / 2;
        const dist = triR * (c.value / 100);
        return { x: triCx + dist * Math.cos(angle), y: triCy + dist * Math.sin(angle), lx: triCx + (triR + 30) * Math.cos(angle), ly: triCy + (triR + 30) * Math.sin(angle) };
      });
      const triGrid = [0.33, 0.66, 1.0].map(s =>
        `<polygon points="${centers.map((_, i) => { const a = i * (2 * Math.PI / 3) - Math.PI / 2; return `${triCx + triR * s * Math.cos(a)},${triCy + triR * s * Math.sin(a)}`; }).join(' ')}" fill="none" stroke="#E8E4DF" stroke-width="1"/>`
      ).join('');
      const triShape = `<polygon points="${triPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(${theme.primaryRgb},0.2)" stroke="${theme.primary}" stroke-width="2"/>`;
      const triDots = triPts.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${centers[i].color}"/>`).join('');
      const triLabels = centers.map((c, i) => `<text x="${triPts[i].lx}" y="${triPts[i].ly}" text-anchor="middle" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">${c.label} ${c.value}%</text>`).join('');
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">Центры энергии</div>
          <svg viewBox="0 0 260 230" width="100%" style="max-width:260px">${triGrid}${triShape}${triDots}${triLabels}</svg>
        </div>`;
    } else {
      // MBTI: Timeline
      const tlY = 50, tlX1 = 30, tlX2 = 270, tlMid = 150;
      extraChart = `
        <div class="result-analytics__card">
          <div class="result-analytics__card-title">Временная линия личности</div>
          <svg viewBox="0 0 300 100" width="100%">
            <line x1="${tlX1}" y1="${tlY}" x2="${tlX2}" y2="${tlY}" stroke="#E8E4DF" stroke-width="3" stroke-linecap="round"/>
            <circle cx="${tlX1 + 40}" cy="${tlY}" r="5" fill="#C5C0B8"/>
            <circle cx="${tlMid}" cy="${tlY}" r="8" fill="${theme.primary}"/>
            <circle cx="${tlMid}" cy="${tlY}" r="12" fill="none" stroke="${colors[3] || colors[0]}" stroke-width="2"/>
            <circle cx="${tlX2 - 40}" cy="${tlY}" r="5" fill="#C5C0B8"/>
            <text x="${tlX1 + 40}" y="${tlY + 22}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">Прошлое</text>
            <text x="${tlMid}" y="${tlY - 20}" text-anchor="middle" font-size="11" fill="#2D2D2D" font-family="Inter,sans-serif">Текущая позиция</text>
            <text x="${tlMid}" y="${tlY + 22}" text-anchor="middle" font-size="11" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">Настоящее</text>
            <text x="${tlX2 - 40}" y="${tlY + 22}" text-anchor="middle" font-size="11" fill="#8A8A8A" font-family="Inter,sans-serif">Будущее</text>
          </svg>
        </div>`;
    }

    // 6. Strengths chart (framework-specific)
    const sLabels = theme.strengths;
    const sValues = sLabels.map((_, i) => values[i % values.length] || 50);
    const sBarMaxW = 100, sBarH = 20, sLabelW = 140, sRowGap = 12;
    const sSvgH = sLabels.length * (sBarH + sRowGap) + 10;
    const sSvgW = sLabelW + sBarMaxW + 50;
    const strengthRows = sLabels.map((lbl, i) => {
      const y = 10 + i * (sBarH + sRowGap);
      const w = (sValues[i] / 100) * sBarMaxW;
      return `
        <text x="${sLabelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="#2D2D2D" font-family="Inter,sans-serif">${lbl}</text>
        <rect x="${sLabelW}" y="${y}" width="${sBarMaxW}" height="${sBarH}" rx="4" fill="#F0EDE8"/>
        <rect x="${sLabelW}" y="${y}" width="${w}" height="${sBarH}" rx="4" fill="${colors[i % colors.length]}"/>
        <text x="${sLabelW + sBarMaxW + 8}" y="${y + 15}" font-size="12" font-weight="600" fill="#2D2D2D" font-family="Inter,sans-serif">${Math.round(sValues[i])}%</text>`;
    }).join('');
    const strengthsSvg = `<svg viewBox="0 0 ${sSvgW} ${sSvgH}" width="100%">${strengthRows}</svg>`;

    return `
      <div class="result-analytics">
        <div class="result-analytics__title">Визуальная аналитика</div>
        <div class="result-analytics__grid">
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">Радарная диаграмма</div>
            ${radarSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">Сравнение измерений</div>
            ${chartSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">Баланс личности</div>
            ${balanceSvg}
          </div>
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">Распределение предпочтений</div>
            ${pieSvg}
          </div>
          ${extraChart}
          <div class="result-analytics__card">
            <div class="result-analytics__card-title">Анализ сильных сторон</div>
            ${strengthsSvg}
          </div>
        </div>
      </div>
    `;
  }

  _getSocionicsFunctions(typeCode) {
    const FUNC_MAP = {
      'ИЛЭ': [{ label: 'Интуиция возможностей', strength: 90 }, { label: 'Структурная логика', strength: 75 }, { label: 'Этика эмоций', strength: 40 }, { label: 'Сенсорика ощущений', strength: 25 }],
      'СЭИ': [{ label: 'Сенсорика ощущений', strength: 90 }, { label: 'Этика эмоций', strength: 75 }, { label: 'Структурная логика', strength: 40 }, { label: 'Интуиция возможностей', strength: 25 }],
      'ЭСЭ': [{ label: 'Этика эмоций', strength: 90 }, { label: 'Сенсорика ощущений', strength: 75 }, { label: 'Интуиция времени', strength: 40 }, { label: 'Деловая логика', strength: 25 }],
      'ЛИИ': [{ label: 'Структурная логика', strength: 90 }, { label: 'Интуиция возможностей', strength: 75 }, { label: 'Сенсорика ощущений', strength: 40 }, { label: 'Этика эмоций', strength: 25 }],
      'ЭИЭ': [{ label: 'Этика эмоций', strength: 90 }, { label: 'Интуиция времени', strength: 75 }, { label: 'Деловая логика', strength: 40 }, { label: 'Сенсорика ощущений', strength: 25 }],
      'ЛСИ': [{ label: 'Структурная логика', strength: 90 }, { label: 'Волевая сенсорика', strength: 75 }, { label: 'Интуиция возможностей', strength: 40 }, { label: 'Этика отношений', strength: 25 }],
      'СЛЭ': [{ label: 'Волевая сенсорика', strength: 90 }, { label: 'Структурная логика', strength: 75 }, { label: 'Этика отношений', strength: 40 }, { label: 'Интуиция времени', strength: 25 }],
      'ИЭИ': [{ label: 'Интуиция времени', strength: 90 }, { label: 'Этика эмоций', strength: 75 }, { label: 'Деловая логика', strength: 40 }, { label: 'Волевая сенсорика', strength: 25 }],
      'СЭЭ': [{ label: 'Волевая сенсорика', strength: 90 }, { label: 'Этика отношений', strength: 75 }, { label: 'Структурная логика', strength: 40 }, { label: 'Интуиция времени', strength: 25 }],
      'ИЛИ': [{ label: 'Интуиция времени', strength: 90 }, { label: 'Деловая логика', strength: 75 }, { label: 'Этика эмоций', strength: 40 }, { label: 'Волевая сенсорика', strength: 25 }],
      'ЛИЭ': [{ label: 'Деловая логика', strength: 90 }, { label: 'Интуиция возможностей', strength: 75 }, { label: 'Волевая сенсорика', strength: 40 }, { label: 'Этика отношений', strength: 25 }],
      'ЭСИ': [{ label: 'Этика отношений', strength: 90 }, { label: 'Волевая сенсорика', strength: 75 }, { label: 'Интуиция возможностей', strength: 40 }, { label: 'Деловая логика', strength: 25 }],
      'ЛСЭ': [{ label: 'Деловая логика', strength: 90 }, { label: 'Сенсорика ощущений', strength: 75 }, { label: 'Этика эмоций', strength: 40 }, { label: 'Интуиция возможностей', strength: 25 }],
      'ЭИИ': [{ label: 'Этика отношений', strength: 90 }, { label: 'Интуиция времени', strength: 75 }, { label: 'Волевая сенсорика', strength: 40 }, { label: 'Деловая логика', strength: 25 }],
      'ИЭЭ': [{ label: 'Интуиция возможностей', strength: 90 }, { label: 'Этика отношений', strength: 75 }, { label: 'Сенсорика ощущений', strength: 40 }, { label: 'Структурная логика', strength: 25 }],
      'СЛИ': [{ label: 'Сенсорика ощущений', strength: 90 }, { label: 'Деловая логика', strength: 75 }, { label: 'Этика эмоций', strength: 40 }, { label: 'Интуиция возможностей', strength: 25 }],
    };
    return FUNC_MAP[typeCode] || [
      { label: 'Базовая', strength: 85 }, { label: 'Творческая', strength: 70 },
      { label: 'Ролевая', strength: 45 }, { label: 'Болевая', strength: 20 },
    ];
  }

  _getInsightsData(result) {
    if (result.framework === 'socionics') return SOCIONICS_INSIGHTS[result.typeCode] || {};
    if (result.framework === 'enneagram') {
      const num = result.typeCode.replace(/\D/g, '');
      return ENNEAGRAM_INSIGHTS[num] || {};
    }
    const base = getAdvancedInsights()[result.typeCode] || {};
    const extra = MBTI_EXTRA[result.typeCode] || {};
    return { ...base, ...extra };
  }

  _renderInsights(result) {
    const typeInsights = this._getInsightsData(result);
    const sections = result.framework === 'socionics' ? INSIGHT_SECTIONS_SOCIONICS
      : result.framework === 'enneagram' ? INSIGHT_SECTIONS_ENNEAGRAM
      : INSIGHT_SECTIONS_MBTI;
    return `
      <div class="result-insights">
        <div class="result-insights__title">Глубокий анализ</div>
        <div class="insights-carousel">
          ${sections.map(ins => {
            const items = typeInsights[ins.key] || [];
            const desc = items.length > 0 ? items.join(', ') : 'Нет данных';
            return `
              <div class="insight-card" style="background: ${ins.bg}">
                <div class="insight-card__icon-wrap" style="background: ${ins.color}15; color: ${ins.color}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${ICONS[ins.icon]}
                  </svg>
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
    const famousTitle = result.framework === 'enneagram'
      ? `Известные Тип ${result.typeCode}`
      : `Известные ${result.typeCode}`;
    return `
      <div class="result-famous">
        <div class="result-famous__title">${famousTitle}</div>
        <div class="famous-list">
          ${typeFamous.slice(0, 3).map(p => `
            <div class="famous-card">
              <div class="famous-card__avatar">${p.image || ''}</div>
              <div class="famous-card__info">
                <div class="famous-card__name">${p.name}</div>
                <div class="famous-card__role">${p.profession || p.role || ''}</div>
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
        <div class="premium-teaser__info">
          <span class="badge badge--gold premium-teaser__badge">Премиум</span>
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
        <button class="result-action result-action--primary" id="result-share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          Поделиться
        </button>
        <button class="result-action result-action--secondary" id="result-retake">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C9082" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
          Пройти снова
        </button>
      </div>
    `;
  }

  _getDimensionBars(framework, dims) {
    if (framework === 'socionics') {
      return [
        { leftLabel: 'Логика (Л)', rightLabel: 'Этика (Э)', shortLeft: 'Л', shortRight: 'Э', leftPercent: dims.L ?? 50 },
        { leftLabel: 'Интуиция (И)', rightLabel: 'Сенсорика (С)', shortLeft: 'И', shortRight: 'С', leftPercent: dims.I ?? 50 },
        { leftLabel: 'Экстраверсия (Э)', rightLabel: 'Интроверсия (И)', shortLeft: 'Экст', shortRight: 'Инт', leftPercent: dims.Ex ?? 50 },
        { leftLabel: 'Рациональность (Р)', rightLabel: 'Иррациональность (Ир)', shortLeft: 'Рац', shortRight: 'Ирр', leftPercent: dims.R ?? 50 },
      ];
    }
    if (framework === 'enneagram') {
      return [
        { leftLabel: 'Центр Сердца', rightLabel: '', shortLeft: 'Сердце', shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HC ?? 0) * 3)) },
        { leftLabel: 'Центр Головы', rightLabel: '', shortLeft: 'Голова', shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.HD ?? 0) * 3)) },
        { leftLabel: 'Центр Тела', rightLabel: '', shortLeft: 'Тело', shortRight: '', leftPercent: Math.max(10, Math.min(90, 50 + (dims.BD ?? 0) * 3)) },
      ];
    }
    return [
      { leftLabel: 'Экстраверсия (E)', rightLabel: 'Интроверсия (I)', shortLeft: 'E', shortRight: 'I', leftPercent: dims.E ?? 50 },
      { leftLabel: 'Сенсорика (S)', rightLabel: 'Интуиция (N)', shortLeft: 'S', shortRight: 'N', leftPercent: dims.S ?? 50 },
      { leftLabel: 'Мышление (T)', rightLabel: 'Чувство (F)', shortLeft: 'T', shortRight: 'F', leftPercent: dims.T ?? 50 },
      { leftLabel: 'Суждение (J)', rightLabel: 'Восприятие (P)', shortLeft: 'J', shortRight: 'P', leftPercent: dims.J ?? 50 },
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
