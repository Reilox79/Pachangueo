// Prototipo de Pachangueo: rutas con #, pantallas y PWA. Los datos son de ejemplo (datos.js).
import * as D from './datos.js';
import { Mapa } from './mapa.js';
import { esc, distanciaKm, formatoKm, textoDia, hora, isoDia, avisar, almacen } from './util.js';

const SESION = 'pachangueo-sesion';
const LEJOS_KM = 40; // Más lejos de Toledo que esto, la demo te sitúa en Toledo.
const pantalla = document.getElementById('pantalla');

let mapa = null;
let posicion = null;
let rutaAnterior = '';
let ubicado = false;
let instalacion = null; // evento beforeinstallprompt guardado

// ---------- Rutas ----------
function ruta() {
  const [nombre = '', param = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { nombre, param: decodeURIComponent(param) };
}

function render() {
  const { nombre, param } = ruta();
  if (rutaAnterior === 'avisos' && nombre !== 'avisos') D.marcarAvisosLeidos();
  rutaAnterior = nombre;

  iniciarMapa();
  pintarPistas(nombre === 'mapa' ? param : null);
  if (!almacen.leer(SESION)) { if (nombre !== 'acceso') location.replace('#/acceso'); else vistaAcceso(); return; }
  if (!ubicado) { ubicado = true; ubicar(); }

  switch (nombre) {
    case 'mapa': return vistaMapa(param);
    case 'crear':
      if (!D.pista(param)) { avisar('Toca una pista del mapa para crear allí el partido.'); location.replace('#/mapa'); return; }
      return vistaCrear(param);
    case 'partidos': return vistaPartidos(param === 'organizo' ? 'organizo' : 'apunto');
    case 'avisos': return vistaAvisos();
    case 'perfil': return vistaPerfil();
    default: location.replace('#/mapa');
  }
}

// ---------- Mapa y ubicación ----------
function iniciarMapa() {
  if (mapa) return;
  posicion = D.centroPorDefecto();
  mapa = new Mapa('mapa', posicion, D.usuario().radioKm, (id) => { location.hash = `#/mapa/${encodeURIComponent(id)}`; });
  mapa.alTocarFondo(() => { if (ruta().nombre === 'mapa' && ruta().param) location.hash = '#/mapa'; });
}

function ubicar() {
  const centro = D.centroPorDefecto();
  if (!('geolocation' in navigator)) { avisar('Tu navegador no da la ubicación: te situamos en el centro de Toledo.'); return; }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const aqui = { lat: coords.latitude, lng: coords.longitude };
      if (distanciaKm(aqui, centro) > LEJOS_KM) {
        avisar('Estás lejos de Toledo: en la demo te situamos allí.');
        return;
      }
      posicion = aqui;
      mapa.moverJugador(posicion);
      mapa.centrar();
      render();
    },
    () => avisar('Sin permiso de ubicación: te situamos en el centro de Toledo.'),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
}

function pintarPistas(elegida) {
  mapa.pintarPistas(D.pistas().map((p) => ({ ...p, ...D.estadoPista(p.id) })), elegida);
}

// ---------- Piezas comunes ----------
const ICONOS = {
  mapa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>',
  partidos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="19" rx="5"/><path d="M2 9h20"/></svg>',
  avisos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 18V11a7 7 0 0 1 14 0v7z"/><circle cx="12" cy="21" r="1.6" fill="currentColor"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="7" r="4.5"/><path d="M3 22v-2a9 9 0 0 1 18 0v2z"/></svg>',
};

function nav(activa) {
  const item = (id, texto, href) =>
    `<a href="${href}" ${activa === id ? 'aria-current="page"' : ''}>${ICONOS[id]}${texto}${id === 'avisos' && D.noLeidos() ? '<span class="punto-aviso" aria-label="Avisos sin leer"></span>' : ''}</a>`;
  return `<nav class="nav" aria-label="Principal">
    ${item('mapa', 'Mapa', '#/mapa')}${item('partidos', 'Partidos', '#/partidos/apunto')}
    <a href="#/crear" class="crear"><span class="mas" aria-hidden="true">+</span>Crear</a>
    ${item('avisos', 'Avisos', '#/avisos')}${item('perfil', 'Perfil', '#/perfil')}
  </nav>`;
}

