/**
 * Utility helper functions for Delio Mexican Job Board
 */

/**
 * Formats a number to Mexican Peso (MXN) format.
 * @param {number} amount
 * @returns {string} e.g. $1,250.00
 */
export function formatMXN(amount) {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Computes a human-friendly "time ago" string in Spanish.
 * @param {string|Date} dateVal
 * @returns {string} e.g. "hace 3 horas", "hace 2 días"
 */
export function timeAgo(dateVal) {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 0) return "ahora mismo";
  if (seconds < 60) return "hace unos momentos";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  
  const months = Math.floor(days / 30);
  return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

/**
 * Metadata and display attributes for accepted payment methods in Mexico.
 */
export const PAYMENT_METHODS = {
  cash: {
    label: "Efectivo",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: "fa-solid fa-money-bill-wave",
    desc: "Pago físico en efectivo al terminar."
  },
  spei: {
    label: "Transferencia SPEI",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: "fa-solid fa-building-columns",
    desc: "Transferencia bancaria directa por SPEI."
  },
  spin: {
    label: "Spin by OXXO",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    icon: "fa-solid fa-store",
    desc: "Depósito o envío mediante Spin OXXO."
  },
  mercado_pago: {
    label: "Mercado Pago",
    color: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: "fa-solid fa-wallet",
    desc: "Transferencia digital vía Mercado Pago."
  }
};

/**
 * Translates category keys to beautiful display labels and icons.
 */
export const JOB_CATEGORIES = {
  mandado: {
    label: "Mandado / Delivery",
    icon: "fa-solid fa-bicycle",
    color: "from-cyan-500 to-blue-500"
  },
  limpieza: {
    label: "Limpieza",
    icon: "fa-solid fa-broom",
    color: "from-emerald-500 to-teal-500"
  },
  reparaciones: {
    label: "Reparaciones / Plomería",
    icon: "fa-solid fa-wrench",
    color: "from-amber-500 to-orange-500"
  },
  computacion: {
    label: "Soporte Técnico / PC",
    icon: "fa-solid fa-laptop-code",
    color: "from-purple-500 to-indigo-500"
  },
  clases: {
    label: "Clases / Tutoría",
    icon: "fa-solid fa-book-open",
    color: "from-pink-500 to-rose-500"
  },
  belleza: {
    label: "Estética / Estilista",
    icon: "fa-solid fa-scissors",
    color: "from-teal-400 to-emerald-400"
  },
  otros: {
    label: "Otros Mandados",
    icon: "fa-solid fa-cubes",
    color: "from-slate-500 to-slate-600"
  }
};
