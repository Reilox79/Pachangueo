// Mapa estilo Pokémon GO con MapLibre GL y los mapas vectoriales de OpenFreeMap (sin clave).
/* global maplibregl */
import { RADIO_TIERRA_KM, esc } from './util.js';

const C = {
  suelo: '#C4EBA8', manzana: '#B9E59E', parque: '#8ED177', bosque: '#86C96F', agua: '#78C6EE',
  calle: '#FFFFFF', borde: '#D9D3B4', camino: '#EFEBD3', verde: '#2E9E4F',
};

// Anchura de las calles según su clase y el zoom.
const anchura = (factor) => ['interpolate', ['exponential', 1.6], ['zoom'],
  12, ['*', factor, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 2.5, ['secondary', 'tertiary'], 1.6, 0.8]],
  18, ['*', factor, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 30, ['secondary', 'tertiary'], 24, 16]]];
// Las calles pequeñas solo aparecen al acercarse, para que el mapa quede limpio como en Pokémon GO.
const FILTRO_CALLES = ['any',
  ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
  ['all', ['==', ['get', 'class'], 'minor'], ['>=', ['zoom'], 14.5]],
  ['all', ['==', ['get', 'class'], 'service'], ['>=', ['zoom'], 16.5]]];

const ESTILO = {
  version: 8,
  sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
  layers: [
    { id: 'suelo', type: 'background', paint: { 'background-color': C.suelo } },
    { id: 'zonas', type: 'fill', source: 'omt', 'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'suburb', 'neighbourhood', 'commercial', 'industrial', 'retail']]],
      paint: { 'fill-color': C.manzana } },
    { id: 'vegetacion', type: 'fill', source: 'omt', 'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland', 'scrub']]],
      paint: { 'fill-color': ['match', ['get', 'class'], 'wood', C.bosque, C.parque], 'fill-opacity': 0.8 } },
    { id: 'parques', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.parque } },
    { id: 'agua', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.agua } },
    { id: 'rios', type: 'line', source: 'omt', 'source-layer': 'waterway',
      paint: { 'line-color': C.agua, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 18, 10] } },
    { id: 'caminos', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 16,
      filter: ['in', ['get', 'class'], ['literal', ['path', 'track', 'pedestrian']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.camino, 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1, 18, 5] } },
    { id: 'calles-borde', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: FILTRO_CALLES,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.borde, 'line-width': anchura(1.3) } },
    { id: 'calles', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: FILTRO_CALLES,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.calle, 'line-width': anchura(1) } },
  ],
};

/** Polígono aproximado de un círculo de radioKm alrededor de un punto. */
function circulo({ lat, lng }, radioKm, puntos = 72) {
  const coords = [];
  const dLat = (radioKm / RADIO_TIERRA_KM) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i <= puntos; i++) {
    const a = (i / puntos) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } };
}

export class Mapa {
  constructor(contenedor, centro, radioKm, alTocarPista) {
    this.alTocarPista = alTocarPista;
    this.marcadores = new Map();
    this.posicion = centro;
    this.radioKm = radioKm;
    this.mapa = new maplibregl.Map({
      container: contenedor,
      style: ESTILO,
      center: [centro.lng, centro.lat],
      zoom: 14, pitch: 52, bearing: -12, maxPitch: 65, minZoom: 11,
      attributionControl: false,
    });
    // La atribución (OpenFreeMap, OpenMapTiles, OpenStreetMap) la trae la propia fuente de datos.
    this.mapa.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    this.listo = new Promise((ok) => this.mapa.on('load', ok)).then(() => this.#capasRadio());

    const el = document.createElement('div');
    el.className = 'jugador';
    el.innerHTML = '<span class="pulso"></span><span class="pulso pulso-2"></span><span class="cuerpo"></span>';
    this.jugador = new maplibregl.Marker({ element: el, pitchAlignment: 'map', rotationAlignment: 'map' })
      .setLngLat([centro.lng, centro.lat]).addTo(this.mapa);
  }

  #capasRadio() {
    this.mapa.addSource('radio', { type: 'geojson', data: circulo(this.posicion, this.radioKm) });
    this.mapa.addLayer({ id: 'radio-relleno', type: 'fill', source: 'radio', paint: { 'fill-color': C.verde, 'fill-opacity': 0.08 } });
    this.mapa.addLayer({ id: 'radio-borde', type: 'line', source: 'radio',
      paint: { 'line-color': C.verde, 'line-opacity': 0.7, 'line-width': 2, 'line-dasharray': [3, 2] } });
  }

