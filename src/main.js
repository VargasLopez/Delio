import { router } from './router';
import { supabase } from './services/supabase';
import { AuthService } from './services/auth-service';
import { LoginForm } from './components/auth/login-form';
import { RegisterForm } from './components/auth/register-form';
import { UserProfile } from './components/auth/user-profile';
import { ErrandForm } from './components/board/errand-form';
import { ErrandBoard } from './components/board/errand-board';
import { ChatList } from './components/chat/chat-list';
import { ChatWindow } from './components/chat/chat-window';
import { LandingPage } from './components/common/landing-page';
import { notification } from './components/common/notification';

/**
 * Configure routes and dynamic guards
 */
function initRouter() {
  
  // Register Routes
  router
    .add('/', async (container) => {
      const user = await AuthService.getCurrentUser();
      if (user) {
        await ErrandBoard.render(container);
      } else {
        await LandingPage.render(container);
      }
    })
    .add('/auth', async (container) => {
      await LoginForm.render(container);
    })
    .add('/register', async (container) => {
      await RegisterForm.render(container);
    })
    .add('/chats', async (container) => {
      await ChatList.render(container);
    })
    .add('/chat/resolve', async (container) => {
      await ChatWindow.render(container, {});
    })
    .add('/chat/:id', async (container, params) => {
      await ChatWindow.render(container, params);
    })
    .add('/profile', async (container) => {
      await UserProfile.render(container);
    })
    .add('/errand/new', async (container) => {
      await ErrandForm.render(container);
    });

  // Global Route Guard
  router.beforeEach(async (toHash) => {
    const user = await AuthService.getCurrentUser();
    const isAuthenticated = !!user;

    // Public routes accessible without being logged in
    const publicRoutes = ['#/', '#/auth', '#/register'];
    const currentRoute = toHash || '#/';

    if (!isAuthenticated) {
      // If not authenticated and trying to access private app pages, redirect to public landing page
      if (!publicRoutes.includes(currentRoute)) {
        console.log(`[Router Guard] Unauthenticated access to private route ${currentRoute}. Redirecting to landing page`);
        return '#/';
      }
    } else {
      // If authenticated and trying to visit login/register, redirect to dashboard
      const authRoutes = ['#/auth', '#/register'];
      if (authRoutes.includes(currentRoute)) {
        console.log(`[Router Guard] Authenticated access to auth route ${currentRoute}. Redirecting to board`);
        return '#/';
      }
    }
    return null;
  });
}

/**
 * Service Worker PWA registration
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[Delio PWA] Service Worker registered with scope: ', reg.scope);
        })
        .catch(err => {
          console.error('[Delio PWA] Service Worker registration failed: ', err);
        });
    });
  }

  // Intercept PWA Install prompt events
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered on user interaction in Profile Tab
    window.deferredPrompt = e;
    console.log('[Delio PWA] Intercepted install prompt. Ready for manual trigger.');
  });
}

/**
 * Core Application Bootstrapper
 */
async function bootApp() {
  console.log("[Delio PWA] Booting Mexican Job Board...");

  // 1. Setup routes and guards
  initRouter();

  // 2. Setup auth state listener to automatically coordinate redirects if session expires
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[Supabase Auth Change] Event: ${event}`);
    const hash = window.location.hash || '#/';
    
    if (event === 'SIGNED_IN') {
      if (hash === '#/auth' || hash === '#/register') {
        router.navigate('#/');
      }
    } else if (event === 'SIGNED_OUT') {
      // Only redirect to login if they are attempting to view private app routes!
      // This leaves public Landing Page (#/) and Register (#/register) fully accessible.
      const publicRoutes = ['#/', '#/auth', '#/register'];
      // Normalize comparison (e.g. ignore query string params)
      const cleanHash = hash.split('?')[0];
      if (!publicRoutes.includes(cleanHash)) {
        console.log(`[Auth Change] Unauthenticated session on private route ${cleanHash}. Redirecting to login...`);
        router.navigate('#/auth');
      }
    }
  });

  // 3. Register service worker for offline caches
  registerServiceWorker();

  // 4. Force check routing once on boot
  await router.handleRouting();
}

// Fire boot!
bootApp();
