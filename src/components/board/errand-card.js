import { formatMXN, timeAgo, JOB_CATEGORIES } from '../../utils/helpers';
import { AuthService } from '../../services/auth-service';
import { router } from '../../router';
import { notification } from '../common/notification';

export class ErrandCard {
  /**
   * Generates a premium HTML string representing a single job board errand item.
   * @param {object} job - The job data row
   * @param {string} currentUserId - ID of active logged-in user (prevents chatting with self)
   */
  static render(job, currentUserId) {
    const categoryInfo = JOB_CATEGORIES[job.category] || JOB_CATEGORIES.otros;
    const isSelfPost = job.poster_id === currentUserId;

    // Compile list of payment indicators
    // Sometimes mock data or real data has payments directly or we can grab them from poster's profile.
    // If not specified, default to Cash & SPEI
    const paymentMethods = job.poster_payment_methods || ['cash', 'spei'];
    const paymentBadgesHtml = paymentMethods.map(pm => {
      let icon = 'fa-solid fa-money-bill';
      let label = 'Efectivo';
      let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-250';
      
      if (pm === 'spei') {
        icon = 'fa-solid fa-building-columns';
        label = 'SPEI';
        badgeStyle = 'bg-blue-50 text-blue-700 border-blue-250';
      } else if (pm === 'spin') {
        icon = 'fa-solid fa-store';
        label = 'Spin';
        badgeStyle = 'bg-orange-50 text-orange-700 border-orange-250';
      } else if (pm === 'mercado_pago') {
        icon = 'fa-solid fa-wallet';
        label = 'M. Pago';
        badgeStyle = 'bg-sky-50 text-sky-700 border-sky-250';
      }

      return `
        <span class="inline-flex items-center gap-1 text-[9px] font-extrabold border rounded-full px-2 py-0.5 ${badgeStyle}">
          <i class="${icon}"></i>
          <span>${label}</span>
        </span>
      `;
    }).join(' ');

    return `
      <article class="bg-white rounded-2xl border-2 border-slate-200/90 p-5 flex flex-col justify-between card-glow-hover relative overflow-hidden shadow-sm animate-fade-in">
        
        <!-- Subtle corner background blur gradient -->
        <div class="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-brand-500/5 blur-xl pointer-events-none"></div>

        <!-- Upper Row: Category & Meta -->
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr ${categoryInfo.color} flex items-center justify-center text-white shadow-md">
              <i class="${categoryInfo.icon} text-sm"></i>
            </div>
            <div>
              <span class="text-[10px] text-brand-700 font-extrabold uppercase tracking-wider block">${categoryInfo.label}</span>
              <span class="text-[10px] text-slate-700 block font-bold">${timeAgo(job.created_at)}</span>
            </div>
          </div>
          
          <div class="text-right">
            <span class="text-xs text-slate-700 block font-bold">Presupuesto</span>
            <strong class="text-lg font-outfit font-black text-brand-700 tracking-tight">${formatMXN(job.budget)}</strong>
          </div>
        </div>

        <!-- Body Details -->
        <div class="mb-4 space-y-2">
          <h3 class="font-outfit font-extrabold text-slate-900 leading-snug text-base line-clamp-1 hover:text-brand-700 transition-colors cursor-pointer" data-id="${job.id}">
            ${job.title}
          </h3>
          <p class="text-xs text-slate-900 leading-relaxed font-semibold line-clamp-2">${job.description}</p>
        </div>

        <!-- Location path & Payment preferences -->
        <div class="flex flex-wrap items-center gap-2 mb-5 pt-3 border-t border-slate-100">
          <div class="text-[10px] text-slate-800 flex flex-wrap items-center gap-1 mr-2 font-bold">
            <i class="fa-solid fa-location-dot text-rose-600"></i>
            <span class="font-black text-slate-900">${job.colonia}</span>
            <span class="text-slate-400 font-normal">•</span>
            <span class="text-slate-800 font-extrabold">${job.municipality}</span>
          </div>
          
          <div class="flex flex-wrap gap-1">
            ${paymentBadgesHtml}
          </div>
        </div>

        <!-- Lower Row: CTA Call-To-Action Button -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800 uppercase">
              ${job.poster_name?.charAt(0) || 'C'}
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-900 block leading-none">${job.poster_name || 'Cliente'}</span>
              <span class="text-[9px] text-slate-700 block leading-none font-bold">Publicador</span>
            </div>
          </div>

          ${isSelfPost ? `
            <span class="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">
              <i class="fa-solid fa-user-circle mr-1 text-slate-650"></i> Tu Mandado
            </span>
          ` : `
            <button class="errand-chat-btn py-2 px-4 rounded-xl bg-white border-2 border-slate-300 hover:border-brand-600 hover:bg-brand-50 text-slate-800 hover:text-brand-700 font-extrabold text-xs tracking-wide transition-all flex items-center gap-1.5 shadow-sm"
              data-id="${job.id}" data-poster-id="${job.poster_id}">
              <i class="fa-solid fa-comments text-brand-700"></i>
              <span>Acordar Trato</span>
            </button>
          `}
        </div>

      </article>
    `;
  }

  static attachEvents() {
    // Dynamic binding to click on card detail title
    document.querySelectorAll('.errand-chat-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const jobId = btn.dataset.id;
        const posterId = btn.dataset.posterId;

        // Redirect directly to the chat resolver route
        // We will pass both JobId and PosterId to generate/resolve a chat thread
        router.navigate(`#/chat/resolve?jobId=${jobId}&receiverId=${posterId}`);
      });
    });
  }
}