const pct = (n, total) => `${Math.min(100, Math.round((n / total) * 100))}%`;

function botonPartido(p) {
  if (D.esOrganizador(p)) return `<button class="boton peligro" data-accion="cancelar" data-id="${esc(p.id)}">Cancelar partido</button>`;
  if (D.apuntado(p)) return `<button class="boton secundario" data-accion="baja" data-id="${esc(p.id)}">Darme de baja</button>`;
  if (D.libres(p) <= 0) return '<button class="boton" disabled>Completo</button>';
  return `<button class="boton primario" data-accion="apuntar" data-id="${esc(p.id)}">Apuntarme</button>`;
}

function tarjetaFicha(p) {
  const lleno = D.libres(p) <= 0;
  const n = p.jugadores.length;
  return `<article class="tarjeta">
    <div class="fila">
      <div><p class="cuando">${esc(textoDia(p.inicio))}</p>
        <p class="detalle">${hora(p.inicio)} – ${hora(p.fin)} · organiza ${esc(D.esOrganizador(p) ? 'tú' : p.organizador)}</p></div>
      <span class="chip ${lleno ? 'completo' : 'libre'}">${lleno ? 'Lleno' : `${D.libres(p)} ${D.libres(p) === 1 ? 'plaza' : 'plazas'}`}</span>
    </div>
    <div class="barra ${lleno ? 'llena' : ''}" role="progressbar" aria-label="Jugadores apuntados" aria-valuemin="0" aria-valuemax="${p.maximo}" aria-valuenow="${n}">
      <div class="relleno" style="width:${pct(n, p.maximo)}"></div><span class="minimo" style="left:${pct(p.minimo, p.maximo)}" title="Mínimo para jugar"></span>
    </div>
    <p class="detalle">${n}/${p.maximo} jugadores · mínimo ${p.minimo} para jugar</p>
    ${botonPartido(p)}
  </article>`;
}

function estadoMio(p) {
  if (p.cancelado) return `<span class="chip gris">${D.esOrganizador(p) ? 'Cancelado' : 'Cancelado por el organizador'}</span>`;
  const faltan = D.faltanParaMinimo(p);
  if (faltan > 0) return `<span class="chip aviso">Faltan ${faltan} para el mínimo</span>`;
  return `<span class="chip libre">Confirmado · ${p.jugadores.length}/${p.maximo}</span>`;
}

function tarjetaMia(p) {
  const pi = D.pista(p.pistaId);
  return `<article class="tarjeta blanca ${p.cancelado ? 'apagada' : ''}">
    <a class="fila-izq" href="#/mapa/${encodeURIComponent(p.pistaId)}" style="text-decoration:none;color:inherit">
      <span class="insignia ${p.cancelado ? 'gris' : ''}">${esc(p.modalidad)}</span>
      <span><p class="cuando">${esc(textoDia(p.inicio))}</p><p class="detalle">${hora(p.inicio)} · ${esc(pi?.nombre ?? '')}</p></span>
    </a>
    ${estadoMio(p)}
    ${p.cancelado ? '' : botonPartido(p)}
  </article>`;
}

// ---------- Pantallas ----------
function vistaAcceso() {
  pantalla.innerHTML = `<section class="acceso">
    <div class="portada"><h1>Pachangueo</h1><p>Encuentra pachanga cerca de ti</p></div>
    <form novalidate>
      <h2>¡A jugar!</h2>
      <label class="campo"><span>Correo electrónico</span><input type="email" name="correo" autocomplete="email" placeholder="tu@correo.com" required></label>
      <label class="campo"><span>Contraseña</span><input type="password" name="clave" autocomplete="current-password" required></label>
      <p class="error" hidden></p>
      <button class="boton primario" type="submit">Entrar</button>
      <p class="centrado">¿No tienes cuenta? <button type="button" class="enlace" data-accion="registro">Regístrate</button></p>
      <p class="nota verde">Usamos tu ubicación para enseñarte las pistas y partidos de tu zona.</p>
      <p class="centrado"><small>Prototipo: entra con cualquier correo. La contraseña no se guarda.</small></p>
    </form>
  </section>`;
  const form = pantalla.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const error = form.querySelector('.error');
    if (!form.correo.value.trim() || !form.correo.checkValidity()) { error.textContent = 'Escribe un correo válido.'; error.hidden = false; return; }
    if (!form.clave.value) { error.textContent = 'Escribe la contraseña.'; error.hidden = false; return; }
    almacen.guardar(SESION, true);
    location.hash = '#/mapa';
  });
}

