import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { DbService } from '../../services/db-service';
import { AppNavbar } from '../common/navbar';
import { timeAgo, formatMXN } from '../../utils/helpers';
import { notification } from '../common/notification';
import { router } from '../../router';

export class ChatWindow {
  /**
   * Renders the real-time chat interface.
   * Handles both explicit chat ID matching (`/chat/:id`) AND dynamic query resolutions (`/chats?jobId=...`).
   */
  static async render(container, params) {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.navigate('#/auth');
      return;
    }

    let chatId = params.id;

    // Check if we arrived via query parameters (?jobId=...&receiverId=...)
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const queryParams = new URLSearchParams(queryString);
      const jobId = queryParams.get('jobId');
      const receiverId = queryParams.get('receiverId');

      if (jobId && receiverId) {
        container.innerHTML = `
          <div class="flex-grow flex flex-col items-center justify-center p-6 text-center animate-pulse">
            <i class="fa-solid fa-spinner animate-spin text-2xl text-brand-650 mb-3"></i>
            <p class="text-xs text-slate-600">Resolviendo canal de comunicación directo...</p>
          </div>
        `;

        try {
          const { data: resolvedChat, error } = await ChatService.getOrCreateChat(jobId, receiverId, user.id);
          if (error || !resolvedChat) {
            notification.error("No se pudo iniciar la conversación.");
            router.navigate('#/');
            return;
          }
          chatId = resolvedChat.id;
          window.history.replaceState(null, null, `#/chat/${chatId}`);
        } catch (e) {
          notification.error("Error al iniciar canal de chat.");
          router.navigate('#/');
          return;
        }
      }
    }

    if (!chatId) {
      router.navigate('#/chats');
      return;
    }

    // Retrieve active thread detail row
    const chatsData = await ChatService.getChats(user.id);
    const thread = chatsData.data?.find(c => c.id === chatId);

    if (!thread) {
      notification.error("La conversación no existe o no tienes acceso.");
      router.navigate('#/chats');
      return;
    }

    const isUserA = thread.user_a === user.id;
    const peerName = isUserA ? thread.user_b_name : thread.user_a_name;
    const peerId = isUserA ? thread.user_b : thread.user_a;

    // Fetch peer profile to get phone and rating details
    const peerProfile = await AuthService.getProfile(peerId);
    const peerPhone = peerProfile ? peerProfile.phone : '';

    // Fetch associated job/errand details to check completion status
    const { data: job } = await DbService.getJob(thread.job_id);
    const isJobPoster = job && job.poster_id === user.id;
    const isJobOpen = job && job.status === 'open';

    const { headerHtml, bottomNavbarHtml } = AppNavbar.render('chats');

    container.innerHTML = `
      <!-- Header bar with peer profile detail (Light Theme High Contrast) -->
      <header class="bg-white sticky top-0 z-40 border-b border-slate-200 px-4 py-3 flex items-center gap-3 safe-top shadow-sm">
        <a href="#/chats" class="text-slate-600 hover:text-slate-900 p-2 -ml-2 text-base">
          <i class="fa-solid fa-chevron-left"></i>
        </a>
        
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center font-bold font-outfit text-white text-xs uppercase shadow-md flex-shrink-0">
          ${peerName.charAt(0)}
        </div>

        <div class="flex-grow min-w-0">
          <h2 class="text-sm font-extrabold text-slate-900 truncate leading-tight">${peerName}</h2>
          <span class="text-[10px] text-brand-650 font-bold truncate block">
            <i class="fa-solid fa-list-check text-[9px] mr-1"></i>${thread.job_title}
          </span>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <!-- Complete Errand Button (Only visible to Errand Poster if job is open) -->
          ${isJobPoster && isJobOpen ? `
            <button id="chat-complete-job-btn" class="py-1.5 px-3 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-extrabold text-[10px] tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-1" title="Marcar como Completado">
              <i class="fa-solid fa-circle-check"></i>
              <span>Finalizar</span>
            </button>
          ` : ''}

          ${peerPhone ? `
            <a href="tel:+52${peerPhone}" class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500/40 text-slate-600 hover:text-brand-600 flex items-center justify-center transition-colors text-xs" title="Llamar Celular">
              <i class="fa-solid fa-phone"></i>
            </a>
            <a href="https://wa.me/52${peerPhone}?text=Hola%20${encodeURIComponent(peerName)},%20te%20escribo%20desde%20Delio%20por%20tu%20mandado%20de%20'${encodeURIComponent(thread.job_title)}'" 
              target="_blank" rel="noopener noreferrer" 
              class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors text-xs" title="Enviar WhatsApp Directo">
              <i class="fa-brands fa-whatsapp text-sm"></i>
            </a>
          ` : ''}
        </div>
      </header>

      <!-- Connection status banner -->
      <div class="bg-brand-50/60 border-b border-brand-100 px-4 py-2.5 text-[10px] text-slate-800 leading-normal flex items-start gap-2 font-medium">
        <i class="fa-solid fa-shield-halved text-brand-600 text-xs mt-0.5"></i>
        <div>
          <strong class="text-slate-900 font-bold">Directorio P2P Legal & Seguro:</strong> Negocien los términos libremente en este chat. Delio <span class="font-bold text-rose-600">nunca solicita datos bancarios, claves, ni cobra comisiones</span>. El trato de pago es 100% offline.
        </div>
      </div>

      <!-- Messages History Board Area -->
      <div class="flex-grow overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/40" id="chat-messages-wall" style="max-height: calc(100vh - 195px);">
        <!-- Dynamic message bubbles loaded here -->
      </div>

      <!-- Message input footer area -->
      <footer class="bg-white sticky bottom-0 border-t border-slate-200 px-3 py-2.5 safe-bottom">
        <form id="chat-send-box" class="flex gap-2 max-w-lg mx-auto">
          <input type="text" id="chat-msg-input" autocomplete="off" required placeholder="Escribe un mensaje de negociación..."
            class="flex-grow px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-xs font-semibold placeholder:text-slate-400">
          <button type="submit" id="chat-send-btn" class="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-all flex-shrink-0">
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </footer>
    `;

    this.currentUserId = user.id;
    this.chatId = chatId;
    this.peerName = peerName;
    this.peerId = peerId;
    this.jobId = thread.job_id;

    // Load messages
    await this.refreshMessages();

    // Attach events
    this.attachEvents(container);

    // Subscribe to incoming messages
    this.setupRealtimeMessages();
  }

  static async refreshMessages() {
    const wall = document.getElementById('chat-messages-wall');
    if (!wall) return;

    const { data: messages, error } = await ChatService.getMessages(this.chatId);

    if (error) {
      wall.innerHTML = `
        <div class="text-center py-8">
          <p class="text-xs text-rose-600 font-bold">Error al cargar mensajes históricos.</p>
        </div>
      `;
      return;
    }

    if (messages.length === 0) {
      wall.innerHTML = `
        <div class="text-center py-12 space-y-3 px-4 animate-fade-in">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 mx-auto text-slate-400">
            <i class="fa-solid fa-comments"></i>
          </div>
          <div>
            <h4 class="text-xs font-extrabold text-slate-800">¡Inicia la conversación!</h4>
            <p class="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1 font-medium">Saluda, acuerda la logística del mandado, los horarios y confirma cuál método de pago prefieren utilizar.</p>
          </div>
        </div>
      `;
      return;
    }

    wall.innerHTML = messages.map(msg => {
      const isMine = msg.sender_id === this.currentUserId;
      const isSystem = msg.message_text.includes('[SISTEMA]');
      
      let bubbleStyle = '';
      if (isSystem) {
        // Special highlighted system bubble for completion alerts
        bubbleStyle = 'bg-amber-50 text-amber-800 rounded-xl mx-auto border-2 border-amber-200 text-center font-bold max-w-xs shadow-sm';
      } else {
        bubbleStyle = isMine 
          ? 'bg-brand-600 text-white rounded-2xl rounded-tr-none ml-auto border border-brand-500/10 shadow-sm' 
          : 'bg-white text-slate-900 rounded-2xl rounded-tl-none border-2 border-slate-200 shadow-sm';
      }

      const timeString = new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="flex flex-col ${isSystem ? 'items-center w-full' : (isMine ? 'max-w-[80%] ml-auto items-end animate-slide-in' : 'max-w-[80%] items-start animate-fade-in')}">
          <div class="p-3 ${bubbleStyle}">
            <p class="text-xs leading-relaxed whitespace-pre-wrap">${msg.message_text}</p>
          </div>
          ${isSystem ? '' : `<span class="text-[8px] text-slate-500 mt-1 px-1 font-bold">${timeString}</span>`}
        </div>
      `;
    }).join('');

    // Scroll to bottom
    this.scrollToBottom();
  }

  static scrollToBottom() {
    const wall = document.getElementById('chat-messages-wall');
    if (wall) {
      wall.scrollTop = wall.scrollHeight;
    }
  }

  static attachEvents(container) {
    const form = document.getElementById('chat-send-box');
    const input = document.getElementById('chat-msg-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const completeJobBtn = document.getElementById('chat-complete-job-btn');

    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = input.value.trim();
        if (!messageText) return;

        input.value = '';
        sendBtn.disabled = true;

        try {
          const { error } = await ChatService.sendMessage(this.chatId, this.currentUserId, messageText);
          if (error) {
            notification.error("Error al enviar mensaje.");
          }
          await this.refreshMessages();
        } catch (err) {
          console.error(err);
        } finally {
          sendBtn.disabled = false;
        }
      });
    }

    // Complete Job Rating Modal Trigger
    if (completeJobBtn) {
      completeJobBtn.addEventListener('click', () => {
        this.openRatingModal(container);
      });
    }
  }

  static openRatingModal(container) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in';
    
    modal.innerHTML = `
      <div class="w-full max-w-sm bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-2xl relative space-y-4 animate-fade-in">
        <h3 class="font-outfit font-black text-slate-900 text-lg flex items-center gap-2">
          <i class="fa-solid fa-star text-accent-500 animate-pulse"></i>
          <span>Finalizar y Calificar</span>
        </h3>
        <p class="text-xs text-slate-700 leading-relaxed font-semibold">
          ¿Cómo calificarías el servicio, puntualidad y honestidad de <strong class="text-slate-900 font-bold">${this.peerName}</strong>?
        </p>
        
        <!-- Stars rating selection -->
        <div class="flex justify-center gap-3 py-3" id="modal-rating-stars">
          ${[1, 2, 3, 4, 5].map(star => `
            <button class="modal-star-btn text-3xl text-slate-300 hover:text-accent-400 transition-colors" data-value="${star}">
              <i class="fa-solid fa-star"></i>
            </button>
          `).join('')}
        </div>
        
        <button id="modal-submit-rating-btn" disabled class="w-full py-3 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-400 font-bold text-xs tracking-wide transition-all uppercase">
          Selecciona Calificación
        </button>
        
        <button id="modal-close-rating-btn" class="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs tracking-wide transition-all uppercase mt-1">
          Cancelar
        </button>
      </div>
    `;

    container.appendChild(modal);

    let selectedRating = 0;
    const submitBtn = modal.querySelector('#modal-submit-rating-btn');
    const closeBtn = modal.querySelector('#modal-close-rating-btn');
    const stars = modal.querySelectorAll('.modal-star-btn');

    // Star selection click events
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = Number(star.dataset.value);
        
        // Highlight active stars
        stars.forEach(s => {
          const val = Number(s.dataset.value);
          const icon = s.querySelector('i');
          if (val <= selectedRating) {
            icon.className = "fa-solid fa-star text-accent-500 scale-105 transition-transform duration-150";
          } else {
            icon.className = "fa-solid fa-star text-slate-200 scale-100";
          }
        });

        // Enable Submit button
        submitBtn.disabled = false;
        submitBtn.className = "w-full py-3 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs tracking-wide transition-all shadow-md uppercase";
        submitBtn.textContent = `✓ Calificar con ${selectedRating} ${selectedRating === 1 ? 'Estrella' : 'Estrellas'}`;
      });
    });

    // Close modal trigger
    closeBtn.addEventListener('click', () => modal.remove());

    // Submit rating trigger
    submitBtn.addEventListener('click', async () => {
      if (selectedRating === 0) return;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1.5"></i> Procesando...`;

      try {
        const { success, error } = await DbService.completeJob(this.jobId, this.peerId, selectedRating);
        if (error) {
          notification.error("Error al registrar la calificación.");
          modal.remove();
        } else {
          // Send automatic system chat notice
          await ChatService.sendMessage(
            this.chatId, 
            this.currentUserId, 
            `✓ [SISTEMA] Trato finalizado con éxito. Proveedor calificado con ${"★".repeat(selectedRating)}${"☆".repeat(5-selectedRating)}`
          );
          
          notification.success("¡Mandado completado e insignia de confianza actualizada!");
          modal.remove();
          
          // Re-render chat window view to update headers and display system bubble
          await ChatWindow.render(container, { id: this.chatId });
        }
      } catch (err) {
        console.error(err);
        modal.remove();
      }
    });
  }

  static setupRealtimeMessages() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    this.messagesSubscription = ChatService.subscribeToMessages(this.chatId, async (newMessage) => {
      if (newMessage.sender_id !== this.currentUserId) {
        await this.refreshMessages();
      }
    });
  }
}
