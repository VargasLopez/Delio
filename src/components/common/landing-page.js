import { router } from '../../router';

export class LandingPage {
  static async render(container) {
    // Generate full landing page layout (Light Theme High Contrast)
    container.innerHTML = `
      <div class="flex flex-col min-h-screen bg-slate-50 text-slate-900 animate-fade-in relative z-10">
        
        <!-- Header Bar -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-2">
            <img src="./logo.png" alt="Delio Logo" class="h-8 w-auto object-contain drop-shadow-sm">
          </div>
          <div class="flex gap-2">
            <a href="#/auth" class="px-3.5 py-1.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-500 font-extrabold text-xs transition-all shadow-sm">
              Ingresar
            </a>
            <a href="#/register" class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs transition-all shadow-sm shadow-brand-650/10">
              Registrarse
            </a>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="max-w-lg w-full mx-auto px-4 py-8 text-center space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-extrabold tracking-wide uppercase">
            <i class="fa-solid fa-bolt animate-pulse"></i>
            <span>Plataforma P2P Independiente</span>
          </div>
          <h1 class="font-outfit font-black text-3xl md:text-4xl text-slate-900 leading-tight">
            Oficios y mandados en tu zona. <br>
            <span class="bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent">Sin comisiones.</span>
          </h1>
          <p class="text-xs text-slate-650 leading-relaxed font-semibold max-w-sm mx-auto">
            Delio es la primera red de mandados y oficios 100% gratuita para México. Conectamos directamente a clientes y proveedores locales sin intermediarios legales ni comisiones bancarias.
          </p>
          <div class="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <a href="#/register" class="w-full py-3.5 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2">
              <span>Crear Cuenta Gratis</span>
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="max-w-lg w-full mx-auto px-4 py-6 space-y-4">
          <h2 class="text-xs font-black text-slate-500 tracking-widest uppercase text-center">¿Cómo funciona Delio?</h2>
          
          <div class="grid grid-cols-1 gap-4">
            <!-- Step 1 -->
            <div class="bg-white border-2 border-slate-200/80 p-4 rounded-xl flex gap-3 shadow-sm">
              <div class="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                1
              </div>
              <div>
                <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Busca o publica mandados</h3>
                <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-semibold">Describe qué necesitas (limpieza, reparaciones, entrega) o navega por los encargos activos en tu colonia filtrando por código postal.</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="bg-white border-2 border-slate-200/80 p-4 rounded-xl flex gap-3 shadow-sm">
              <div class="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                2
              </div>
              <div>
                <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Negocia directo en el chat</h3>
                <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-semibold">Chatea en tiempo real con total privacidad. Al ser un directorio abierto, acuerdas la logística y el precio final de forma 100% directa.</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="bg-white border-2 border-slate-200/80 p-4 rounded-xl flex gap-3 shadow-sm">
              <div class="w-8 h-8 rounded-lg bg-accent-50 border border-accent-200 text-accent-700 font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                3
              </div>
              <div>
                <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Paga de forma offline</h3>
                <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-semibold">Al terminar el trabajo, liquida el pago acordado directamente mediante efectivo físico o transferencia SPEI personal. Delio maneja $0 comisiones.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Dynamic Accordion Information Center -->
        <section class="max-w-lg w-full mx-auto px-4 py-8 space-y-3">
          <h2 class="text-xs font-black text-slate-500 tracking-widest uppercase text-center mb-4">Centro de Información Legal y Acerca de</h2>

          <div class="space-y-2" id="landing-accordion-parent">
            
            <!-- About Tab -->
            <div class="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
              <button class="accordion-trigger w-full px-4 py-3 text-left font-bold text-xs uppercase text-slate-800 flex items-center justify-between focus:bg-slate-50/50" data-target="about-content">
                <span>Acerca de Delio (Quiénes Somos)</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>
              </button>
              <div id="about-content" class="accordion-content hidden px-4 pb-4 pt-1 border-t border-slate-100 text-[11px] text-slate-700 leading-relaxed font-semibold space-y-2">
                <p>Delio (Trato en Galés) nació como una iniciativa independiente de código abierto para dotar al mercado mexicano de una red segura, libre y descentralizada de oficios y mandados.</p>
                <p>A diferencia de las plataformas tradicionales que retienen hasta el 30% del salario de los trabajadores bajo conceptos de comisiones de intermediación, pasarelas de pago y retenciones fiscales, Delio actúa únicamente como un <strong>directorio de enlace P2P de código abierto</strong>.</p>
                <p>Nuestra misión es devolver el control económico absoluto a los trabajadores y publicadores de mandados honestos en México, fomentando la confianza comunitaria y vecinal.</p>
              </div>
            </div>

            <!-- Terms of Service Tab -->
            <div class="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
              <button class="accordion-trigger w-full px-4 py-3 text-left font-bold text-xs uppercase text-slate-800 flex items-center justify-between focus:bg-slate-50/50" data-target="terms-content">
                <span>Términos de Servicio (Deslinde de Responsabilidad)</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>
              </button>
              <div id="terms-content" class="accordion-content hidden px-4 pb-4 pt-1 border-t border-slate-100 text-[11px] text-slate-700 leading-relaxed font-semibold space-y-2">
                <p class="text-rose-600 font-extrabold uppercase text-[10px] tracking-wide mb-1">⚠️ AVISO IMPORTANTE DE DESLINDE DE RESPONSABILIDAD:</p>
                <p>1. <strong>Ausencia de Intermediación Monetaria</strong>: Delio es un directorio libre de cargos. No procesa pagos, cobros, garantías, ni recauda impuestos. Todos los acuerdos monetarios son concluidos directa y exclusivamente entre los propios usuarios de manera externa y offline.</p>
                <p>2. <strong>Deslinde de Responsabilidad Civil y Laboral</strong>: Delio no tiene relación de subordinación, empleo, ni agencia con los usuarios. Bajo ninguna circunstancia Delio se hará responsable por pérdidas, daños materiales, desacuerdos de pago, ni incidentes de seguridad que acontezcan durante la ejecución física de las tareas acordadas de forma externa.</p>
                <p>3. <strong>Verificación del Usuario</strong>: La carga de INE sirve como un flujo demostrativo visual para generar confianza comunitaria voluntaria. Es responsabilidad exclusiva de cada usuario verificar la identidad de su contraparte antes de iniciar cualquier interacción física u offline.</p>
              </div>
            </div>

            <!-- Privacy Policy Tab -->
            <div class="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
              <button class="accordion-trigger w-full px-4 py-3 text-left font-bold text-xs uppercase text-slate-800 flex items-center justify-between focus:bg-slate-50/50" data-target="privacy-content">
                <span>Política de Privacidad</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>
              </button>
              <div id="privacy-content" class="accordion-content hidden px-4 pb-4 pt-1 border-t border-slate-100 text-[11px] text-slate-700 leading-relaxed font-semibold space-y-2">
                <p>1. <strong>Datos No Recabados</strong>: Delio no almacena claves bancarias, tarjetas de crédito, coordenadas de rastreo GPS exactas en tiempo real, ni información fiscal confidencial. Evitamos recopilar cualquier dato financiero para garantizar tu tranquilidad legal.</p>
                <p>2. <strong>Datos Recopilados</strong>: Al registrarte voluntariamente, recopilamos únicamente tu nombre completo, correo electrónico de acceso, número celular de 10 dígitos (para fines de enlace directo vía llamada o WhatsApp externo), estado y municipio. La foto de tu identificación oficial (INE) se procesa localmente en formato base64 únicamente para verificar el estatus del perfil.</p>
                <p>3. <strong>Uso de la Información</strong>: Tus datos de perfil (nombre, teléfono e INE verificado) se muestran exclusivamente a otros usuarios registrados dentro de la aplicación para permitir la comunicación y logística directa de las tareas.</p>
              </div>
            </div>

            <!-- Cookie Policy Tab -->
            <div class="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
              <button class="accordion-trigger w-full px-4 py-3 text-left font-bold text-xs uppercase text-slate-800 flex items-center justify-between focus:bg-slate-50/50" data-target="cookies-content">
                <span>Política de Cookies</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>
              </button>
              <div id="cookies-content" class="accordion-content hidden px-4 pb-4 pt-1 border-t border-slate-100 text-[11px] text-slate-700 leading-relaxed font-semibold space-y-2">
                <p>1. <strong>Uso de Cookies Técnicas</strong>: Delio utiliza únicamente cookies y almacenamiento local técnico estrictamente necesario (localStorage y sessionStorage) para mantener iniciada tu sesión de forma segura.</p>
                <p>2. <strong>Ausencia de Rastreadores Comerciales</strong>: No integramos píxeles de rastreo de redes sociales, cookies publicitarias de terceros, ni scripts de analíticas comerciales invasivos. Tu navegación y búsquedas locales son 100% privadas.</p>
              </div>
            </div>

          </div>
        </section>

        <!-- Footer Section -->
        <footer class="bg-white border-t border-slate-200 py-6 px-4 mt-auto text-center space-y-2">
          <p class="text-[10px] text-slate-500 font-semibold">&copy; 2026 Delio PWA México. Red de Enlace Directo sin Fines de Lucro.</p>
          <p class="text-[9px] text-slate-400 leading-normal max-w-xs mx-auto font-medium">Desarrollado con el objetivo de fomentar el trabajo independiente libre de abusos corporativos y comisiones en México.</p>
        </footer>

      </div>
    `;

    this.attachEvents();
  }

  static attachEvents() {
    // Accordion expand/collapse click bindings
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const targetId = trigger.dataset.target;
        const targetContent = document.getElementById(targetId);
        const icon = trigger.querySelector('i');

        const isHidden = targetContent.classList.contains('hidden');

        // Collapse all others first for a clean accordion effect
        document.querySelectorAll('.accordion-content').forEach(content => {
          content.classList.add('hidden');
        });
        document.querySelectorAll('.accordion-trigger i').forEach(i => {
          i.classList.remove('rotate-180');
        });

        // Toggle clicked
        if (isHidden) {
          targetContent.classList.remove('hidden');
          icon.classList.add('rotate-180');
        }
      });
    });
  }
}
