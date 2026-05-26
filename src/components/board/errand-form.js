import { DbService } from '../../services/db-service';
import { AuthService } from '../../services/auth-service';
import { AppNavbar } from '../common/navbar';
import { notification } from '../common/notification';
import { getStates, getMunicipalities, getColonias } from '../../utils/geo-data';
import { JOB_CATEGORIES } from '../../utils/helpers';
import { router } from '../../router';
import { GeoService } from '../../services/geo-service';

export class ErrandForm {
  static async render(container) {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.navigate('#/auth');
      return;
    }

    const profile = await AuthService.getProfile(user.id);
    const states = getStates();

    const { headerHtml, bottomNavbarHtml } = AppNavbar.render('post');

    // Compile category options
    const categoryOptionsHtml = Object.entries(JOB_CATEGORIES)
      .filter(([key]) => key !== 'otros')
      .map(([key, cat]) => `<option value="${key}">${cat.label}</option>`).join('');

    container.innerHTML = `
      ${headerHtml}
      
      <main class="flex-grow max-w-lg w-full mx-auto px-4 pt-4 pb-24 animate-fade-in space-y-6">
        
        <div class="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-2xl relative">
          
          <div class="mb-6">
            <h2 class="font-outfit font-black text-2xl text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-brand-650"></i>
              <span>Publicar Mandado u Oficio</span>
            </h2>
            <p class="text-xs text-slate-600 mt-1 font-semibold">Conecta con personas de confianza en tu colonia. Tratos 100% directos sin comisiones.</p>
          </div>

          <form id="new-errand-form" class="space-y-4">
            
            <!-- Category -->
            <div>
              <label for="err-category" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Categoría *</label>
              <select id="err-category" required
                class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white font-semibold">
                <option value="">Selecciona una categoría...</option>
                ${categoryOptionsHtml}
                <option value="otros">Otros Mandados / Oficios</option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label for="err-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Título del Trabajo *</label>
              <input type="text" id="err-title" required placeholder="Ej: Comprar despensa o Reparar fuga de agua" maxlength="60"
                class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
            </div>

            <!-- Description -->
            <div>
              <label for="err-description" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descripción Detallada *</label>
              <textarea id="err-description" required rows="4" placeholder="Describe claramente en qué consiste la actividad, horarios propuestos y requerimientos especiales..."
                class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400"></textarea>
            </div>

            <!-- Budget MXN -->
            <div>
              <label for="err-budget" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Presupuesto Propuesto ($ MXN) *</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none text-sm font-bold">$</span>
                <input type="number" id="err-budget" required min="50" step="10" placeholder="Ej: 200"
                  class="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
              </div>
              <span class="block text-[10px] text-slate-500 mt-1 leading-normal font-semibold">Mínimo sugerido: $50 pesos. Recuerda acordar el método de pago por el chat.</span>
            </div>

            <!-- Location Section (Prefilled with profile locations if available) -->
            <div class="space-y-3 pt-2">
              <h3 class="text-xs font-extrabold text-brand-650 tracking-widest uppercase border-b border-slate-100 pb-1.5">Ubicación del Trabajo</h3>
              
              <!-- CP Autocomplete input -->
              <div class="max-w-xs">
                <label for="err-cp" class="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Código Postal (Autocompletar CP)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <i class="fa-solid fa-map-location-dot text-brand-600"></i>
                  </span>
                  <input type="tel" id="err-cp" maxlength="5" placeholder="Escribe tu CP (ej: 03100)"
                    class="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-xs font-semibold placeholder:text-slate-400">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label for="err-state" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Estado *</label>
                  <select id="err-state" required
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white font-semibold">
                    <option value="">Selecciona...</option>
                    ${states.map(s => `<option value="${s.code}" ${profile?.state === s.code ? 'selected' : ''}>${s.name}</option>`).join('')}
                  </select>
                </div>
                
                <div>
                  <label for="err-municipality" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Alcaldía / Mpio *</label>
                  <select id="err-municipality" required ${profile?.state ? '' : 'disabled'}
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 font-semibold">
                    <option value="">Selecciona...</option>
                    ${profile?.state 
                      ? getMunicipalities(profile.state).map(m => `<option value="${m}" ${profile.municipality === m ? 'selected' : ''}>${m}</option>`).join('')
                      : ''}
                  </select>
                </div>
                
                <div>
                  <label for="err-colonia" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Colonia *</label>
                  <select id="err-colonia" required ${profile?.municipality ? '' : 'disabled'}
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 font-semibold">
                    <option value="">Selecciona...</option>
                    ${profile?.state && profile?.municipality 
                      ? getColonias(profile.state, profile.municipality).map(c => `<option value="${c}" ${profile.colonia === c ? 'selected' : ''}>${c}</option>`).join('')
                      : ''}
                  </select>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" id="err-submit-btn"
              class="w-full py-3.5 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4 uppercase">
              <span>Publicar Mandado</span>
              <i class="fa-solid fa-paper-plane"></i>
            </button>

          </form>

        </div>

      </main>
      
      ${bottomNavbarHtml}
    `;

