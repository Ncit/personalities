import { resultsStore } from '../../results/ResultsStore.js';

import { TRAIT_KEYWORDS, PROFILE_DESCRIPTIONS } from '../../../data/TraitKeywords.ru.js';

const CORE_FRAMEWORKS = ['mbti', 'socionics', 'enneagram'];
const FW_COLORS = { mbti: '#7C9082', socionics: '#E8A85C', enneagram: '#C47A8A' };
const FW_LABELS = { mbti: 'MBTI', socionics: 'Сц', enneagram: 'Энн' };
const MONTHS_RU = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

const AXIS_CONFIG = {
  mbti: [
    { key: 'E', label: 'E/I', extract: dims => dims.E ?? 50 },
    { key: 'S', label: 'S/N', extract: dims => dims.S ?? 50 },
    { key: 'T', label: 'T/F', extract: dims => dims.T ?? 50 },
    { key: 'J', label: 'J/P', extract: dims => dims.J ?? 50 },
  ],
  socionics: [
    { key: 'L', label: 'Л/Э', extract: dims => dims.L ?? 50 },
    { key: 'I', label: 'И/С', extract: dims => dims.I ?? 50 },
    { key: 'Ex', label: 'Э/И', extract: dims => dims.Ex ?? 50 },
    { key: 'R', label: 'Р/Ир', extract: dims => dims.R ?? 50 },
  ],
  enneagram: [
    { key: 'HC', label: 'С', extract: dims => Math.max(10, Math.min(90, 50 + (dims.HC ?? 0) * 3)) },
    { key: 'HD', label: 'Г', extract: dims => Math.max(10, Math.min(90, 50 + (dims.HD ?? 0) * 3)) },
    { key: 'BD', label: 'Т', extract: dims => Math.max(10, Math.min(90, 50 + (dims.BD ?? 0) * 3)) },
  ],
};

