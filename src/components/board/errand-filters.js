import { getStates, getMunicipalities, getColonias } from '../../utils/geo-data';
import { JOB_CATEGORIES } from '../../utils/helpers';

export class ErrandFilters {
  /**
   * Renders the complete collapsible filtering header pane.
   * @param {object} activeFilters - Current state of selected filters
   */
  static render(activeFilters = {}) {
    const states = getStates();

    // Map categories to list items
    const categoriesHtml = Object.entries(JOB_CATEGORIES).map(([key, cat]) => {
      const isSelected = activeFilters.category === key;
      return `
        <button class="filter-cat-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all select-none
          ${isSelected 
            ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10' 
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'}" 
          data-category="${key}">
          <i class="${cat.icon} text-[10px]"></i>
          <span>${cat.label.split(' / ')[0]}</span>
        </button>
      `;
    }).join('');

    return `
      <section class="bg-white rounded-2xl border-2 border-slate-200/80 p-4 space-y-4 animate-fade-in relative z-20 shadow-sm">
        
        <!-- Header Row -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-sliders text-brand-600 text-sm"></i>
            <h2 class="text-xs font-extrabold text-slate-850 tracking-wider uppercase">Filtros de Búsqueda</h2>
          </div>
          <button id="filter-reset-btn" class="text-[10px] text-slate-600 hover:text-rose-600 font-extrabold transition-colors uppercase tracking-wider">
            Limpiar Filtros
          </button>
        </div>

        <!-- Geographic Cascading selectors row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- State Selection -->
          <div>
            <label for="filter-state" class="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase">Estado</label>
            <select id="filter-state" 
              class="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-xs cursor-pointer focus:border-brand-500 focus:bg-white">
              <option value="">Todos los Estados</option>
              ${states.map(s => `<option value="${s.code}" ${activeFilters.state === s.code ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>

          <!-- Municipality Selection -->
          <div>
            <label for="filter-municipality" class="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase">Alcaldía / Mpio</label>
            <select id="filter-municipality" ${activeFilters.state ? '' : 'disabled'}
              class="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-xs cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">Todas</option>
              ${activeFilters.state 
                ? getMunicipalities(activeFilters.state).map(m => `<option value="${m}" ${activeFilters.municipality === m ? 'selected' : ''}>${m}</option>`).join('')
                : ''}
            </select>
          </div>

          <!-- Colonia Selection -->
          <div>
            <label for="filter-colonia" class="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase">Colonia</label>
            <select id="filter-colonia" ${activeFilters.municipality ? '' : 'disabled'}
              class="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-xs cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">Todas</option>
              ${activeFilters.state && activeFilters.municipality 
                ? getColonias(activeFilters.state, activeFilters.municipality).map(c => `<option value="${c}" ${activeFilters.colonia === c ? 'selected' : ''}>${c}</option>`).join('')
                : ''}
            </select>
          </div>
        </div>

        <!-- Categories Slider Grid -->
        <div class="space-y-1.5 pt-2">
          <span class="block text-[10px] font-bold text-slate-750 uppercase">Categorías</span>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="filter-cat-container">
            ${categoriesHtml}
          </div>
        </div>

      </section>
    `;
  }

  /**
   * Attaches cascading selection event listeners and reports callbacks on change.
   * @param {Function} onChangeCallback - (updatedFilters) => void
   * @param {object} currentFilters - Active filters snapshot
   */
  static attachEvents(onChangeCallback, currentFilters = {}) {
    const stateSelect = document.getElementById('filter-state');
    const muniSelect = document.getElementById('filter-municipality');
    const colSelect = document.getElementById('filter-colonia');
    const resetBtn = document.getElementById('filter-reset-btn');
    const catContainer = document.getElementById('filter-cat-container');

    const updatedFilters = { ...currentFilters };

    const triggerChange = () => onChangeCallback(updatedFilters);

    if (stateSelect && muniSelect && colSelect) {
      // Cascading State Select
      stateSelect.addEventListener('change', () => {
        const stateCode = stateSelect.value;
        updatedFilters.state = stateCode;
        updatedFilters.municipality = '';
        updatedFilters.colonia = '';
        
        muniSelect.innerHTML = '<option value="">Todas</option>';
        muniSelect.disabled = true;
        
        colSelect.innerHTML = '<option value="">Todas</option>';
        colSelect.disabled = true;

        if (stateCode) {
          const munis = getMunicipalities(stateCode);
          munis.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            muniSelect.appendChild(opt);
          });
          muniSelect.disabled = false;
        }
        triggerChange();
      });

      // Cascading Municipality Select
      muniSelect.addEventListener('change', () => {
        const stateCode = stateSelect.value;
        const muniName = muniSelect.value;
        updatedFilters.municipality = muniName;
        updatedFilters.colonia = '';
        
        colSelect.innerHTML = '<option value="">Todas</option>';
        colSelect.disabled = true;

        if (stateCode && muniName) {
          const cols = getColonias(stateCode, muniName);
          cols.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            colSelect.appendChild(opt);
          });
          colSelect.disabled = false;
        }
        triggerChange();
      });

      // Colonia Select
      colSelect.addEventListener('change', () => {
        updatedFilters.colonia = colSelect.value;
        triggerChange();
      });
    }

    // Category button toggles
    if (catContainer) {
      catContainer.querySelectorAll('.filter-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const clickedCat = btn.dataset.category;
          
          if (updatedFilters.category === clickedCat) {
            // Toggle off
            updatedFilters.category = '';
          } else {
            updatedFilters.category = clickedCat;
          }
          triggerChange();
        });
      });
    }

    // Clear filters reset
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        onChangeCallback({
          state: '',
          municipality: '',
          colonia: '',
          category: ''
        });
      });
    }
  }
}
