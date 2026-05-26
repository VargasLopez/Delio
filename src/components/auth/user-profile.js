import { AuthService } from '../../services/auth-service';
import { AppNavbar } from '../common/navbar';
import { notification } from '../common/notification';
import { getStates, getMunicipalities, getColonias } from '../../utils/geo-data';
import { PAYMENT_METHODS } from '../../utils/helpers';
import { router } from '../../router';

export class UserProfile {
  static async render(container) {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      router.navigate('#/auth');
      return;
    }

    // Fetch deep profile details from DB
    const profile = await AuthService.getProfile(user.id);
    if (!profile) {
      notification.error("No se pudo cargar el perfil.");
      return;
    }

    const { headerHtml, bottomNavbarHtml } = AppNavbar.render('profile');

    // Get Payment methods indicators (High Contrast Light Theme)
    const paymentsHtml = Object.entries(PAYMENT_METHODS).map(([key, method]) => {
      const isAccepted = profile.preferred_payment_methods?.includes(key);
      return `
        <div class="flex items-center gap-3 p-3 rounded-xl border-2 ${isAccepted ? 'border-brand-500/40 bg-brand-50/60' : 'border-slate-200 bg-slate-100/40 opacity-40'} transition-all shadow-sm">
          <i class="${method.icon} text-lg ${isAccepted ? 'text-brand-700' : 'text-slate-400'}"></i>
          <div>
            <p class="text-xs font-extrabold ${isAccepted ? 'text-slate-900' : 'text-slate-400'}">${method.label}</p>
            <p class="text-[10px] text-slate-500 font-semibold">${method.desc}</p>
          </div>
          ${isAccepted ? '<i class="fa-solid fa-circle-check text-brand-600 text-xs ml-auto"></i>' : ''}
        </div>
      `;
    }).join('');

