import { AuthService } from '../../services/auth-service';
import { router } from '../../router';
import { notification } from '../common/notification';
import { isMockMode } from '../../services/supabase';

export class LoginForm {
  static async render(container) {
    container.innerHTML = `
      <div class="flex-grow flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 shadow-xl relative overflow-hidden">
          
          <!-- Accent top-right glow -->
          <div class="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-500/10 blur-2xl"></div>
          
          <!-- Logo Header -->
          <div class="flex flex-col items-center text-center mb-8 relative z-10">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
              <span class="font-outfit font-black text-white text-xl">D</span>
            </div>
            <h1 class="font-outfit font-black text-3xl tracking-tight text-slate-900">Ingresar a Delio</h1>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed font-bold">Directorio P2P de Mandados y Oficios en México</p>
          </div>

          <!-- Alert Mock Database -->
          ${isMockMode ? `
            <div class="mb-6 p-3 rounded-lg border-2 border-brand-200 bg-brand-50/60 text-xs text-slate-700 leading-relaxed flex gap-2 font-medium">
              <i class="fa-solid fa-circle-info text-brand-600 mt-0.5 text-sm"></i>
              <div>
                <strong class="text-brand-700 font-bold">Modo Demo Local Activo</strong><br>
                Ingresa cualquier correo y contraseña para probar de inmediato, o crea una cuenta nueva.
              </div>
            </div>
          ` : ''}

          <!-- Form Fields -->
          <form id="login-form" class="space-y-5 relative z-10">
            <div>
              <label for="login-email" class="block text-xs font-bold text-slate-700 tracking-wider mb-2 uppercase">Correo Electrónico</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <i class="fa-solid fa-envelope"></i>
                </span>
                <input type="email" id="login-email" required placeholder="tu@correo.com"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white placeholder:text-slate-400 text-sm font-semibold">
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label for="login-password" class="block text-xs font-bold text-slate-700 tracking-wider uppercase">Contraseña</label>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <i class="fa-solid fa-lock"></i>
                </span>
                <input type="password" id="login-password" required placeholder="••••••••"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white placeholder:text-slate-400 text-sm font-semibold">
              </div>
            </div>

            <button type="submit" id="login-submit-btn"
              class="w-full py-3.5 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2">
              <span>Iniciar Sesión</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          <!-- Footer Navigation Links -->
          <div class="mt-8 pt-6 border-t border-slate-800/80 text-center relative z-10">
            <p class="text-xs text-slate-400">
              ¿No tienes cuenta? 
              <a href="#/register" class="text-brand-400 hover:text-brand-300 hover:underline font-semibold ml-1">Regístrate gratis</a>
            </p>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  static attachEvents() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = document.getElementById('login-submit-btn');

      if (!email || !password) {
        notification.error("Por favor completa todos los campos.");
        return;
      }

      // Add loading spinner state to button
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> Cargando...`;

      try {
        const { user, error } = await AuthService.signIn(email, password);
        if (error) {
          notification.error(error.message || "Credenciales incorrectas.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Iniciar Sesión</span> <i class="fa-solid fa-arrow-right"></i>`;
        } else {
          notification.success(`¡Bienvenido de vuelta, ${user.email.split('@')[0]}!`);
          router.navigate('#/');
        }
      } catch (err) {
        notification.error("Ocurrió un error inesperado.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Iniciar Sesión</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    });
  }
}
