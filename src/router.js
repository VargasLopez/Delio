/**
 * Lightweight, zero-dependency client-side Hash Router for Delio SPA
 */
export class Router {
  constructor() {
    this.routes = [];
    this.currentPath = null;
    this.rootElementId = 'app';
    this.beforeEachHandler = null;

    // Listen to hash change and load events
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('load', () => this.handleRouting());
  }

  /**
   * Register a route path and its render callback
   * @param {string} path - e.g. '/board', '/chat/:id', '/auth'
   * @param {Function} callback - Function that renders the page/component
   */
  add(path, callback) {
    // Convert path to regex to support path parameters like :id
    const paramNames = [];
    const regexPath = path
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([a-zA-Z0-9_\\-]+)';
      })
      .replace(/\//g, '\\/');

    this.routes.push({
      path,
      regex: new RegExp(`^#${regexPath}$`),
      paramNames,
      callback
    });
    return this;
  }

  /**
   * Set a global route guard callback
   * @param {Function} handler - (toPath) => boolean | string
   */
  beforeEach(handler) {
    this.beforeEachHandler = handler;
    return this;
  }

  /**
   * Force nav to a route programmatically
   * @param {string} hashPath - e.g. '#/board'
   */
  navigate(hashPath) {
    window.location.hash = hashPath.startsWith('#') ? hashPath : `#${hashPath}`;
  }

  /**
   * Resolve active hash, run guards, extract params, and trigger rendering
   */
  async handleRouting() {
    const hash = window.location.hash || '#/';
    
    // Execute global guard before rendering
    if (this.beforeEachHandler) {
      const guardRedirect = await this.beforeEachHandler(hash);
      if (guardRedirect && guardRedirect !== hash) {
        this.navigate(guardRedirect);
        return;
      }
    }

    this.currentPath = hash;

    // Strip query parameters for regex route matching (e.g. #/chat/resolve?jobId=123 -> #/chat/resolve)
    const cleanHash = hash.split('?')[0];

    // Match route
    for (const route of this.routes) {
      const match = cleanHash.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        // Trigger the callback with dynamic params
        const container = document.getElementById(this.rootElementId);
        if (container) {
          // Clear current contents
          container.innerHTML = '';
          // Render route content
          await route.callback(container, params);
        }
        return;
      }
    }

    // Default Fallback: Route not found - redirect to home
    console.warn(`Route ${hash} not matched, redirecting to home.`);
    this.navigate('#/');
  }
}
export const router = new Router();
