import { DbService } from '../../services/db-service';
import { AuthService } from '../../services/auth-service';
import { AppNavbar } from '../common/navbar';
import { ErrandFilters } from './errand-filters';
import { ErrandCard } from './errand-card';
import { notification } from '../common/notification';
import { router } from '../../router';

export class ErrandBoard {
  static async render(container, activeFilters = {}) {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.navigate('#/auth');
      return;
    }

    // Save active filters to state so we can restore them or update them dynamically
    this.activeFilters = activeFilters;
    this.currentUserId = user.id;

    const { headerHtml, bottomNavbarHtml } = AppNavbar.render('board');

    // Create container shell
    container.innerHTML = `
      ${headerHtml}
      
      <main class="flex-grow max-w-lg w-full mx-auto px-4 pt-4 pb-24 animate-fade-in space-y-4">
        
        <!-- Filter Mount Segment -->
        <div id="filters-container"></div>
        
        <!-- Quick Stats / Active Indicator -->
        <div class="flex items-center justify-between text-[11px] text-slate-600 px-1">
          <span class="flex items-center gap-1.5 font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Directorio en Vivo</span>
          </span>
          <span id="board-count-indicator" class="font-extrabold text-slate-800">Cargando mandados...</span>
        </div>

        <!-- Errand Board List Grid -->
        <div class="grid grid-cols-1 gap-4" id="errands-list-grid">
          <!-- Dynamic cards list loaded here -->
        </div>

        <!-- Floating Mobile Action button -->
        <a href="#/errand/new" class="md:hidden fixed right-5 bottom-20 z-30 w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 border border-brand-400/20 active:scale-95 transition-all">
          <i class="fa-solid fa-plus text-lg"></i>
        </a>

      </main>

      ${bottomNavbarHtml}
    `;

    // Render static filters frame
    const filtersContainer = document.getElementById('filters-container');
    filtersContainer.innerHTML = ErrandFilters.render(this.activeFilters);

    // Initial load list
    await this.refreshErrandsList();

    // Attach static events
    AppNavbar.attachEvents();
    this.attachEvents(container);

    // Set up real-time listener for the live job board
    this.setupRealtimeBoard();
  }

  static async refreshErrandsList() {
    const listGrid = document.getElementById('errands-list-grid');
    const countIndicator = document.getElementById('board-count-indicator');
    
    if (!listGrid) return;

    // Show skeletons loaders (Light Theme)
    listGrid.innerHTML = Array(3).fill(0).map(() => `
      <div class="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 animate-pulse">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-slate-100"></div>
            <div class="space-y-1.5">
              <div class="w-20 h-2 bg-slate-100 rounded"></div>
              <div class="w-10 h-1.5 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div class="w-16 h-3 bg-slate-100 rounded"></div>
        </div>
        <div class="space-y-2">
          <div class="w-full h-3 bg-slate-100 rounded"></div>
          <div class="w-3/4 h-3 bg-slate-100 rounded"></div>
        </div>
        <div class="w-1/2 h-2.5 bg-slate-100 rounded mt-4"></div>
      </div>
    `).join('');

    const { data: errands, error } = await DbService.getJobs(this.activeFilters);

    if (error) {
      listGrid.innerHTML = `
        <div class="text-center py-10 px-4">
          <i class="fa-solid fa-circle-exclamation text-rose-500 text-3xl mb-3"></i>
          <p class="text-xs font-bold text-slate-300">Error al conectar con la base de datos.</p>
          <button id="retry-board-btn" class="mt-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500/50 hover:bg-brand-500/10 text-xs font-semibold text-slate-200">Reintentar</button>
        </div>
      `;
      countIndicator.textContent = "Error de conexión";
      
      const retryBtn = document.getElementById('retry-board-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.refreshErrandsList());
      }
      return;
    }

    countIndicator.textContent = `${errands.length} ${errands.length === 1 ? 'mandado activo' : 'mandados activos'}`;

    if (errands.length === 0) {
      listGrid.innerHTML = `
        <div class="glass border border-slate-800/80 p-8 rounded-2xl text-center space-y-4 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto border border-slate-800 shadow-md">
            <i class="fa-solid fa-folder-open text-slate-600 text-2xl"></i>
          </div>
          <div class="space-y-1">
            <h3 class="font-outfit font-bold text-slate-200 text-base">No hay mandados disponibles</h3>
            <p class="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">No se encontraron mandados activos con los filtros aplicados en esta zona. Prueba ampliando tu búsqueda.</p>
          </div>
          <button id="clear-board-filters" class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500/50 hover:bg-brand-500/10 text-xs font-semibold text-slate-200">Ver todo México</button>
        </div>
      `;
      
      const clearBtn = document.getElementById('clear-board-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.activeFilters = { state: '', municipality: '', colonia: '', category: '' };
          const stateSelect = document.getElementById('filter-state');
          if (stateSelect) {
            stateSelect.value = '';
            stateSelect.dispatchEvent(new Event('change'));
          }
        });
      }
      return;
    }

    // Render cards list
    listGrid.innerHTML = errands.map(job => ErrandCard.render(job, this.currentUserId)).join('');
    
    // Attach chat trigger bindings
    ErrandCard.attachEvents();
  }

  static attachEvents(container) {
    // Dynamic Filter handlers
    ErrandFilters.attachEvents((updatedFilters) => {
      this.activeFilters = updatedFilters;
      this.refreshErrandsList();
    }, this.activeFilters);
  }

  static setupRealtimeBoard() {
    // Clean up past subscriptions
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
    }

    // Set up postgres live channel subscription
    this.boardSubscription = DbService.subscribeToJobs((newJob) => {
      // If new job fits active filters, alert and refresh
      let isMatch = true;
      if (this.activeFilters.state && newJob.state !== this.activeFilters.state) isMatch = false;
      if (this.activeFilters.municipality && newJob.municipality !== this.activeFilters.municipality) isMatch = false;
      if (this.activeFilters.colonia && newJob.colonia !== this.activeFilters.colonia) isMatch = false;
      if (this.activeFilters.category && newJob.category !== this.activeFilters.category) isMatch = false;

      if (isMatch) {
        notification.success(`¡Nuevo mandado publicado! "${newJob.title}"`);
        this.refreshErrandsList();
      }
    });
  }
}
