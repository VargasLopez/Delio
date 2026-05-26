/**
 * Premium high-contrast light theme toast notification component for Delio
 */
export class NotificationService {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    // Create notification stacking container if not exists
    let el = document.getElementById('delio-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'delio-toast-container';
      // Bottom-right on desktop, full-width top on mobile
      el.className = 'fixed top-4 right-4 md:bottom-4 md:top-auto z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  /**
   * Shows a beautiful toast message.
   * @param {string} text - Message text
   * @param {'success'|'error'|'warning'|'info'} type - Type of toast
   * @param {number} duration - Time in ms to show the toast
   */
  show(text, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    
    // Aesthetic configurations per type (High Contrast Light Theme)
    const configs = {
      success: {
        bg: 'border-emerald-300 bg-white text-slate-900',
        icon: 'fa-circle-check text-emerald-600',
        glow: 'shadow-emerald-500/10'
      },
      error: {
        bg: 'border-rose-300 bg-white text-slate-900',
        icon: 'fa-triangle-exclamation text-rose-600',
        glow: 'shadow-rose-500/10'
      },
      warning: {
        bg: 'border-amber-300 bg-white text-slate-900',
        icon: 'fa-circle-exclamation text-amber-600',
        glow: 'shadow-amber-500/10'
      },
      info: {
        bg: 'border-brand-300 bg-white text-slate-900',
        icon: 'fa-circle-info text-brand-650',
        glow: 'shadow-brand-500/10'
      }
    };

    const config = configs[type] || configs.info;

    toast.className = `flex items-start gap-3 p-4 rounded-xl border-2 ${config.bg} shadow-2xl ${config.glow} transition-all duration-300 transform translate-x-12 opacity-0 pointer-events-auto max-w-sm`;
    
    toast.innerHTML = `
      <div class="flex-shrink-0 mt-0.5">
        <i class="fa-solid ${config.icon} text-lg"></i>
      </div>
      <div class="flex-grow">
        <p class="text-sm font-extrabold leading-relaxed">${text}</p>
      </div>
      <button class="flex-shrink-0 text-slate-500 hover:text-slate-900 transition-colors ml-2" aria-label="Cerrar">
        <i class="fa-solid fa-xmark text-sm font-black"></i>
      </button>
    `;

    // Append to stack
    this.container.appendChild(toast);

    // Trigger enter transition
    setTimeout(() => {
      toast.classList.remove('translate-x-12', 'opacity-0');
    }, 10);

    // Setup close triggers
    const closeBtn = toast.querySelector('button');
    const dismiss = () => {
      toast.classList.add('translate-x-12', 'opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    
    // Auto timeout
    const timeoutId = setTimeout(dismiss, duration);
    toast.dataset.timeoutId = timeoutId;
  }

  success(msg, dur) { this.show(msg, 'success', dur); }
  error(msg, dur) { this.show(msg, 'error', dur); }
  warning(msg, dur) { this.show(msg, 'warning', dur); }
  info(msg, dur) { this.show(msg, 'info', dur); }
}

export const notification = new NotificationService();
