import { router } from '../router/Router.js';
import { TabBar } from './TabBar.js';
import { Sidebar } from './Sidebar.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ExploreScreen } from './screens/ExploreScreen.js';
import { ResultsTimelineScreen } from './screens/ResultsTimelineScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { AchievementsScreen } from './screens/AchievementsScreen.js';
import { QuizScreen } from './screens/QuizScreen.js';
import { ResultDetailScreen } from './screens/ResultDetailScreen.js';
import { PremiumModal } from './components/PremiumModal.js';
import { FrameworkInfoScreen } from './screens/FrameworkInfoScreen.js';
import { TypeDetailModal } from './components/TypeDetailModal.js';
import { HelpModal } from './components/HelpModal.js';
import { resultsStore } from '../results/ResultsStore.js';
import { LoggerManager } from '../core/LoggerManager.js';
import { PlatformDetector } from '../platform/PlatformDetector.js';

const logger = new LoggerManager().createModuleLogger('App');

export class App {
  constructor() {
    this.screenContainer = document.getElementById('screen-container');
    this.overlayContainer = document.getElementById('overlay-container');
    this.tabBar = new TabBar(document.getElementById('tab-bar'));

    // Desktop sidebar (hidden in VK and Telegram flavors)
    const flavor = PlatformDetector.getFlavor();
    const appEl = document.getElementById('app');
    if (flavor === 'vk' || flavor === 'tg' || flavor === 'mobile') {
      appEl.dataset.flavor = flavor;
      document.body.dataset.flavor = flavor;
    } else {
      this.sidebar = new Sidebar();
      appEl.insertBefore(this.sidebar.getElement(), this.screenContainer);
    }

    this.screens = {
      home: new HomeScreen(),
      explore: new ExploreScreen(),
      results: new ResultsTimelineScreen(),
      achievements: new AchievementsScreen(),
      profile: new ProfileScreen(),
    };

    this.overlays = {
      quiz: () => new QuizScreen(),
      'result-detail': () => new ResultDetailScreen(),
      'premium-modal': () => new PremiumModal(),
      'framework-info': () => new FrameworkInfoScreen(),
      'type-detail': () => new TypeDetailModal(),
      'help': () => new HelpModal(),
    };

    this.overlayInstances = []; // stack of { name, instance }

    resultsStore.migrateFromLegacy();

    router.subscribe((state) => this.onRouteChange(state));

    this.onRouteChange(router.getState());

    // Re-render active screen when premium status changes
    if (window.stateManager) {
      window.stateManager.subscribe('isPremium', () => {
        const currentTab = router.getState().tab;
        const screen = this.screens[currentTab];
        if (screen && screen.onActivate) screen.onActivate();
      });
    }

    logger.log('App initialized');
  }

  onRouteChange({ tab, overlay, overlayData }) {
    Object.entries(this.screens).forEach(([id, screen]) => {
      const el = screen.getElement();
      el.style.display = id === tab ? '' : 'none';
      if (id === tab && screen.onActivate) screen.onActivate();
    });

    Object.values(this.screens).forEach(screen => {
      const el = screen.getElement();
      if (!el.parentElement) this.screenContainer.appendChild(el);
    });

    // Telegram BackButton: show when overlay is open, hide on home
    if (PlatformDetector.isTelegram() && window.tgBridgeManager) {
      const hasOverlay = !!overlay;
      window.tgBridgeManager.setBackButtonVisible(hasOverlay, () => router.closeOverlay());
    }

    if (!overlay) {
      // No overlay — clear all
      this.overlayContainer.innerHTML = '';
      this.overlayInstances = [];
    } else {
      const top = this.overlayInstances[this.overlayInstances.length - 1];
      if (top && top.name === overlay) {
        // Same overlay on top — nothing to do
      } else if (this.overlayInstances.length > router.overlayStack.length) {
        // Stack shrunk (popped) — remove top instance
        const removed = this.overlayInstances.pop();
        removed.instance.getElement().remove();
      } else {
        // Stack grew (pushed) — add new overlay on top
        const OverlayFactory = this.overlays[overlay];
        if (OverlayFactory) {
          const instance = OverlayFactory();
          instance._name = overlay;
          if (overlayData && instance.setData) instance.setData(overlayData);
          this.overlayContainer.appendChild(instance.getElement());
          this.overlayInstances.push({ name: overlay, instance });
        }
      }
    }
  }
}