function vistaMapa(pistaId) {
  const pi = pistaId ? D.pista(pistaId) : null;
  let ficha = '';
  if (pi) {
    const partidos = D.partidosDePista(pi.id);
    const dist = posicion ? ` · a ${formatoKm(distanciaKm(posicion, pi))}` : '';
    ficha = `<div class="velo" data-accion="cerrar-ficha"></div>
      <section class="ficha" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo">
        <button class="asa" data-accion="cerrar-ficha" aria-label="Cerrar"></button>
        <div><h2 id="ficha-titulo">${esc(pi.nombre)}</h2>
          <p class="subtitulo">${pi.tipo === 'F7' ? 'Fútbol 7' : 'Fútbol 11'} · ${esc(pi.superficie)}${dist}</p></div>
        ${partidos.length ? partidos.map(tarjetaFicha).join('') : '<p class="vacio">Esta pista no tiene partidos. ¡Crea el primero!</p>'}
        <a class="boton secundario" href="#/crear/${encodeURIComponent(pi.id)}">+ Crear partido en esta pista</a>
      </section>`;
    mapa.irA(pi, window.innerHeight * 0.28);
  }
  pantalla.innerHTML = `<div class="capa-mapa">
      <header class="cabecera"><span class="logo">Pachangueo</span>
        <a class="zona" href="#/perfil" aria-label="Cambiar el radio de avisos">Toledo · ${D.usuario().radioKm} km</a></header>
      <div class="leyenda" aria-hidden="true">
        <span><i style="background:var(--estado-libre)"></i>Con plazas</span>
        <span><i style="background:var(--estado-completo)"></i>Llenas</span>
        <span><i style="background:var(--estado-sin-partido)"></i>Sin partido</span>
      </div>
      <button class="boton-centrar" data-accion="centrar" aria-label="Centrar el mapa en mí"></button>
    </div>${nav('mapa')}${ficha}`;
  if (pi) pantalla.querySelector('.ficha .asa').focus();
}

