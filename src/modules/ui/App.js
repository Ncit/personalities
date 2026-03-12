// Styles
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/responsive.css';

import { router } from '../router/Router.js';
import { TabBar } from './TabBar.js';
import { Sidebar } from './Sidebar.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ExploreScreen } from './screens/ExploreScreen.js';
import { ResultsTimelineScreen } from './screens/ResultsTimelineScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { QuizScreen } from './screens/QuizScreen.js';
import { ResultDetailScreen } from './screens/ResultDetailScreen.js';
import { PremiumModal } from './components/PremiumModal.js';
import { FrameworkInfoScreen } from './screens/FrameworkInfoScreen.js';
import { TypeDetailModal } from './components/TypeDetailModal.js';
import { HelpModal } from './components/HelpModal.js';
import { resultsStore } from '../results/ResultsStore.js';
import { LoggerManager } from '../core/LoggerManager.js';

const logger = new LoggerManager().createModuleLogger('App');

export class App {
  constructor() {
    this.screenContainer = document.getElementById('screen-container');
    this.overlayContainer = document.getElementById('overlay-container');
    this.tabBar = new TabBar(document.getElementById('tab-bar'));

    // Desktop sidebar (hidden in VK Mini App)
    const isVKFlavor = new URLSearchParams(window.location.search).get('flavor') === 'vk';
    const appEl = document.getElementById('app');
    if (isVKFlavor) {
      appEl.dataset.flavor = 'vk';
    } else {
      this.sidebar = new Sidebar();
      appEl.insertBefore(this.sidebar.getElement(), this.screenContainer);
    }

    this.screens = {
      home: new HomeScreen(),
      explore: new ExploreScreen(),
      results: new ResultsTimelineScreen(),
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

    this.currentOverlay = null;

    resultsStore.migrateFromLegacy();

    router.subscribe((state) => this.onRouteChange(state));

    this.onRouteChange(router.getState());

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

    if (overlay) {
      if (!this.currentOverlay || this.currentOverlay._name !== overlay) {
        this.overlayContainer.innerHTML = '';
        const OverlayFactory = this.overlays[overlay];
        if (OverlayFactory) {
          this.currentOverlay = OverlayFactory();
          this.currentOverlay._name = overlay;
          if (overlayData && this.currentOverlay.setData) {
            this.currentOverlay.setData(overlayData);
          }
          this.overlayContainer.appendChild(this.currentOverlay.getElement());
        }
      }
    } else {
      this.overlayContainer.innerHTML = '';
      this.currentOverlay = null;
    }
  }
}
