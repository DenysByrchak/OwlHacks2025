// Center on Philly
const PHILLY = [39.9526, -75.1652];
const map = L.map('map', { zoomControl: true }).setView(PHILLY, 12);
L.control.scale().addTo(map);

// Basemaps (no API keys)
const cartoVoyager = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 19 }
);
const cartoLight = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 19 }
);
const cartoDark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 19 }
);
const osmStandard = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap', subdomains: 'abc', maxZoom: 19 }
);
const osmHOT = L.tileLayer(
  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  { attribution: '&copy; OSM, HOT', subdomains: 'abc', maxZoom: 20 }
);
const esriTopo = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri — Esri, Garmin, USGS, etc.', maxZoom: 20 }
);

// Default layer + layer switcher
cartoLight.addTo(map);
const baseMaps = {
  "CARTO Voyager (colorful)": cartoVoyager,
  "CARTO Light (clean)": cartoLight,
  "CARTO Dark (night)": cartoDark,
  "OSM Standard": osmStandard,
  "OSM HOT (bright)": osmHOT,
  "Esri World Topo": esriTopo
};
L.control.layers(baseMaps, null, { collapsed:false }).addTo(map);

// Marker to echo the wireframe
L.marker([39.9526, -75.1639]).addTo(map).bindPopup("<b>Philadelphia City Hall</b>");

// CTA behavior
document.getElementById('cta').addEventListener('click', () => {
  // TODO: replace with your real route when ready
  window.location.href = './explore.html';
});
document.getElementById('cta').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
});
