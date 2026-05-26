import { router } from '../../router';
import { AuthService } from '../../services/auth-service';
import { notification } from './notification';

export class AppNavbar {
  static render(activeTab = 'board') {
    // Generate navigation layout shell (Light Theme High Contrast)
    const headerHtml = `
      <header class="bg-white sticky top-0 z-40 border-b border-slate-200 px-4 py-3 flex items-center justify-between safe-top shadow-sm">
        <div class="flex items-center gap-2 cursor-pointer" id="nav-logo-btn">
          <img src="/logo.png" alt="Delio Logo" class="h-8 w-auto object-contain drop-shadow-sm">
          <span class="text-[9px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded border border-brand-200">MÉXICO</span>
        </div>
        
        <div class="flex items-center gap-3">
          <button id="nav-logout-btn" class="text-slate-650 hover:text-rose-600 transition-colors p-2 text-sm font-bold" title="Cerrar Sesión">
            <i class="fa-solid fa-right-from-bracket text-base"></i>
          </button>
        </div>
      </header>
    `;

    const getActiveStyle = (tabName) => {
      if (activeTab === tabName) {
        return 'text-brand-700 font-extrabold relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-1 after:rounded-full after:bg-brand-600';
      }
      return 'text-slate-500 hover:text-slate-800 font-semibold';
    };

    const bottomNavbarHtml = `
      <nav class="bg-white fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 safe-bottom shadow-lg">
        <div class="flex items-center justify-around h-16 max-w-lg mx-auto">
          <!-- Board Tab -->
          <a href="#/" class="flex flex-col items-center justify-center w-14 h-12 transition-all ${getActiveStyle('board')}">
            <i class="fa-solid fa-list-check text-lg mb-0.5"></i>
            <span class="text-[10px] tracking-wide">Buscar</span>
          </a>
          
          <!-- Chats Tab -->
          <a href="#/chats" class="flex flex-col items-center justify-center w-14 h-12 transition-all ${getActiveStyle('chats')}">
            <i class="fa-solid fa-message text-lg mb-0.5"></i>
            <span class="text-[10px] tracking-wide">Mensajes</span>
          </a>
          
          <!-- Post Errand Tab -->
          <a href="#/errand/new" class="flex flex-col items-center justify-center w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg hover:scale-105 transition-all duration-200 border border-brand-400/20">
            <i class="fa-solid fa-plus text-xl"></i>
          </a>
          
          <!-- Profile Tab -->
          <a href="#/profile" class="flex flex-col items-center justify-center w-14 h-12 transition-all ${getActiveStyle('profile')}">
            <i class="fa-solid fa-user-circle text-lg mb-0.5"></i>
            <span class="text-[10px] tracking-wide">Mi Perfil</span>
          </a>
        </div>
      </nav>
    `;

    return { headerHtml, bottomNavbarHtml };
  }

  static attachEvents() {
    // Logo redirect to board
    const logo = document.getElementById('nav-logo-btn');
    if (logo) {
      logo.addEventListener('click', () => router.navigate('#/'));
    }

    // Logout actions
    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        const { error } = await AuthService.signOut();
        if (error) {
          notification.error("Error al cerrar sesión.");
        } else {
          notification.success("Sesión cerrada correctamente.");
          router.navigate('#/auth');
        }
      });
    }
  }
}
