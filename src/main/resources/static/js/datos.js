// Estado de la demo. Sustituye al backend hasta que exista: las reglas son las mismas que validará la API.
import { almacen } from './util.js';

const CLAVE = 'pachangueo-demo-v1';
const YO = 'yo';

let estado = null;
const oyentes = new Set();

/** Llama a fn cada vez que cambian los datos. */
export const alCambiar = (fn) => oyentes.add(fn);

function guardar() {
  almacen.guardar(CLAVE, {
    ...estado,
    partidos: estado.partidos.map((p) => ({ ...p, inicio: p.inicio.toISOString(), fin: p.fin.toISOString() })),
  });
  oyentes.forEach((fn) => fn());
}

function revivir(guardado) {
  return { ...guardado, partidos: guardado.partidos.map((p) => ({ ...p, inicio: new Date(p.inicio), fin: new Date(p.fin) })) };
}

function fechaRelativa(dias, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + dias, h, m);
}

function desdeDemo(demo) {
  return {
    usuario: demo.usuario,
    centroPorDefecto: demo.centroPorDefecto,
    pistas: demo.pistas,
    avisos: demo.avisos,
    partidos: demo.partidos.map((p) => {
      const jugadores = Array.from({ length: p.otros }, (_, i) => `${p.id}-j${i + 1}`);
      if (p.yo) jugadores.unshift(YO);
      const esMio = p.organizador === YO;
      return {
        id: p.id, pistaId: p.pistaId, modalidad: p.modalidad,
        inicio: fechaRelativa(p.dia, p.inicio), fin: fechaRelativa(p.dia, p.fin),
        minimo: p.minimo, maximo: p.maximo,
        organizadorId: esMio ? YO : `org-${p.id}`,
        organizador: esMio ? demo.usuario.nombre : p.organizador,
        jugadores, cancelado: Boolean(p.cancelado),
      };
    }),
  };
}

export async function cargar() {
  const guardado = almacen.leer(CLAVE);
  if (guardado) { estado = revivir(guardado); return; }
  const resp = await fetch('datos/demo.json');
  estado = desdeDemo(await resp.json());
}

export async function reiniciar() {
  almacen.borrar(CLAVE);
  await cargar();
  oyentes.forEach((fn) => fn());
}

// ---------- Lecturas ----------
export const usuario = () => estado.usuario;
export const centroPorDefecto = () => estado.centroPorDefecto;
export const pistas = () => estado.pistas;
export const pista = (id) => estado.pistas.find((p) => p.id === id);
export const partido = (id) => estado.partidos.find((p) => p.id === id);

export const apuntado = (p) => p.jugadores.includes(YO);
export const esOrganizador = (p) => p.organizadorId === YO;
export const libres = (p) => p.maximo - p.jugadores.length;
export const faltanParaMinimo = (p) => Math.max(0, p.minimo - p.jugadores.length);
const futuro = (p) => p.fin > new Date();
const porFecha = (a, b) => a.inicio - b.inicio;

/** Partidos activos (no cancelados ni terminados) de una pista, por fecha. */
export const partidosDePista = (pistaId) =>
  estado.partidos.filter((p) => p.pistaId === pistaId && !p.cancelado && futuro(p)).sort(porFecha);

/** Estado del marcador: libre si algún partido tiene plazas, completa si todos están llenos, sin si no hay partidos. */
export function estadoPista(pistaId) {
  const lista = partidosDePista(pistaId);
  if (lista.length === 0) return { estado: 'sin', globo: null };
  const conPlazas = lista.find((p) => libres(p) > 0);
  if (conPlazas) return { estado: 'libre', globo: `${conPlazas.jugadores.length}/${conPlazas.maximo}` };
  return { estado: 'completa', globo: 'LLENO' };
}

export const misPartidos = () =>
  estado.partidos.filter((p) => apuntado(p) && !esOrganizador(p) && futuro(p)).sort(porFecha);