    AppNavbar.attachEvents();
    this.attachEvents(user.id, profile?.full_name || user.email.split('@')[0], profile?.preferred_payment_methods);
  }

  static attachEvents(userId, posterName, posterPayments) {
    const form = document.getElementById('new-errand-form');
    const cpInput = document.getElementById('err-cp');
    const stateSelect = document.getElementById('err-state');
    const muniSelect = document.getElementById('err-municipality');
    const colSelect = document.getElementById('err-colonia');

    if (!form || !stateSelect || !muniSelect || !colSelect) return;

    // CP Lookup Autocomplete Listener
    if (cpInput) {
      cpInput.addEventListener('input', async () => {
        const cp = cpInput.value.trim();
        if (cp.length === 5) {
          cpInput.disabled = true;
          cpInput.classList.add('border-brand-500', 'ring-1', 'ring-brand-500');
          
          try {
            const data = await GeoService.lookupPostalCode(cp);
            if (data) {
              // 1. Set State
              stateSelect.value = data.stateCode;
              stateSelect.dispatchEvent(new Event('change'));

              // 2. Set Municipality (inject dynamic option if Zippopotam returns one that isn't pre-seeded)
              const hasMuni = Array.from(muniSelect.options).some(opt => opt.value === data.municipality);
              if (!hasMuni) {
                const opt = document.createElement('option');
                opt.value = data.municipality;
                opt.textContent = data.municipality;
                muniSelect.appendChild(opt);
              }
              muniSelect.value = data.municipality;
              muniSelect.dispatchEvent(new Event('change'));

              // 3. Set Colonia (inject dynamic options from data.colonias list)
              colSelect.innerHTML = '<option value="">Selecciona...</option>';
              data.colonias.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col;
                opt.textContent = col;
                colSelect.appendChild(opt);
              });
              
              if (data.colonias.length > 0) {
                colSelect.value = data.colonias[0];
              }
              
              notification.success("¡Ubicación de mandado autocompletada!");
            } else {
              notification.warning("Código Postal no encontrado. Elige la dirección manualmente.");
            }
          } catch (err) {
            console.error(err);
          } finally {
            cpInput.disabled = false;
            cpInput.focus();
          }
        }
      });
    }

    // Cascading state selectors
    stateSelect.addEventListener('change', () => {
      const stateCode = stateSelect.value;
      
      muniSelect.innerHTML = '<option value="">Selecciona...</option>';
      muniSelect.disabled = true;
      muniSelect.className = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-pointer";
      
      colSelect.innerHTML = '<option value="">Selecciona...</option>';
      colSelect.disabled = true;
      colSelect.className = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-pointer";

      if (stateCode) {
        const munis = getMunicipalities(stateCode);
        munis.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          muniSelect.appendChild(opt);
        });
        muniSelect.disabled = false;
        muniSelect.className = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white";
      }
    });

    muniSelect.addEventListener('change', () => {
      const stateCode = stateSelect.value;
      const muniName = muniSelect.value;
      
      colSelect.innerHTML = '<option value="">Selecciona...</option>';
      colSelect.disabled = true;
      colSelect.className = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-pointer";

      if (stateCode && muniName) {
        const cols = getColonias(stateCode, muniName);
        cols.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          colSelect.appendChild(opt);
        });
        colSelect.disabled = false;
        colSelect.className = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white";
      }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('err-title').value.trim();
      const description = document.getElementById('err-description').value.trim();
      const category = document.getElementById('err-category').value;
      const budget = Number(document.getElementById('err-budget').value);
      const state = stateSelect.value;
      const municipality = muniSelect.value;
      const colonia = colSelect.value;

      if (!title || !description || !category || !budget || !state || !municipality || !colonia) {
        notification.error("Por favor completa todos los campos requeridos.");
        return;
      }

      if (budget < 50) {
        notification.error("El presupuesto mínimo propuesto es de $50 pesos.");
        return;
      }

      const submitBtn = document.getElementById('err-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> Publicando mandado...`;

      const jobData = {
        poster_id: userId,
        poster_name: posterName,
        poster_payment_methods: posterPayments || ['cash', 'spei'],
        title,
        description,
        category,
        budget,
        state,
        municipality,
        colonia
      };

      try {
        const { data, error } = await DbService.postJob(jobData);
        if (error) {
          notification.error("Error al registrar tu mandado en el tablero.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Publicar Mandado</span> <i class="fa-solid fa-paper-plane"></i>`;
        } else {
          notification.success("¡Mandado publicado con éxito! Revisa tus mensajes periódicamente.");
          router.navigate('#/');
        }
      } catch (err) {
        notification.error("Ocurrió un error inesperado al subir la información.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Publicar Mandado</span> <i class="fa-solid fa-paper-plane"></i>`;
      }
    });
  }
}
