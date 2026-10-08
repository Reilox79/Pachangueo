// Utilidades sin dependencias.

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para meterlo en HTML. Todo dato que venga del usuario pasa por aquí. */
export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

export const RADIO_TIERRA_KM = 6371;

/** Distancia en km entre dos puntos (Haversine), la misma fórmula que usará el backend. */
export function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

export const formatoKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`);

const fmtDia = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLargo = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Hoy, jue 8 oct", "Mañana, vie 9 oct" o "sáb 10 oct". */
export function textoDia(fecha) {
  const hoy = new Date();
  const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  const base = fmtDia.format(fecha).replace(',', '').replace('.', '');
  if (mismoDia(fecha, hoy)) return `Hoy, ${base}`;
  if (mismoDia(fecha, manana)) return `Mañana, ${base}`;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const textoDiaLargo = (fecha) => fmtLargo.format(fecha);

export const hora = (fecha) => fecha.toTimeString().slice(0, 5);

/** "2026-10-08" en hora local. */
export const isoDia = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

/** Muestra un aviso flotante unos segundos. */
export function avisar(texto, ms = 3500) {
  const caja = document.getElementById('avisos-flotantes');
  const el = document.createElement('div');
  el.className = 'flotante';
  el.textContent = texto;
  caja.replaceChildren(el);
  setTimeout(() => el.remove(), ms);
}

/** Lee y escribe en localStorage sin romper si no está disponible (modo privado, vista previa...). */
export const almacen = {
  leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave)); } catch { return null; }
  },
  guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento: la demo sigue en memoria */ }
  },
  borrar(clave) {
    try { localStorage.removeItem(clave); } catch { /* nada */ }
  },
};