function vistaCrear(pistaId) {
  const pi = D.pista(pistaId);
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  const defecto = { F7: [10, 14], F11: [18, 22] };
  pantalla.innerHTML = `<section class="hoja sin-nav"><form class="contenido" novalidate>
    <div class="encabezado"><a class="volver" href="#/mapa/${encodeURIComponent(pi.id)}" aria-label="Volver">‹</a><h1>Crear partido</h1></div>
    <div class="pista-elegida"><span class="insignia">${esc(pi.tipo)}</span>
      <span><strong>${esc(pi.nombre)}</strong><small>Elegida en el mapa · ${esc(pi.superficie)}</small></span></div>
    <fieldset class="campo" style="border:0;padding:0;margin:0"><legend class="grupo-titulo">Modalidad</legend>
      <div class="selector">
        <label><input type="radio" name="modalidad" value="F7" ${pi.tipo === 'F7' ? 'checked' : ''}>Fútbol 7</label>
        <label><input type="radio" name="modalidad" value="F11" ${pi.tipo === 'F11' ? 'checked' : ''} ${pi.tipo === 'F7' ? 'disabled' : ''}>Fútbol 11</label>
      </div>
      ${pi.tipo === 'F7' ? '<small class="detalle">Esta pista es de fútbol 7.</small>' : ''}
    </fieldset>
    <label class="campo"><span>Fecha</span><input type="date" name="fecha" min="${isoDia(new Date())}" value="${isoDia(manana)}" required></label>
    <div class="dos">
      <label class="campo"><span>Empieza</span><input type="time" name="inicio" value="18:00" required></label>
      <label class="campo"><span>Termina</span><input type="time" name="fin" value="19:30" required></label>
    </div>
    <div class="campo"><span class="grupo-titulo">Jugadores</span><div class="dos">
      ${['minimo', 'maximo'].map((c) => `<div class="contador"><span id="et-${c}">${c === 'minimo' ? 'Mínimo' : 'Máximo'}</span>
        <div class="controles"><button type="button" class="redondo" data-paso="-1" data-campo="${c}" aria-label="Restar">−</button>
        <output name="${c}" aria-labelledby="et-${c}">0</output>
        <button type="button" class="redondo mas" data-paso="1" data-campo="${c}" aria-label="Sumar">+</button></div></div>`).join('')}
    </div></div>
    <p class="nota">Avisaremos a los jugadores que tengan esta pista dentro de su radio. Si no se llega al mínimo, te avisamos para que decidas si lo cancelas.</p>
    <p class="error" hidden></p>
    <button class="boton primario" type="submit">Publicar partido</button>
  </form></section>`;

  const form = pantalla.querySelector('form');
  const valores = {};
  const poner = (c, v) => { valores[c] = Math.max(2, Math.min(30, v)); form.elements[c].value = valores[c]; };
  const porModalidad = () => { const [mi, ma] = defecto[form.modalidad.value]; poner('minimo', mi); poner('maximo', ma); };
  porModalidad();
  form.addEventListener('change', (e) => { if (e.target.name === 'modalidad') porModalidad(); });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-paso]');
    if (b) poner(b.dataset.campo, valores[b.dataset.campo] + Number(b.dataset.paso));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = D.crearPartido({
      pistaId: pi.id, modalidad: form.modalidad.value, fecha: form.fecha.value,
      inicio: form.inicio.value, fin: form.fin.value, minimo: valores.minimo, maximo: valores.maximo,
    });
    if (r.error) { const err = form.querySelector('.error'); err.textContent = r.error; err.hidden = false; err.scrollIntoView({ block: 'center' }); return; }
    avisar('Partido publicado. Avisaremos a los jugadores de la zona.');
    location.hash = `#/mapa/${encodeURIComponent(pi.id)}`;
  });
}

function vistaPartidos(pestana) {
  let cuerpo;
  if (pestana === 'apunto') {
    const activos = D.misPartidos().filter((p) => !p.cancelado);
    const cancelados = D.misPartidos().filter((p) => p.cancelado);
    cuerpo = (activos.length ? activos.map(tarjetaMia).join('') : '<p class="vacio">No estás apuntado a ningún partido. Busca uno en el mapa.</p>')
      + (cancelados.length ? `<h2 class="grupo-titulo">Cancelados</h2>${cancelados.map(tarjetaMia).join('')}` : '');
  } else {
    const mios = D.organizados();
    cuerpo = mios.length ? mios.map(tarjetaMia).join('') : '<p class="vacio">No organizas ningún partido. Toca una pista del mapa para crear uno.</p>';
  }
  const nApunto = D.misPartidos().filter((p) => !p.cancelado).length;
  const nOrganizo = D.organizados().filter((p) => !p.cancelado).length;
  pantalla.innerHTML = `<section class="hoja superficie"><div class="contenido">
    <h1>Mis partidos</h1>
    <nav class="selector blanco" aria-label="Tipo de partidos">
      <a href="#/partidos/apunto" ${pestana === 'apunto' ? 'aria-current="page"' : ''}>Me apunto · ${nApunto}</a>
      <a href="#/partidos/organizo" ${pestana === 'organizo' ? 'aria-current="page"' : ''}>Organizo · ${nOrganizo}</a>
    </nav>
    ${cuerpo}
  </div></section>${nav('partidos')}`;
}