    // Generate INE status block (High Contrast Light Theme)
    let ineStatusHtml = '';
    if (profile.is_ine_verified) {
      ineStatusHtml = `
        <div class="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 flex items-start gap-3 shadow-sm">
          <i class="fa-solid fa-shield-check text-emerald-600 text-2xl mt-0.5 animate-bounce flex-shrink-0"></i>
          <div>
            <h3 class="text-xs font-bold text-emerald-800 tracking-wide uppercase">Identificación INE Validada</h3>
            <p class="text-[11px] text-slate-700 mt-1 leading-relaxed font-semibold">Tu cuenta cuenta con insignia de confianza y verificación INE aprobada. Tus publicaciones tendrán prioridad visual.</p>
          </div>
        </div>
      `;
    } else if (profile.ine_attachment_url) {
      ineStatusHtml = `
        <div class="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/70 flex items-start gap-3 shadow-sm">
          <i class="fa-solid fa-hourglass-half text-amber-600 text-lg mt-0.5 animate-spin flex-shrink-0" style="animation-duration: 4s;"></i>
          <div>
            <h3 class="text-xs font-bold text-amber-800 tracking-wide uppercase">INE Pendiente de Aprobación</h3>
            <p class="text-[11px] text-slate-700 mt-1 leading-relaxed font-semibold">Hemos recibido tu imagen de INE. Nuestro equipo está revisando los datos de tu cuenta. Esto suele tomar menos de 2 horas.</p>
          </div>
        </div>
      `;
    } else {
      ineStatusHtml = `
        <div class="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/50 flex flex-col gap-3 shadow-sm">
          <div class="flex items-start gap-3">
            <i class="fa-solid fa-triangle-exclamation text-rose-600 text-lg mt-0.5 flex-shrink-0"></i>
            <div>
              <h3 class="text-xs font-bold text-rose-800 tracking-wide uppercase">Verificación INE Faltante</h3>
              <p class="text-[11px] text-slate-700 mt-0.5 leading-relaxed font-semibold">Para poder postularte a mandados o contactar clientes de forma prioritaria, te sugerimos subir una foto de tu INE (Placeholder PWA).</p>
            </div>
          </div>
          <div class="relative mt-1">
            <input type="file" id="ine-file-input" accept="image/*" class="hidden">
            <button id="ine-upload-btn" class="w-full py-2.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-cloud-arrow-up text-brand-600"></i>
              <span>Cargar Foto de INE</span>
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      ${headerHtml}
      
      <main class="flex-grow max-w-lg w-full mx-auto px-4 pt-4 pb-24 animate-fade-in space-y-6">
        
        <!-- Profile Banner Card (Light Theme High Contrast) -->
        <div class="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-md relative overflow-hidden flex flex-col items-center text-center">
          <div class="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-brand-500/5 blur-2xl"></div>
          
          <div class="relative mb-3">
            <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-700 to-accent-600 flex items-center justify-center shadow-md border-2 border-white">
              <span class="text-2xl font-black text-white font-outfit uppercase">${profile.full_name?.charAt(0) || 'U'}</span>
            </div>
            ${profile.is_ine_verified ? `
              <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md" title="Perfil Verificado">
                <i class="fa-solid fa-check text-[10px] text-white"></i>
              </div>
            ` : ''}
          </div>

          <h2 class="font-outfit font-black text-xl text-slate-900">${profile.full_name}</h2>
          <p class="text-xs text-slate-700 font-bold flex items-center gap-1.5 mt-1 justify-center">
            <i class="fa-solid fa-location-dot text-rose-600"></i>
            <span>${profile.colonia}, ${profile.municipality}, ${profile.state}</span>
          </p>
          
          <div class="mt-4 pt-4 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-left">
            <div>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-extrabold">Celular</span>
              <span class="text-xs font-bold text-slate-800">+52 ${profile.phone}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-extrabold">Email</span>
              <span class="text-xs font-bold text-slate-800 truncate block">${profile.email}</span>
            </div>
          </div>
        </div>

        <!-- Verification Banner Section -->
        <section class="space-y-3">
          <h3 class="text-xs font-extrabold text-slate-700 tracking-widest uppercase flex items-center gap-2">
            <i class="fa-solid fa-id-card text-brand-700"></i>
            <span>Identificación y Confianza</span>
          </h3>
          ${ineStatusHtml}
        </section>

        <!-- Payment Pref Section -->
        <section class="space-y-3">
          <h3 class="text-xs font-extrabold text-slate-700 tracking-widest uppercase flex items-center gap-2">
            <i class="fa-solid fa-wallet text-brand-700"></i>
            <span>Métodos de Pago Preferidos</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${paymentsHtml}
          </div>
        </section>

        <!-- PWA Installation helper section -->
        <section class="p-4 rounded-xl border-2 border-slate-200 bg-white space-y-2 shadow-sm">
          <h3 class="text-xs font-extrabold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-mobile-screen-button text-accent-600"></i>
            <span>Delio en tu Pantalla de Inicio</span>
          </h3>
          <p class="text-[11px] text-slate-650 leading-relaxed font-semibold">Instala Delio como aplicación móvil nativa. Funciona sin consumir espacio y accede directamente desde tu pantalla principal.</p>
          <button id="pwa-install-btn" class="hidden text-xs text-brand-700 hover:text-brand-850 font-extrabold flex items-center gap-1.5 mt-1.5">
            <i class="fa-solid fa-download"></i> Instalar ahora mismo
          </button>
        </section>

      </main>

      ${bottomNavbarHtml}
    `;

    AppNavbar.attachEvents();
    this.attachEvents(profile.id);
  }

  static attachEvents(userId) {
    const ineUploadBtn = document.getElementById('ine-upload-btn');
    const ineFileInput = document.getElementById('ine-file-input');

    if (ineUploadBtn && ineFileInput) {
      ineUploadBtn.addEventListener('click', () => ineFileInput.click());
      
      ineFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
          notification.error("La imagen no debe superar los 5MB.");
          return;
        }

        ineUploadBtn.disabled = true;
        ineUploadBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1.5"></i> Procesando archivo...`;

        try {
          const { success, error } = await AuthService.uploadIne(userId, file);
          if (error) {
            notification.error("Error al procesar la identificación.");
            ineUploadBtn.disabled = false;
            ineUploadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-brand-650 mr-1.5"></i> Cargar Foto de INE`;
          } else {
            notification.success("¡INE cargado con éxito! Enviado a revisión.");
            this.render(document.getElementById('app'));
          }
        } catch (err) {
          notification.error("Error al subir archivo.");
          ineUploadBtn.disabled = false;
          ineUploadBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-brand-650 mr-1.5"></i> Cargar Foto de INE`;
        }
      });
    }

    // Monitor PWA installation button display
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn && window.deferredPrompt) {
      installBtn.classList.remove('hidden');
      installBtn.addEventListener('click', async () => {
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) return;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          console.log('[Delio PWA] User accepted installation prompt');
        }
        window.deferredPrompt = null;
        installBtn.classList.add('hidden');
      });
    }
  }
}
