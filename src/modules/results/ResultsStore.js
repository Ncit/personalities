import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('ResultsStore');
const STORAGE_KEY = 'quiz_results_history';

class ResultsStore {
  constructor() {
    this.results = this._load();
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  _notify() {
    this.subscribers.forEach(cb => cb(this.results));
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      logger.error('Failed to load results:', e);
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results));
    } catch (e) {
      logger.error('Failed to save results:', e);
    }
  }

  addResult(result) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      framework: result.framework || 'mbti',
      typeCode: result.typeCode,
      typeName: result.typeName,
      dimensions: result.dimensions,
      confidence: result.confidence || null,
      date: new Date().toISOString(),
    };
    this.results.unshift(entry);
    this._save();
    this._notify();
    logger.log('Result added:', entry);
    return entry;
  }

  removeResult(id) {
    const idx = this.results.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.results.splice(idx, 1);
    this._save();
    this._notify();
    // Clean up comparison exclusion list
    try {
      const raw = localStorage.getItem('quiz_comparison_excluded');
      if (raw) {
        const excluded = JSON.parse(raw).filter(eid => eid !== id);
        localStorage.setItem('quiz_comparison_excluded', JSON.stringify(excluded));
      }
    } catch (e) { /* ignore */ }
    logger.log('Result removed:', id);
    return true;
  }

  getAll() {
    return [...this.results];
  }

  getLatestByFramework(framework) {
    return this.results.find(r => r.framework === framework) || null;
  }

  getCount() {
    return this.results.length;
  }

  getAverageConfidence() {
    const withConfidence = this.results.filter(r => r.confidence != null);
    if (withConfidence.length === 0) return null;
    const sum = withConfidence.reduce((acc, r) => acc + r.confidence, 0);
    return Math.round(sum / withConfidence.length);
  }

  migrateFromLegacy() {
    const legacy = localStorage.getItem('mbti_last_results');
    if (legacy && this.results.length === 0) {
      try {
        const old = JSON.parse(legacy);
        if (old && old.personalityType) {
          const dims = old.dimensionBreakdown || {};
          this.addResult({
            framework: 'mbti',
            typeCode: old.personalityType,
            typeName: old.personalityType,
            dimensions: {
              E: dims.EI?.E || 50, I: dims.EI?.I || 50,
              S: dims.SN?.S || 50, N: dims.SN?.N || 50,
              T: dims.TF?.T || 50, F: dims.TF?.F || 50,
              J: dims.JP?.J || 50, P: dims.JP?.P || 50,
            },
            confidence: old.adaptiveAnalytics?.confidenceScores || null,
          });
          logger.log('Migrated legacy result');
        }
      } catch (e) {
        logger.error('Failed to migrate legacy result:', e);
      }
    }
  }
}

export const resultsStore = new ResultsStore();
