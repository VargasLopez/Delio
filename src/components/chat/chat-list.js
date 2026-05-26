import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { AppNavbar } from '../common/navbar';
import { timeAgo } from '../../utils/helpers';
import { router } from '../../router';

export class ChatList {
  static async render(container) {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.navigate('#/auth');
      return;
    }

    const { headerHtml, bottomNavbarHtml } = AppNavbar.render('chats');

    container.innerHTML = `
      ${headerHtml}
      
      <main class="flex-grow max-w-lg w-full mx-auto px-4 pt-4 pb-24 animate-fade-in flex flex-col">
        
        <div class="mb-4">
          <h2 class="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-comments text-brand-650"></i>
            <span>Mis Conversaciones</span>
          </h2>
          <p class="text-xs text-slate-600 mt-1 font-semibold">Coordina detalles del mandado y métodos de pago directamente offline.</p>
        </div>

        <div class="flex-grow flex flex-col gap-3" id="chats-threads-list">
          <!-- Dynamic threads loaded here -->
        </div>

      </main>

      ${bottomNavbarHtml}
    `;

    AppNavbar.attachEvents();
    await this.loadThreads(user.id);
  }

  static async loadThreads(currentUserId) {
    const listContainer = document.getElementById('chats-threads-list');
    if (!listContainer) return;

    listContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="bg-white border border-slate-200 p-4 rounded-xl flex gap-3 animate-pulse">
        <div class="w-10 h-10 rounded-full bg-slate-100"></div>
        <div class="flex-grow space-y-1.5 mt-1">
          <div class="w-24 h-2 bg-slate-100 rounded"></div>
          <div class="w-40 h-2 bg-slate-100 rounded"></div>
        </div>
      </div>
    `).join('');

    const { data: threads, error } = await ChatService.getChats(currentUserId);

    if (error || threads.length === 0) {
      listContainer.innerHTML = `
        <div class="bg-white border-2 border-slate-200 p-8 rounded-2xl text-center space-y-4 my-auto shadow-sm">
          <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-200 shadow-sm">
            <i class="fa-solid fa-comment-slash text-slate-400 text-2xl"></i>
          </div>
          <div class="space-y-1">
            <h3 class="font-outfit font-black text-slate-800 text-base">Sin conversaciones activas</h3>
            <p class="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed mt-1 font-semibold">No tienes chats de negociación actualmente. Visita el tablero, ofrece tus servicios y acuerda el trato directo.</p>
          </div>
          <a href="#/" class="inline-flex py-2.5 px-4 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs tracking-wide shadow-md transition-all uppercase">
            Explorar Mandados
          </a>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = threads.map(thread => {
      // Resolve peer user name details
      const isUserA = thread.user_a === currentUserId;
      const peerName = isUserA ? thread.user_b_name : thread.user_a_name;
      
      return `
        <a href="#/chat/${thread.id}" class="bg-white rounded-xl border-2 border-slate-200/80 p-4 flex items-center gap-3.5 hover:border-brand-500/50 hover:bg-brand-50/20 active:scale-[0.99] transition-all duration-200 shadow-sm">
          
          <!-- Avatar -->
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700/80 to-brand-500/20 flex items-center justify-center border border-slate-200 font-bold font-outfit text-brand-700 text-sm uppercase flex-shrink-0">
            ${peerName.charAt(0)}
          </div>

          <!-- Content Details -->
          <div class="flex-grow min-w-0">
            <div class="flex justify-between items-baseline mb-0.5">
              <h3 class="text-sm font-extrabold text-slate-900 truncate pr-2">${peerName}</h3>
              <span class="text-[9px] text-slate-500 flex-shrink-0 font-extrabold">${timeAgo(thread.created_at)}</span>
            </div>
            
            <!-- Connected job detail -->
            <p class="text-xs text-brand-700 font-bold truncate mb-0.5">
              <i class="fa-solid fa-list-check text-[10px] mr-1"></i>${thread.job_title}
            </p>
            <p class="text-[11px] text-slate-650 truncate leading-relaxed font-semibold">Haz clic para chatear y negociar el pago offline...</p>
          </div>

          <i class="fa-solid fa-chevron-right text-xs text-slate-400 ml-1"></i>
        </a>
      `;
    }).join('');
  }
}