  async #actualizarRadio() {
    await this.listo;
    this.mapa.getSource('radio').setData(circulo(this.posicion, this.radioKm));
  }

  moverJugador(pos) {
    this.posicion = pos;
    this.jugador.setLngLat([pos.lng, pos.lat]);
    this.#actualizarRadio();
  }

  cambiarRadio(km) {
    this.radioKm = km;
    this.#actualizarRadio();
  }

  centrar() {
    this.mapa.flyTo({ center: [this.posicion.lng, this.posicion.lat], zoom: 14, pitch: 52, bearing: -12, duration: 900 });
  }

  irA(pos, desplazarArriba = 0) {
    this.mapa.easeTo({ center: [pos.lng, pos.lat], zoom: Math.max(this.mapa.getZoom(), 15), offset: [0, -desplazarArriba], duration: 600 });
  }

  /** pistas: [{ id, nombre, tipo, lat, lng, estado, globo }] */
  pintarPistas(pistas, elegida = null) {
    const vistas = new Set();
    for (const p of pistas) {
      vistas.add(p.id);
      let m = this.marcadores.get(p.id);
      if (!m) {
        const el = document.createElement('button');
        el.type = 'button';
        el.addEventListener('click', (e) => { e.stopPropagation(); this.alTocarPista(p.id); });
        m = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(this.mapa);
        this.marcadores.set(p.id, m);
      }
      const el = m.getElement();
      el.className = `marcador ${p.estado}${p.id === elegida ? ' elegida' : ''}`;
      const texto = { libre: 'con plazas', completa: 'completa', sin: 'sin partidos' }[p.estado];
      el.setAttribute('aria-label', `${p.nombre}, ${texto}`);
      el.innerHTML = `<span class="sombra"></span><span class="poste"></span><span class="halo"></span>
        <span class="cabeza">${esc(p.tipo)}</span>${p.globo ? `<span class="globo">${esc(p.globo)}</span>` : ''}`;
    }
    for (const [id, m] of this.marcadores) if (!vistas.has(id)) { m.remove(); this.marcadores.delete(id); }
  }

  /** fn recibe el punto tocado: { lat, lng }. */
  alTocarFondo(fn) { this.mapa.on('click', (e) => fn({ lat: e.lngLat.lat, lng: e.lngLat.lng })); }

  // ---------- Marcar la zona a mano ----------
  /** Cambia el jugador por un pin que se puede arrastrar; alMover recibe la nueva posición. */
  marcarZona(pos, alMover) {
    if (!this.pin) {
      const el = document.createElement('div');
      el.className = 'pin-zona';
      el.setAttribute('aria-label', 'Tu zona: arrástrala o toca el mapa');
      el.innerHTML = '<span class="cabeza"></span><span class="palo"></span><span class="sombra"></span>';
      this.pin = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: true });
      this.pin.on('drag', () => { const { lat, lng } = this.pin.getLngLat(); this.posicion = { lat, lng }; this.#actualizarRadio(); });
      this.pin.on('dragend', () => { const { lat, lng } = this.pin.getLngLat(); this.alMoverPin?.({ lat, lng }); });
    }
    this.alMoverPin = alMover;
    this.jugador.getElement().hidden = true;
    this.pin.setLngLat([pos.lng, pos.lat]).addTo(this.mapa);
    this.posicion = pos;
    this.#actualizarRadio();
    this.mapa.easeTo({ center: [pos.lng, pos.lat], zoom: 14, offset: [0, -window.innerHeight * 0.12], duration: 600 });
  }

  moverPin(pos) {
    if (!this.pin) return;
    this.pin.setLngLat([pos.lng, pos.lat]);
    this.posicion = pos;
    this.#actualizarRadio();
  }

  /** Quita el pin y vuelve a poner al jugador en pos. */
  terminarZona(pos) {
    this.pin?.remove();
    this.jugador.getElement().hidden = false;
    this.moverJugador(pos);
  }
}
