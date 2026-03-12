import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('Router');

class Router {
  constructor() {
    this.tabs = ['home', 'explore', 'results', 'profile'];
    this.currentTab = 'home';
    this.overlayStack = [];
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    const state = this.getState();
    this.subscribers.forEach(cb => cb(state));
    logger.log('Route changed:', state);
  }

  getState() {
    return {
      tab: this.currentTab,
      overlay: this.overlayStack[this.overlayStack.length - 1] || null,
      overlayData: this._overlayData || null,
    };
  }

  navigateTab(tab) {
    if (!this.tabs.includes(tab)) return;
    if (this.overlayStack.length > 0) return;
    this.currentTab = tab;
    this.notify();
  }

  openOverlay(name, data = null) {
    this._overlayData = data;
    this.overlayStack.push(name);
    this.notify();
  }

  closeOverlay() {
    this.overlayStack.pop();
    this._overlayData = this.overlayStack.length > 0 ? this._overlayData : null;
    this.notify();
  }

  closeAllOverlays() {
    this.overlayStack = [];
    this._overlayData = null;
    this.notify();
  }
}

export const router = new Router();
