import { AuthService } from '../../services/auth-service';
import { router } from '../../router';
import { notification } from '../common/notification';
import { getStates, getMunicipalities, getColonias } from '../../utils/geo-data';
import { PAYMENT_METHODS } from '../../utils/helpers';
import { GeoService } from '../../services/geo-service';

export class RegisterForm {
  static async render(container) {
    const states = getStates();

    // Map payment methods to checkbox markup (High Contrast Light Theme)
    const paymentMethodsHtml = Object.entries(PAYMENT_METHODS).map(([key, method]) => `
      <label class="payment-method-card flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-200 bg-slate-50 cursor-pointer select-none transition-all duration-200 hover:border-brand-500/50 hover:bg-slate-100/50 text-center relative group">
        <input type="checkbox" name="payments" value="${key}" class="hidden peer">
        <!-- Visual check ring -->
        <span class="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all">
          <i class="fa-solid fa-check text-[9px] text-white hidden peer-checked:block"></i>
        </span>
        <i class="${method.icon} text-lg mb-2 text-slate-400 group-hover:text-brand-650 transition-colors"></i>
        <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">${method.label}</span>
      </label>
    `).join('');

    container.innerHTML = `
      <div class="flex-grow flex flex-col items-center justify-center p-4 md:p-8 my-6 animate-fade-in">
        <div class="w-full max-w-lg bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 shadow-2xl relative overflow-hidden">
          
          <!-- Decorative ambient accent -->
          <div class="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-accent-500/5 blur-2xl"></div>

          <!-- Header -->
          <div class="flex flex-col items-center text-center mb-8 relative z-10">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
              <span class="font-outfit font-black text-white text-xl">D</span>
            </div>
            <h1 class="font-outfit font-black text-3xl tracking-tight text-slate-900">Crea tu Cuenta</h1>
            <p class="text-xs text-slate-650 mt-1.5 leading-relaxed font-bold">Únete a la red P2P independiente de mandados en México</p>
          </div>

          <!-- Registration Form -->
          <form id="register-form" class="space-y-5 relative z-10">
            
            <!-- Step 1: Account Credentials -->
            <div class="space-y-4">
              <h2 class="text-xs font-extrabold text-brand-700 tracking-widest uppercase border-b border-slate-200 pb-1.5">1. Acceso de Usuario</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="reg-email" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Correo Electrónico *</label>
                  <input type="email" id="reg-email" required placeholder="correo@ejemplo.com"
                    class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
                </div>
                
                <div>
                  <label for="reg-password" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Contraseña *</label>
                  <input type="password" id="reg-password" required placeholder="Mínimo 6 caracteres"
                    class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
                </div>
              </div>
            </div>

            <!-- Step 2: Personal Profile -->
            <div class="space-y-4 pt-2">
              <h2 class="text-xs font-extrabold text-brand-700 tracking-widest uppercase border-b border-slate-200 pb-1.5">2. Perfil e Identidad</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="reg-fullname" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nombre Completo *</label>
                  <input type="text" id="reg-fullname" required placeholder="Como aparece en tu INE"
                    class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
                </div>
                
                <div>
                  <label for="reg-phone" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Número Celular *</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none text-xs font-bold">+52</span>
                    <input type="tel" id="reg-phone" required placeholder="10 dígitos" maxlength="10"
                      class="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-sm font-semibold placeholder:text-slate-400">
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Location (Mexico Geo Cascading Select & CP Autocomplete) -->
            <div class="space-y-4 pt-2">
              <h2 class="text-xs font-extrabold text-brand-700 tracking-widest uppercase border-b border-slate-200 pb-1.5">3. Ubicación Frecuente</h2>
              
              <!-- CP Autocomplete input -->
              <div class="max-w-xs">
                <label for="reg-cp" class="block text-[10px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Código Postal (Autocompletar CP)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <i class="fa-solid fa-map-location-dot text-brand-650"></i>
                  </span>
                  <input type="tel" id="reg-cp" maxlength="5" placeholder="Escribe tu CP (ej: 03100)"
                    class="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-xs font-semibold placeholder:text-slate-400">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label for="reg-state" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Estado *</label>
                  <select id="reg-state" required
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm cursor-pointer focus:border-brand-500 focus:bg-white font-semibold">
                    <option value="">Selecciona...</option>
                    ${states.map(s => `<option value="${s.code}">${s.name}</option>`).join('')}
                  </select>
                </div>
                
                <div>
                  <label for="reg-municipality" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Alcaldía / Mpio *</label>
                  <select id="reg-municipality" required disabled
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-450 text-sm cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 font-semibold">
                    <option value="">Selecciona Estado...</option>
                  </select>
                </div>
                
                <div>
                  <label for="reg-colonia" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Colonia *</label>
                  <select id="reg-colonia" required disabled
                    class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-450 text-sm cursor-pointer focus:border-brand-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 font-semibold">
                    <option value="">Selecciona Alcaldía...</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 4: Payments Preferences (Custom Selectable Grid Cards) -->
            <div class="space-y-4 pt-2">
              <h2 class="text-xs font-extrabold text-brand-700 tracking-widest uppercase border-b border-slate-200 pb-1.5">4. Pagos Aceptados</h2>
              <p class="text-[11px] text-slate-600 leading-relaxed -mt-2 font-semibold">Indica qué formas de pago prefieres recibir por tus trabajos (acuerdo 100% offline).</p>
              
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="payment-checkbox-grid">
                ${paymentMethodsHtml}
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="reg-submit-btn"
              class="w-full py-3.5 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4">
              <span>Registrarse y Crear Perfil</span>
              <i class="fa-solid fa-user-plus"></i>
            </button>
          </form>

          <!-- Back to login link -->
          <div class="mt-8 pt-6 border-t border-slate-200 text-center">
            <p class="text-xs text-slate-650 font-bold">
              ¿Ya tienes una cuenta? 
              <a href="#/auth" class="text-brand-600 hover:text-brand-500 hover:underline font-extrabold ml-1">Inicia sesión aquí</a>
            </p>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  static attachEvents() {
    const cpInput = document.getElementById('reg-cp');
    const stateSelect = document.getElementById('reg-state');
    const muniSelect = document.getElementById('reg-municipality');
    const colSelect = document.getElementById('reg-colonia');
    const checkboxGrid = document.getElementById('payment-checkbox-grid');
    const form = document.getElementById('register-form');

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
                colSelect.value = data.colonias[0]; // Pre-select first colonia
              }
              
              notification.success("¡Ubicación autocompletada con éxito!");
            } else {
              notification.warning("Código Postal no encontrado. Introduce tu dirección manualmente.");
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

    // Handle interactive style highlights for payment methods
    if (checkboxGrid) {
      const labels = checkboxGrid.querySelectorAll('.payment-method-card');
      labels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            label.classList.add('border-brand-500', 'bg-brand-500/10');
            label.classList.remove('border-slate-700', 'bg-slate-900/40');
            const checkRing = label.querySelector('span');
            checkRing.classList.add('bg-brand-500', 'border-brand-500');
            checkRing.querySelector('i').classList.remove('hidden');
          } else {
            label.classList.remove('border-brand-500', 'bg-brand-500/10');
            label.classList.add('border-slate-700', 'bg-slate-900/40');
            const checkRing = label.querySelector('span');
            checkRing.classList.remove('bg-brand-500', 'border-brand-500');
            checkRing.querySelector('i').classList.add('hidden');
          }
        });
      });
    }

    // Step 3 Geo Selectors: Cascading Events
    stateSelect.addEventListener('change', () => {
      const stateCode = stateSelect.value;
      
      // Reset Municipality and Colonia dropdowns
      muniSelect.innerHTML = '<option value="">Selecciona...</option>';
      muniSelect.disabled = true;
      muniSelect.className = "w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/20 text-slate-500 text-sm cursor-pointer";
      
      colSelect.innerHTML = '<option value="">Selecciona Alcaldía...</option>';
      colSelect.disabled = true;
      colSelect.className = "w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/20 text-slate-500 text-sm cursor-pointer";

      if (stateCode) {
        const munis = getMunicipalities(stateCode);
        munis.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          muniSelect.appendChild(opt);
        });
        muniSelect.disabled = false;
        muniSelect.className = "w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-slate-900 text-sm cursor-pointer";
      }
    });

    muniSelect.addEventListener('change', () => {
      const stateCode = stateSelect.value;
      const muniName = muniSelect.value;
      
      // Reset Colonia dropdowns
      colSelect.innerHTML = '<option value="">Selecciona...</option>';
      colSelect.disabled = true;
      colSelect.className = "w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/20 text-slate-500 text-sm cursor-pointer";

      if (stateCode && muniName) {
        const cols = getColonias(stateCode, muniName);
        cols.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          colSelect.appendChild(opt);
        });
        colSelect.disabled = false;
        colSelect.className = "w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-slate-900 text-sm cursor-pointer";
      }
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const fullName = document.getElementById('reg-fullname').value.trim();
      const phoneRaw = document.getElementById('reg-phone').value.trim();
      const state = stateSelect.value;
      const municipality = muniSelect.value;
      const colonia = colSelect.value;

      // Extract checked payment methods
      const checkedPayments = [];
      const checkedEl = form.querySelectorAll('input[name="payments"]:checked');
      checkedEl.forEach(el => checkedPayments.push(el.value));

      // Validations
      if (password.length < 6) {
        notification.error("La contraseña debe tener mínimo 6 caracteres.");
        return;
      }

      if (!/^\d{10}$/.test(phoneRaw)) {
        notification.error("El número celular debe ser de 10 dígitos exactos.");
        return;
      }

      if (checkedPayments.length === 0) {
        notification.error("Debes seleccionar al menos un método de pago preferido.");
        return;
      }

      const submitBtn = document.getElementById('reg-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> Creando perfil...`;

      const profileData = {
        full_name: fullName,
        phone: phoneRaw,
        state,
        municipality,
        colonia,
        preferred_payment_methods: checkedPayments
      };

      try {
        const { user, error } = await AuthService.signUp(email, password, profileData);
        if (error) {
          notification.error(error.message || "Error al registrar la cuenta.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Registrarse y Crear Perfil</span> <i class="fa-solid fa-user-plus"></i>`;
        } else {
          notification.success("¡Cuenta registrada con éxito! Bienvenido a Delio.");
          router.navigate('#/');
        }
      } catch (err) {
        notification.error("Error durante el registro.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Registrarse y Crear Perfil</span> <i class="fa-solid fa-user-plus"></i>`;
      }
    });
  }
}