function shortDate(isoStr) {
  const d = new Date(isoStr);
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

function getExcludedIds() {
  try {
    const raw = localStorage.getItem('quiz_comparison_excluded');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setExcludedIds(ids) {
  localStorage.setItem('quiz_comparison_excluded', JSON.stringify(ids));
}

function toggleExcluded(id) {
  const excluded = getExcludedIds();
  const idx = excluded.indexOf(id);
  if (idx >= 0) excluded.splice(idx, 1);
  else excluded.push(id);
  setExcludedIds(excluded);
  return excluded;
}

function getCoreResults() {
  return resultsStore.getAll().filter(r => CORE_FRAMEWORKS.includes(r.framework));
}

export class ComparisonSection {
  constructor() {
    this.deleteTargetId = null;
  }

  render(currentResultId) {
    const results = getCoreResults();
    if (results.length < 2) return '';
    const excluded = getExcludedIds();

    return `
      <div class="comparison-section" id="comparison-section">
        <div class="comparison-section__title">Эволюция типа</div>
        <div class="comparison-section__subtitle">${results.length} результатов</div>
        ${this._renderTimeline(results, excluded, currentResultId)}
        <div class="comparison-analytics" id="comparison-analytics">
          ${this._renderAnalytics(results, excluded)}
        </div>
        ${this.deleteTargetId ? this._renderDeleteDialog(results) : ''}
      </div>
    `;
  }

  _renderTimeline(results, excluded, currentResultId) {
    // Newest first (left side) — results are already stored newest-first
    return `
      <div class="comparison-timeline" id="comparison-timeline">
        ${results.map(r => {
          const isExcluded = excluded.includes(r.id);
          const isCurrent = r.id === currentResultId;
          const color = FW_COLORS[r.framework];
          return `
          <div class="comparison-card ${isExcluded ? 'comparison-card--excluded' : ''} ${isCurrent ? 'comparison-card--current' : ''}"
               data-result-id="${r.id}"
               style="--fw-color:${color}">
            <button class="comparison-card__delete" data-delete-id="${r.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
            <div class="comparison-card__date">${shortDate(r.date)}</div>
            <div class="comparison-card__type">${r.typeCode}</div>
            <div class="comparison-card__meta">${FW_LABELS[r.framework]} · ${r.confidence ? r.confidence + '%' : '—'}</div>
            <div class="comparison-card__badge">${isExcluded ? '✕ Убран' : '✓ Включён'}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  _renderDeleteDialog(results) {
    const r = results.find(r => r.id === this.deleteTargetId);
    if (!r) return '';
    return `
      <div class="comparison-delete-dialog" id="comparison-delete-dialog">
        <div class="comparison-delete-dialog__card">
          <div class="comparison-delete-dialog__title">Удалить результат?</div>
          <div class="comparison-delete-dialog__text">${r.typeCode} от ${shortDate(r.date)} будет удалён навсегда.</div>
          <div class="comparison-delete-dialog__actions">
            <button class="btn-danger" id="comparison-delete-confirm">Удалить</button>
            <button class="btn-secondary" id="comparison-delete-cancel">Отмена</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderAnalytics(results, excluded) {
    const included = results.filter(r => !excluded.includes(r.id));
    if (included.length === 0) {
      return '<div class="comparison-empty">Включите хотя бы один результат</div>';
    }
    return `
      ${this._renderRadar(included)}
      ${this._renderStability(included)}
      ${this._renderCorrelation(included)}
    `;
  }

  _renderRadar(included) {
    const fwsPresent = [...new Set(included.map(r => r.framework))];
    const allAxes = [];
    fwsPresent.forEach(fw => {
      (AXIS_CONFIG[fw] || []).forEach(axis => {
        allAxes.push({ ...axis, framework: fw });
      });
    });
    if (allAxes.length === 0) return '';

    const cx = 120, cy = 120, radius = 90;
    const n = allAxes.length;
    const angleStep = (2 * Math.PI) / n;

    const gridCircles = [0.25, 0.5, 0.75, 1].map(f => {
      const r = radius * f;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + i * angleStep;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="#E8E4DF" stroke-width="${f === 1 ? 1 : 0.5}"/>`;
    }).join('');

    const axisLines = allAxes.map((axis, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);
      const lx = cx + (radius + 16) * Math.cos(angle);
      const ly = cy + (radius + 16) * Math.sin(angle);
      const color = FW_COLORS[axis.framework] || '#888';
      return `
        <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#E8E4DF" stroke-width="0.5"/>
        <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="10" font-weight="500">${axis.label}</text>
      `;
    }).join('');

    // One polygon per framework — averaged across included results for that fw
    // Note: MBTI key 'I' and Socionics key 'I' don't collide because axis.framework is checked
    const polygons = fwsPresent.map(fw => {
      const fwResults = included.filter(r => r.framework === fw);
      const fwAxes = AXIS_CONFIG[fw] || [];
      const avgValues = fwAxes.map(axis => {
        const sum = fwResults.reduce((s, r) => s + axis.extract(r.dimensions || {}), 0);
        return sum / fwResults.length;
      });

      const color = FW_COLORS[fw];
      const pts = allAxes.map((axis, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const fwAxisIdx = fwAxes.findIndex(a => a.key === axis.key && axis.framework === fw);
        const pct = fwAxisIdx >= 0 ? avgValues[fwAxisIdx] / 100 : 0.5;
        const r = radius * Math.max(0.05, pct);
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      });
      return `<polygon points="${pts.join(' ')}" fill="${color}20" stroke="${color}" stroke-width="1.5"/>`;
    }).join('');

    const legend = fwsPresent.map(fw =>
      `<span style="color:${FW_COLORS[fw]};font-size:11px;font-weight:500">${'\u25CF'} ${FW_LABELS[fw]}</span>`
    ).join('&nbsp;&nbsp;');

    return `
      <div class="comparison-block">
        <div class="comparison-block__title">Сравнение измерений</div>
        <svg viewBox="0 0 240 240" style="width:100%;max-width:280px;margin:0 auto;display:block">
          ${gridCircles}
          ${axisLines}
          ${polygons}
        </svg>
        <div style="text-align:center;margin-top:8px">${legend}</div>
      </div>
    `;
  }

  _renderStability(included) {
    const byFw = {};
    included.forEach(r => {
      if (!byFw[r.framework]) byFw[r.framework] = [];
      byFw[r.framework].push(r);
    });

    const fws = CORE_FRAMEWORKS.filter(fw => byFw[fw]);
    if (fws.length === 0) return '';

    let overallWeightedSum = 0, overallWeight = 0;

    const rows = fws.map(fw => {
      const fwResults = byFw[fw];
      const color = FW_COLORS[fw];
      const label = FW_LABELS[fw];

      const counts = {};
      fwResults.forEach(r => { counts[r.typeCode] = (counts[r.typeCode] || 0) + 1; });
      const topType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      const topCode = topType[0];
      const topCount = topType[1];
      const total = fwResults.length;

      if (total >= 2) {
        const pct = Math.round((topCount / total) * 100);
        overallWeightedSum += pct * total;
        overallWeight += total;
        return `
          <div class="comparison-stability-row">
            <div class="comparison-stability-row__header">
              <span style="color:${color};font-weight:500;font-size:12px">${label}</span>
              <span style="color:#8A8A8A;font-size:11px">${topCode} — ${topCount} из ${total} (${pct}%)</span>
            </div>
            <div class="comparison-stability-row__bar">
              <div class="comparison-stability-row__fill" style="width:${pct}%;background:${color}"></div>
            </div>
          </div>
        `;
      }
      return `
        <div class="comparison-stability-row">
          <div class="comparison-stability-row__header">
            <span style="color:${color};font-weight:500;font-size:12px">${label}</span>
            <span style="color:#8A8A8A;font-size:11px">${topCode} — </span>
          </div>
        </div>
      `;
    }).join('');

    const overallLine = overallWeight > 0
      ? `<div style="text-align:center;font-size:11px;color:#8A8A8A;margin-top:8px">Общая стабильность: <span style="color:#2D2D2D;font-weight:600">${Math.round(overallWeightedSum / overallWeight)}%</span></div>`
      : '';

    return `
      <div class="comparison-block">
        <div class="comparison-block__title">Стабильность результатов</div>
        ${rows}
        ${overallLine}
      </div>
    `;
  }

  _renderCorrelation(included) {
    const latestByFw = {};
    CORE_FRAMEWORKS.forEach(fw => {
      const fwResults = included.filter(r => r.framework === fw);
      if (fwResults.length > 0) latestByFw[fw] = fwResults[0]; // newest-first
    });

    const fwsWithResults = Object.keys(latestByFw);
    if (fwsWithResults.length === 0) return '';

    const traitSources = {};
    fwsWithResults.forEach(fw => {
      const r = latestByFw[fw];
      // Normalize enneagram typeCode: "Тип 5", "1w2" -> "1"
      const lookupCode = fw === 'enneagram' ? r.typeCode.replace(/\D/g, '').charAt(0) || r.typeCode : r.typeCode;
      const keywords = TRAIT_KEYWORDS[fw]?.[lookupCode] || [];
      keywords.forEach(trait => {
        if (!traitSources[trait]) traitSources[trait] = [];
        if (!traitSources[trait].includes(fw)) traitSources[trait].push(fw);
      });
    });

    const coreTraits = Object.entries(traitSources)
      .filter(([, fws]) => fws.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([trait]) => trait);
    const secondaryTraits = Object.entries(traitSources)
      .filter(([, fws]) => fws.length === 1)
      .map(([trait, fws]) => ({ trait, fw: fws[0] }));

    let profileName, profileSubtitle = '';
    if (coreTraits.length >= 2) {
      profileName = this._capitalize(coreTraits[0]) + '-' + coreTraits[1];
    } else if (coreTraits.length === 1) {
      const secondary = secondaryTraits[0]?.trait || '';
      profileName = this._capitalize(coreTraits[0]) + (secondary ? '-' + secondary : '');
    } else if (fwsWithResults.length === 1) {
      const fwTraits = TRAIT_KEYWORDS[fwsWithResults[0]]?.[latestByFw[fwsWithResults[0]].typeCode] || [];
      profileName = fwTraits.length >= 2
        ? this._capitalize(fwTraits[0]) + '-' + fwTraits[1]
        : this._capitalize(fwTraits[0] || 'Тип');
      const fwLabel = { mbti: 'MBTI', socionics: 'Соционики', enneagram: 'Эннеаграммы' }[fwsWithResults[0]] || '';
      profileSubtitle = `На основе ${fwLabel}`;
    } else {
      const topTraits = fwsWithResults.map(fw => {
        const r = latestByFw[fw];
        const lookupCode = fw === 'enneagram' ? r.typeCode.replace(/\D/g, '').charAt(0) || r.typeCode : r.typeCode;
        const kw = TRAIT_KEYWORDS[fw]?.[lookupCode] || [];
        return kw[0];
      }).filter(Boolean);
      profileName = topTraits.length >= 2
        ? this._capitalize(topTraits[0]) + '-' + topTraits[1]
        : this._capitalize(topTraits[0] || 'Тип');
    }

    const descParts = (coreTraits.length > 0 ? coreTraits : secondaryTraits.map(s => s.trait))
      .slice(0, 3)
      .map(t => PROFILE_DESCRIPTIONS[t])
      .filter(Boolean);
    const description = descParts.length > 0
      ? 'Ваш профиль сочетает ' + descParts.join(', ') + '.'
      : 'Уникальный профиль на основе ваших результатов.';

    const allTraits = [...coreTraits, ...secondaryTraits.map(s => s.trait)];
    const pills = allTraits.slice(0, 6).map(trait => {
      const sources = traitSources[trait] || [];
      const color = sources.length >= 2 ? '#8B7EC8' : FW_COLORS[sources[0]] || '#888';
      return `<span class="comparison-trait-pill" style="background:${color}18;color:${color}">${trait}</span>`;
    }).join('');

    return `
      <div class="comparison-block comparison-block--correlation">
        <div class="comparison-block__title">Корреляция типов</div>
        <div class="comparison-correlation-card">
          <div class="comparison-correlation-card__name">${profileName}</div>
          ${profileSubtitle ? `<div class="comparison-correlation-card__subtitle">${profileSubtitle}</div>` : ''}
          <div class="comparison-correlation-card__desc">${description}</div>
          <div class="comparison-correlation-card__pills">${pills}</div>
        </div>
      </div>
    `;
  }

  _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  bind(container, currentResultId) {
    // Toggle include/exclude
    container.querySelectorAll('.comparison-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.comparison-card__delete')) return;
        const id = card.dataset.resultId;
        const excluded = toggleExcluded(id);
        const isExcluded = excluded.includes(id);
        card.classList.toggle('comparison-card--excluded', isExcluded);
        const badge = card.querySelector('.comparison-card__badge');
        if (badge) badge.textContent = isExcluded ? '✕ Убран' : '✓ Включён';
        this._refreshAnalytics(container);
      });
    });

    // Delete buttons — append dialog overlay without re-rendering section (preserves scroll)
    container.querySelectorAll('.comparison-card__delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteTargetId = btn.dataset.deleteId;
        const section = container.querySelector('#comparison-section');
        if (section) {
          section.querySelector('#comparison-delete-dialog')?.remove();
          const dialogHtml = this._renderDeleteDialog(getCoreResults());
          if (dialogHtml) {
            section.insertAdjacentHTML('beforeend', dialogHtml);
            this._bindDeleteDialog(container, currentResultId);
          }
        }
      });
    });

    this._bindDeleteDialog(container, currentResultId);
  }

  _bindDeleteDialog(container, currentResultId) {
    container.querySelector('#comparison-delete-confirm')?.addEventListener('click', () => {
      const id = this.deleteTargetId;
      this.deleteTargetId = null;
      resultsStore.removeResult(id);
      const section = container.querySelector('#comparison-section');
      if (section) {
        section.outerHTML = this.render(currentResultId);
        this.bind(container, currentResultId);
      }
    });

    container.querySelector('#comparison-delete-cancel')?.addEventListener('click', () => {
      this.deleteTargetId = null;
      container.querySelector('#comparison-delete-dialog')?.remove();
    });

    container.querySelector('#comparison-delete-dialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'comparison-delete-dialog') {
        this.deleteTargetId = null;
        container.querySelector('#comparison-delete-dialog')?.remove();
      }
    });
  }

  _refreshAnalytics(container) {
    const analyticsEl = container.querySelector('#comparison-analytics');
    if (!analyticsEl) return;
    const results = getCoreResults();
    const excluded = getExcludedIds();
    analyticsEl.innerHTML = this._renderAnalytics(results, excluded);
  }
}