function vistaAvisos() {
  const lista = D.avisos();
  pantalla.innerHTML = `<section class="hoja superficie"><div class="contenido">
    <h1>Avisos</h1>
    ${lista.length ? `<ul class="lista">${lista.map((a) => `<li>
      <a class="aviso-item ${a.leido ? '' : 'no-leido'}" href="${a.pistaId ? `#/mapa/${encodeURIComponent(a.pistaId)}` : '#/avisos'}" style="text-decoration:none;color:inherit">
        <span class="icono" aria-hidden="true"></span><span><p>${esc(a.texto)}</p><small>${esc(a.hace)}</small></span></a></li>`).join('')}</ul>`
      : '<p class="vacio">No tienes avisos.</p>'}
    <p class="nota">En la app real también llegarán como notificaciones push al móvil.</p>
  </div></section>${nav('avisos')}`;
}

function vistaPerfil() {
  const u = D.usuario();
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = matchMedia('(display-mode: standalone)').matches;
  pantalla.innerHTML = `<section class="hoja superficie"><div class="contenido">
    <h1>Hola, ${esc(u.nombre)}</h1>
    <div class="tarjeta blanca">
      <label class="campo"><span>Radio de avisos: <output id="radio-valor">${u.radioKm} km</output></span>
        <input class="rango" type="range" min="1" max="10" step="1" value="${u.radioKm}" name="radio"></label>
      <p class="detalle">Te avisaremos de los partidos que se creen en pistas a esta distancia de tu última ubicación.</p>
    </div>
    ${instalada ? '<p class="nota verde">Estás usando Pachangueo instalada como app.</p>'
      : instalacion ? '<button class="boton primario" data-accion="instalar">Instalar Pachangueo</button>'
      : ios ? '<p class="nota verde">Para instalarla en el iPhone: botón Compartir y "Añadir a pantalla de inicio".</p>'
      : '<p class="nota">Para instalarla, usa la opción "Instalar app" del menú del navegador.</p>'}
    <button class="boton secundario" data-accion="reiniciar">Reiniciar los datos de la demo</button>
    <button class="boton peligro" data-accion="salir">Cerrar sesión</button>
  </div></section>${nav('perfil')}`;
  const rango = pantalla.querySelector('input[name=radio]');
  rango.addEventListener('input', () => { pantalla.querySelector('#radio-valor').textContent = `${rango.value} km`; mapa.cambiarRadio(Number(rango.value)); });
  rango.addEventListener('change', () => D.cambiarRadio(Number(rango.value)));
}

// ---------- Acciones ----------
function confirmar(titulo, texto, si) {
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `<h2>${esc(titulo)}</h2><p>${esc(texto)}</p>
    <div class="dos"><button class="boton secundario" value="no">Volver</button><button class="boton peligro" value="si">${esc(si)}</button></div>`;
  document.body.append(dlg);
  return new Promise((ok) => {
    dlg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) dlg.close(b.value); });
    dlg.addEventListener('close', () => { ok(dlg.returnValue === 'si'); dlg.remove(); });
    dlg.showModal();
  });
}

pantalla.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-accion]');
  if (!el) return;
  const id = el.dataset.id;
  switch (el.dataset.accion) {
    case 'apuntar': { const err = D.apuntar(id); avisar(err ?? '¡Apuntado! Lo tienes en Mis partidos.'); break; }
    case 'baja': { const err = D.darseDeBaja(id); avisar(err ?? 'Te has dado de baja.'); break; }
    case 'cancelar': {
      const p = D.partido(id);
      const otros = p.jugadores.length - 1;
      const texto = otros > 0 ? `Avisaremos a ${otros === 1 ? 'la persona apuntada' : `las ${otros} personas apuntadas`}.` : 'Todavía no hay nadie más apuntado.';
      if (await confirmar('¿Cancelar el partido?', texto, 'Sí, cancelar')) { const err = D.cancelar(id); avisar(err ?? 'Partido cancelado. Hemos avisado a los apuntados.'); }
      break;
    }
    case 'cerrar-ficha': location.hash = '#/mapa'; break;
    case 'centrar': mapa.centrar(); break;
    case 'registro': avisar('En el prototipo no hay registro: entra con cualquier correo.'); break;
    case 'instalar': if (instalacion) { instalacion.prompt(); await instalacion.userChoice; instalacion = null; render(); } break;
    case 'reiniciar': await D.reiniciar(); avisar('Datos de la demo reiniciados.'); break;
    case 'salir': almacen.borrar(SESION); ubicado = false; location.hash = '#/acceso'; break;
  }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ruta().nombre === 'mapa' && ruta().param) location.hash = '#/mapa'; });

// ---------- PWA ----------
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); instalacion = e; if (ruta().nombre === 'perfil') render(); });
window.addEventListener('appinstalled', () => { instalacion = null; avisar('¡Pachangueo instalada!'); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// ---------- Arranque ----------
await D.cargar();
D.alCambiar(render);
window.addEventListener('hashchange', render);
render();