export const organizados = () => estado.partidos.filter((p) => esOrganizador(p) && futuro(p)).sort(porFecha);

export const avisos = () => estado.avisos;
export const noLeidos = () => estado.avisos.filter((a) => !a.leido).length;

// ---------- Acciones (devuelven un mensaje de error o null) ----------
export function apuntar(id) {
  const p = partido(id);
  if (!p || p.cancelado) return 'Este partido ya no existe.';
  if (!futuro(p)) return 'El partido ya ha terminado.';
  if (apuntado(p)) return 'Ya estás apuntado.';
  if (libres(p) <= 0) return 'El partido está completo.';
  p.jugadores.push(YO);
  guardar();
  return null;
}

export function darseDeBaja(id) {
  const p = partido(id);
  if (!p || !apuntado(p)) return 'No estás apuntado a este partido.';
  if (esOrganizador(p)) return 'Eres el organizador: si no puedes ir, cancela el partido.';
  p.jugadores = p.jugadores.filter((j) => j !== YO);
  guardar();
  return null;
}

export function cancelar(id) {
  const p = partido(id);
  if (!p || !esOrganizador(p)) return 'Solo el organizador puede cancelar el partido.';
  if (p.cancelado) return 'El partido ya estaba cancelado.';
  p.cancelado = true;
  guardar();
  return null;
}

/**
 * Crea un partido. datos: { pistaId, modalidad, fecha "AAAA-MM-DD", inicio "HH:MM", fin "HH:MM", minimo, maximo }.
 * Devuelve { error } o { partido }.
 */
export function crearPartido(datos) {
  const pi = pista(datos.pistaId);
  if (!pi) return { error: 'Elige una pista en el mapa.' };
  if (!['F7', 'F11'].includes(datos.modalidad)) return { error: 'Elige la modalidad.' };
  if (pi.tipo === 'F7' && datos.modalidad === 'F11') return { error: 'Esta pista es de fútbol 7.' };
  if (!datos.fecha || !datos.inicio || !datos.fin) return { error: 'Indica la fecha y las horas.' };
  const inicio = new Date(`${datos.fecha}T${datos.inicio}`);
  const fin = new Date(`${datos.fecha}T${datos.fin}`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return { error: 'La fecha o la hora no son válidas.' };
  if (inicio <= new Date()) return { error: 'El partido tiene que empezar más tarde que ahora.' };
  if (fin <= inicio) return { error: 'La hora de fin tiene que ser posterior a la de inicio.' };
  const minimo = Number(datos.minimo);
  const maximo = Number(datos.maximo);
  if (!Number.isInteger(minimo) || minimo < 2) return { error: 'El mínimo tiene que ser al menos 2 jugadores.' };
  if (!Number.isInteger(maximo) || maximo > 30) return { error: 'El máximo no puede pasar de 30 jugadores.' };
  if (minimo > maximo) return { error: 'El mínimo no puede ser mayor que el máximo.' };
  const choque = partidosDePista(pi.id).find((p) => inicio < p.fin && fin > p.inicio);
  if (choque) {
    const hh = (d) => d.toTimeString().slice(0, 5);
    return { error: `La pista ya tiene un partido de ${hh(choque.inicio)} a ${hh(choque.fin)} a esa hora.` };
  }
  const nuevo = {
    id: `p${Date.now()}`, pistaId: pi.id, modalidad: datos.modalidad, inicio, fin, minimo, maximo,
    organizadorId: YO, organizador: estado.usuario.nombre, jugadores: [YO], cancelado: false,
  };
  estado.partidos.push(nuevo);
  guardar();
  return { partido: nuevo };
}

export function marcarAvisosLeidos() {
  if (noLeidos() === 0) return;
  estado.avisos.forEach((a) => { a.leido = true; });
  guardar();
}

export function cambiarRadio(km) {
  estado.usuario.radioKm = km;
  guardar();
}
